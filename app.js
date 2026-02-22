import { TARGETS, EQUIPMENT_ORDER } from "./targets.js";

const form = document.querySelector("#planner-form");
const latitudeInput = document.querySelector("#latitude");
const longitudeInput = document.querySelector("#longitude");
const dateInput = document.querySelector("#date");
const equipmentInput = document.querySelector("#equipment");
const useLocationBtn = document.querySelector("#use-location");
const summaryEl = document.querySelector("#summary");
const resultCards = document.querySelector("#result-cards");
const resultCount = document.querySelector("#result-count");
const cardTemplate = document.querySelector("#card-template");
const plannerView = document.querySelector("#planner-view");
const simulatorView = document.querySelector("#simulator-view");
const journeyView = document.querySelector("#journey-view");
const modeTabs = document.querySelectorAll(".mode-tab");

initializeDefaults();
initializeModeTabs();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculateRecommendations();
});

useLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("이 브라우저에서는 위치 기능을 지원하지 않습니다.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitudeInput.value = position.coords.latitude.toFixed(4);
      longitudeInput.value = position.coords.longitude.toFixed(4);
    },
    () => {
      alert("위치 정보를 가져오지 못했습니다. 직접 입력해주세요.");
    }
  );
});

function initializeDefaults() {
  const now = new Date();
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
  dateInput.value = localDate;
  latitudeInput.value = "37.5665";
  longitudeInput.value = "126.9780";
  calculateRecommendations();
}

function initializeModeTabs() {
  const modeFromHash = location.hash === "#simulator" ? "simulator" : location.hash === "#journey" ? "journey" : "planner";
  setMode(modeFromHash);

  modeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const mode = tab.dataset.tab === "simulator" ? "simulator" : tab.dataset.tab === "journey" ? "journey" : "planner";
      setMode(mode);
      const hash = mode === "simulator" ? "#simulator" : mode === "journey" ? "#journey" : "#planner";
      history.replaceState(null, "", hash);
    });
  });
}

function setMode(mode) {
  const simulatorMode = mode === "simulator";
  const journeyMode = mode === "journey";
  const plannerMode = !simulatorMode && !journeyMode;

  document.body.classList.toggle("simulator-mode", simulatorMode);
  document.body.classList.toggle("journey-mode", journeyMode);
  plannerView.hidden = !plannerMode;
  simulatorView.hidden = !simulatorMode;
  journeyView.hidden = !journeyMode;

  modeTabs.forEach((tab) => {
    const active = tab.dataset.tab === mode;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });

  if (simulatorMode) {
    window.dispatchEvent(new CustomEvent("simulator:activate"));
  }
  if (journeyMode) {
    window.dispatchEvent(new CustomEvent("journey:activate"));
  }
}

function calculateRecommendations() {
  const lat = Number(latitudeInput.value);
  const lon = Number(longitudeInput.value);
  const equipment = equipmentInput.value;
  const dateStr = dateInput.value;

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !dateStr) {
    return;
  }

  const sampleTimes = buildSampleTimes(dateStr, 10);
  const nightTimes = sampleTimes.filter((time) => getSunAltitude(time, lat, lon) <= -12);

  const recommendations = TARGETS.map((target) => {
    const visibility = evaluateTarget(target, nightTimes, lat, lon, equipment);
    return {
      ...target,
      ...visibility
    };
  })
    .filter((item) => item.visibleMinutes > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  renderSummary(recommendations, nightTimes.length * 10, lat, lon);
  renderCards(recommendations, lat, lon, nightTimes);
}

function buildSampleTimes(dateStr, stepMinutes) {
  const start = new Date(`${dateStr}T16:00:00`);
  const end = new Date(start.getTime() + 14 * 60 * 60 * 1000);
  const result = [];

  for (let t = start.getTime(); t <= end.getTime(); t += stepMinutes * 60 * 1000) {
    result.push(new Date(t));
  }

  return result;
}

function evaluateTarget(target, nightTimes, lat, lon, equipment) {
  const trace = [];
  let maxAlt = -90;
  let bestTime = null;
  let visibleCount = 0;

  for (const time of nightTimes) {
    const { altDeg, azDeg } = getHorizontalCoords(target.raHours, target.decDeg, time, lat, lon);
    trace.push({ time, altDeg, azDeg });

    if (altDeg > maxAlt) {
      maxAlt = altDeg;
      bestTime = time;
    }

    if (altDeg >= 25) {
      visibleCount += 1;
    }
  }

  const visibleMinutes = visibleCount * 10;
  const equipmentGap = EQUIPMENT_ORDER[equipment] - EQUIPMENT_ORDER[target.minEquipment];
  const equipmentPenalty = equipmentGap >= 0 ? 0 : 18;

  const altitudeScore = clamp((maxAlt - 20) * 1.2, 0, 45);
  const magnitudeScore = clamp(18 - target.magnitude * 2.2, 0, 25);
  const windowScore = clamp(visibleMinutes / 8, 0, 25);
  const score = Math.round(altitudeScore + magnitudeScore + windowScore - equipmentPenalty);

  return {
    trace,
    maxAlt: Number.isFinite(maxAlt) ? maxAlt : -90,
    bestTime,
    visibleMinutes,
    score,
    equipmentPenalty
  };
}

function getHorizontalCoords(raHours, decDeg, date, latDeg, lonDeg) {
  const lstHours = getLocalSiderealTime(date, lonDeg);
  let hourAngleDeg = lstHours * 15 - raHours * 15;

  if (hourAngleDeg < -180) hourAngleDeg += 360;
  if (hourAngleDeg > 180) hourAngleDeg -= 360;

  const latRad = toRad(latDeg);
  const decRad = toRad(decDeg);
  const haRad = toRad(hourAngleDeg);

  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  const altRad = Math.asin(sinAlt);

  const y = -Math.sin(haRad) * Math.cos(decRad);
  const x = Math.sin(decRad) - Math.sin(altRad) * Math.sin(latRad);
  const azRad = Math.atan2(y, x / Math.cos(latRad));

  return {
    altDeg: toDeg(altRad),
    azDeg: normalizeDeg(toDeg(azRad))
  };
}

function getSunAltitude(date, latDeg, lonDeg) {
  const { raHours, decDeg } = getSunRaDec(date);
  return getHorizontalCoords(raHours, decDeg, date, latDeg, lonDeg).altDeg;
}

function getSunRaDec(date) {
  const jd = toJulianDay(date);
  const n = jd - 2451545.0;

  const L = normalizeDeg(280.46 + 0.9856474 * n);
  const g = normalizeDeg(357.528 + 0.9856003 * n);

  const lambda = normalizeDeg(L + 1.915 * Math.sin(toRad(g)) + 0.020 * Math.sin(toRad(2 * g)));
  const epsilon = 23.439 - 0.0000004 * n;

  const lambdaRad = toRad(lambda);
  const epsilonRad = toRad(epsilon);

  const raRad = Math.atan2(Math.cos(epsilonRad) * Math.sin(lambdaRad), Math.cos(lambdaRad));
  const decRad = Math.asin(Math.sin(epsilonRad) * Math.sin(lambdaRad));

  return {
    raHours: normalizeDeg(toDeg(raRad)) / 15,
    decDeg: toDeg(decRad)
  };
}

function getLocalSiderealTime(date, lonDeg) {
  const jd = toJulianDay(date);
  const t = (jd - 2451545.0) / 36525;

  let gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;

  gmst = normalizeDeg(gmst);
  const lst = normalizeDeg(gmst + lonDeg);
  return lst / 15;
}

function toJulianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function renderSummary(recommendations, nightMinutes, lat, lon) {
  const top = recommendations[0];

  summaryEl.innerHTML = `
    <h2>오늘 밤 요약</h2>
    <p>${formatLatLon(lat, lon)} 기준, 어두운 하늘 구간은 약 ${Math.round(
    nightMinutes / 60
  )}시간입니다.</p>
    <p>${
      top
        ? `최우선 추천은 <strong>${top.name}</strong> (점수 ${top.score})이며, 최고 고도는 약 ${top.maxAlt.toFixed(
            1
          )}° 입니다.`
        : "조건에 맞는 대상이 없습니다. 날짜 또는 장비를 조정해보세요."
    }</p>
  `;
}

function renderCards(recommendations, lat, lon, nightTimes) {
  resultCards.innerHTML = "";
  resultCount.textContent = `${recommendations.length}개`;

  recommendations.forEach((item) => {
    const node = cardTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".target-name").textContent = item.name;
    node.querySelector(
      ".target-meta"
    ).textContent = `${item.type} | ${item.constellation} | mag ${item.magnitude}`;
    node.querySelector(".score-chip").textContent = `점수 ${item.score}`;

    node.querySelector(".stats").innerHTML = `
      <span>최대 고도 <strong>${item.maxAlt.toFixed(1)}°</strong></span>
      <span>관측 가능 <strong>${item.visibleMinutes}분</strong></span>
      <span>최적 시각 <strong>${item.bestTime ? formatTime(item.bestTime) : "-"}</strong></span>
      <span>필요 장비 <strong>${toEquipmentLabel(item.minEquipment)}</strong></span>
    `;

    drawAltitudeChart(node.querySelector("canvas"), item.trace, lat, lon, nightTimes);
    resultCards.appendChild(node);
  });
}

function drawAltitudeChart(canvas, trace, lat, lon, nightTimes) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#07111f";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(130, 170, 255, 0.3)";
  ctx.lineWidth = 1;

  [0, 25, 45, 65].forEach((alt) => {
    const y = height - (alt / 90) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  });

  if (!trace.length || !nightTimes.length) {
    ctx.fillStyle = "#f0c879";
    ctx.font = "12px Space Grotesk";
    ctx.fillText("야간 구간 없음", 12, 20);
    return;
  }

  const span = nightTimes[nightTimes.length - 1].getTime() - nightTimes[0].getTime();

  ctx.strokeStyle = "#7be0ff";
  ctx.lineWidth = 2;
  ctx.beginPath();

  trace.forEach((point, index) => {
    const x = ((point.time.getTime() - nightTimes[0].getTime()) / span) * width;
    const y = height - (clamp(point.altDeg, 0, 90) / 90) * height;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  const visibleTrace = trace.filter((p) => p.altDeg >= 25);
  if (visibleTrace.length) {
    const best = visibleTrace.reduce((a, b) => (a.altDeg > b.altDeg ? a : b));
    const bestX = ((best.time.getTime() - nightTimes[0].getTime()) / span) * width;
    const bestY = height - (best.altDeg / 90) * height;

    ctx.fillStyle = "#ffd37b";
    ctx.beginPath();
    ctx.arc(bestX, bestY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#dce6ff";
  ctx.font = "11px IBM Plex Sans KR";
  ctx.fillText(`${formatLatLon(lat, lon)} 기준`, 10, height - 8);
}

function toEquipmentLabel(equipment) {
  if (equipment === "naked-eye") return "맨눈";
  if (equipment === "binocular") return "쌍안경";
  return "소형 망원경";
}

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function formatLatLon(lat, lon) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

function normalizeDeg(deg) {
  return ((deg % 360) + 360) % 360;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
