import { TARGETS, EQUIPMENT_ORDER } from "./targets.js";

const COPY = {
  ko: {
    "settings.language": "언어",
    "settings.unit": "단위",
    "tab.planner": "플래너",
    "tab.simulator": "3D 시뮬레이터",
    "tab.journey": "코스믹 저니",
    "tab.kepler": "케플러 랩",
    "tab.dynamics": "동역학 랩",
    "planner.conditions": "관측 조건",
    "planner.latitude": "위도",
    "planner.longitude": "경도",
    "planner.date": "날짜",
    "planner.equipment": "장비",
    "planner.useLocation": "내 위치 사용",
    "planner.calculate": "추천 계산",
    "planner.hint": "기준: 태양 고도 -12° 이하(어두운 하늘), 대상 고도 25° 이상일 때 관측 가능으로 판단.",
    "planner.recommendations": "추천 대상",
    "planner.summaryTitle": "오늘 밤 요약",
    "planner.summaryNight": "{latlon} 기준, 어두운 하늘 구간은 약 {hours}시간입니다.",
    "planner.summaryTop": "최우선 추천은 {name} (점수 {score})이며, 최고 고도는 약 {alt}° 입니다.",
    "planner.summaryEmpty": "조건에 맞는 대상이 없습니다. 날짜 또는 장비를 조정해보세요.",
    "planner.resultCount": "{count}개",
    "planner.cardAlt": "최대 고도",
    "planner.cardVisible": "관측 가능",
    "planner.cardBest": "최적 시각",
    "planner.cardEquipment": "필요 장비",
    "planner.cardScore": "점수 {score}",
    "planner.noNight": "야간 구간 없음",
    "planner.locationBasis": "{latlon} 기준",
    "equipment.naked": "맨눈",
    "equipment.binocular": "쌍안경",
    "equipment.scope": "소형 망원경",
    "sim.title": "3D 하늘 시뮬레이터",
    "sim.subtitle": "드래그로 회전, 휠로 확대/축소. 별자리와 천체 레이어를 제어하세요.",
    "sim.focusOrion": "오리온",
    "sim.focusUrsa": "북두칠성",
    "sim.focusSummer": "여름 삼각형",
    "sim.constellations": "별자리 선",
    "sim.messier": "천체(Messier)",
    "sim.labels": "이름 라벨",
    "sim.time": "시간",
    "sim.live": "현재 시간 실시간",
    "sim.sync": "현재 위치/시간 맞추기",
    "journey.kicker": "Cosmic Perspective",
    "journey.title": "우주의 위대함을 체감하는 코스믹 저니",
    "journey.subtitle": "지구에서 출발해 관측 가능한 우주까지 스케일을 확장해보세요. 슬라이더를 움직이면 거리와 빛의 시간이 함께 변합니다.",
    "journey.scaleTitle": "우주 스케일 시뮬레이터",
    "journey.autoplayStart": "자동 항해 시작",
    "journey.scaleLabel": "스케일 단계",
    "journey.distance": "거리",
    "journey.lightTime": "빛의 시간",
    "journey.metaphor": "규모 비유",
    "journey.insightTitle": "빛의 시간 체험",
    "journey.aweTitle": "경이 포인트"
    ,
    "kepler.title": "케플러 법칙 학습 시뮬레이터",
    "kepler.subtitle": "현상을 보고 법칙을 이해한 뒤, 뉴턴 연결과 실제 행성 데이터로 검증합니다.",
    "kepler.p2l": "2) 현상 -> 2법칙",
    "kepler.l1": "1) 케플러 1법칙",
    "kepler.step1": "근일점에서 더 빨라지고 원일점에서 느려집니다.",
    "kepler.step2": "같은 시간 동안 쓸어가는 면적이 거의 같아집니다.",
    "kepler.step3": "이 현상을 케플러 2법칙(면적 속도 일정)으로 설명합니다.",
    "kepler.k3": "3) 케플러 3법칙",
    "kepler.a": "반장축 a (AU)",
    "kepler.e": "이심률 e",
    "kepler.focusDistance": "초점 거리 c",
    "kepler.peri": "근일점 q",
    "kepler.aphe": "원일점 Q",
    "kepler.period": "주기 T",
    "kepler.newton": "5) 뉴턴 연결",
    "kepler.newtonDesc": "현재 거리 r에서 중력은 F = GMm/r²로 계산되며, r이 작을수록 힘이 커집니다.",
    "kepler.currentR": "현재 r",
    "kepler.force": "지구 대비 힘",
    "kepler.data": "6) 실제 데이터 비교",
    "kepler.selectPlanet": "행성 선택",
    "kepler.realT": "실측 T",
    "kepler.theoryT": "이론 T(3법칙)",
    "kepler.error": "오차"
    ,
    "dyn.title": "동역학 랩: 뉴턴 + 보존법칙",
    "dyn.subtitle": "뉴턴 3법칙, 에너지 보존, 각운동량 보존을 하나의 상호작용으로 학습합니다.",
    "dyn.n123": "1) 뉴턴 운동 3법칙",
    "dyn.mass": "질량 m",
    "dyn.forceInput": "추력 F",
    "dyn.applyForce": "추력 1초 적용",
    "dyn.reset": "리셋",
    "dyn.acc": "가속도 a",
    "dyn.vel": "속도 v",
    "dyn.reaction": "작용-반작용",
    "dyn.conservation": "2) 에너지/각운동량 보존",
    "dyn.conservationDesc": "중력장 궤도에서 총 에너지 E와 각운동량 L이 거의 일정하게 유지되는지 확인하세요.",
    "dyn.eDrift": "E 변동",
    "dyn.lDrift": "L 변동"
  },
  en: {
    "settings.language": "Language",
    "settings.unit": "Units",
    "tab.planner": "Planner",
    "tab.simulator": "3D Sky",
    "tab.journey": "Cosmic Journey",
    "tab.kepler": "Kepler Lab",
    "tab.dynamics": "Dynamics Lab",
    "planner.conditions": "Observation Conditions",
    "planner.latitude": "Latitude",
    "planner.longitude": "Longitude",
    "planner.date": "Date",
    "planner.equipment": "Equipment",
    "planner.useLocation": "Use My Location",
    "planner.calculate": "Calculate",
    "planner.hint": "Rule: visible when Sun altitude <= -12° and target altitude >= 25°.",
    "planner.recommendations": "Recommended Targets",
    "planner.summaryTitle": "Tonight Summary",
    "planner.summaryNight": "At {latlon}, dark-sky window is about {hours} hours.",
    "planner.summaryTop": "Top pick is {name} (score {score}), peaking near {alt}° altitude.",
    "planner.summaryEmpty": "No targets matched. Try another date or equipment.",
    "planner.resultCount": "{count} targets",
    "planner.cardAlt": "Peak Altitude",
    "planner.cardVisible": "Visible Time",
    "planner.cardBest": "Best Time",
    "planner.cardEquipment": "Required Gear",
    "planner.cardScore": "Score {score}",
    "planner.noNight": "No dark window",
    "planner.locationBasis": "At {latlon}",
    "equipment.naked": "Naked-eye",
    "equipment.binocular": "Binocular",
    "equipment.scope": "Small Scope",
    "sim.title": "3D Sky Simulator",
    "sim.subtitle": "Drag to rotate, scroll to zoom. Toggle constellation and object layers.",
    "sim.focusOrion": "Orion",
    "sim.focusUrsa": "Big Dipper",
    "sim.focusSummer": "Summer Triangle",
    "sim.constellations": "Constellation Lines",
    "sim.messier": "Messier Objects",
    "sim.labels": "Labels",
    "sim.time": "Time",
    "sim.live": "Live Time",
    "sim.sync": "Sync To Current",
    "journey.kicker": "Cosmic Perspective",
    "journey.title": "Cosmic Journey Through Scale",
    "journey.subtitle": "Start from Earth and zoom to the observable universe. Move the slider to feel distance and light-time.",
    "journey.scaleTitle": "Scale Simulator",
    "journey.autoplayStart": "Start Auto Cruise",
    "journey.scaleLabel": "Scale Stage",
    "journey.distance": "Distance",
    "journey.lightTime": "Light Travel Time",
    "journey.metaphor": "Scale Metaphor",
    "journey.insightTitle": "Light-Time Insight",
    "journey.aweTitle": "Awe Notes",
    "kepler.title": "Kepler Law Learning Simulator",
    "kepler.subtitle": "Observe a phenomenon first, derive the law, connect with Newton, then validate with real data.",
    "kepler.p2l": "2) Phenomenon -> 2nd Law",
    "kepler.l1": "1) Kepler 1st Law",
    "kepler.step1": "Orbital speed increases near perihelion and decreases near aphelion.",
    "kepler.step2": "Equal times sweep nearly equal areas.",
    "kepler.step3": "This is Kepler's 2nd law (constant areal velocity).",
    "kepler.k3": "3) Kepler 3rd Law",
    "kepler.a": "Semi-major axis a (AU)",
    "kepler.e": "Eccentricity e",
    "kepler.focusDistance": "Focal distance c",
    "kepler.peri": "Perihelion q",
    "kepler.aphe": "Aphelion Q",
    "kepler.period": "Period T",
    "kepler.newton": "5) Newton Link",
    "kepler.newtonDesc": "At distance r, gravity follows F = GMm/r², so smaller r means stronger force.",
    "kepler.currentR": "Current r",
    "kepler.force": "Force vs Earth",
    "kepler.data": "6) Real Data Comparison",
    "kepler.selectPlanet": "Planet",
    "kepler.realT": "Observed T",
    "kepler.theoryT": "Theoretical T (3rd law)",
    "kepler.error": "Error",
    "dyn.title": "Dynamics Lab: Newton + Conservation",
    "dyn.subtitle": "Learn Newton's 3 laws, energy conservation, and angular momentum conservation interactively.",
    "dyn.n123": "1) Newton's Three Laws",
    "dyn.mass": "Mass m",
    "dyn.forceInput": "Thrust F",
    "dyn.applyForce": "Apply Thrust (1s)",
    "dyn.reset": "Reset",
    "dyn.acc": "Acceleration a",
    "dyn.vel": "Velocity v",
    "dyn.reaction": "Action-Reaction",
    "dyn.conservation": "2) Energy/Angular Momentum Conservation",
    "dyn.conservationDesc": "Check whether total energy E and angular momentum L stay nearly constant in orbit.",
    "dyn.eDrift": "E Drift",
    "dyn.lDrift": "L Drift"
  }
};

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
const keplerView = document.querySelector("#kepler-view");
const dynamicsView = document.querySelector("#dynamics-view");
const modeTabs = document.querySelectorAll(".mode-tab");

let lastRecommendations = [];
let lastContext = null;

initializeDefaults();
initializeModeTabs();
applyI18n();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculateRecommendations();
});

window.addEventListener("cosmos:settings-changed", () => {
  applyI18n();
  renderSummary(lastRecommendations, lastContext?.nightMinutes || 0, lastContext?.lat || 0, lastContext?.lon || 0);
  renderCards(lastRecommendations, lastContext?.lat || 0, lastContext?.lon || 0, lastContext?.nightTimes || []);
});

useLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert(getLanguage() === "en" ? "Geolocation is unavailable in this browser." : "이 브라우저에서는 위치 기능을 지원하지 않습니다.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitudeInput.value = position.coords.latitude.toFixed(4);
      longitudeInput.value = position.coords.longitude.toFixed(4);
      calculateRecommendations();
    },
    () => {
      alert(getLanguage() === "en" ? "Could not read location. Please enter manually." : "위치 정보를 가져오지 못했습니다. 직접 입력해주세요.");
    }
  );
});

function initializeDefaults() {
  const now = new Date();
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  dateInput.value = localDate;
  latitudeInput.value = "37.5665";
  longitudeInput.value = "126.9780";
  calculateRecommendations();
}

function initializeModeTabs() {
  const modeFromHash =
    location.hash === "#simulator"
      ? "simulator"
      : location.hash === "#journey"
        ? "journey"
        : location.hash === "#kepler"
          ? "kepler"
          : location.hash === "#dynamics"
            ? "dynamics"
            : "planner";
  setMode(modeFromHash);

  modeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const mode =
        tab.dataset.tab === "simulator"
          ? "simulator"
          : tab.dataset.tab === "journey"
            ? "journey"
            : tab.dataset.tab === "kepler"
              ? "kepler"
              : tab.dataset.tab === "dynamics"
                ? "dynamics"
                : "planner";
      setMode(mode);
      const hash =
        mode === "simulator"
          ? "#simulator"
          : mode === "journey"
            ? "#journey"
            : mode === "kepler"
              ? "#kepler"
              : mode === "dynamics"
                ? "#dynamics"
                : "#planner";
      history.replaceState(null, "", hash);
    });
  });
}

function setMode(mode) {
  const simulatorMode = mode === "simulator";
  const journeyMode = mode === "journey";
  const keplerMode = mode === "kepler";
  const dynamicsMode = mode === "dynamics";
  const plannerMode = !simulatorMode && !journeyMode && !keplerMode && !dynamicsMode;

  document.body.classList.toggle("planner-mode", plannerMode);
  document.body.classList.toggle("simulator-mode", simulatorMode);
  document.body.classList.toggle("journey-mode", journeyMode);
  document.body.classList.toggle("kepler-mode", keplerMode);
  document.body.classList.toggle("dynamics-mode", dynamicsMode);
  plannerView.hidden = !plannerMode;
  simulatorView.hidden = !simulatorMode;
  journeyView.hidden = !journeyMode;
  keplerView.hidden = !keplerMode;
  dynamicsView.hidden = !dynamicsMode;

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
  if (keplerMode) {
    window.dispatchEvent(new CustomEvent("kepler:activate"));
  }
  if (dynamicsMode) {
    window.dispatchEvent(new CustomEvent("dynamics:activate"));
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
    return { ...target, ...visibility };
  })
    .filter((item) => item.visibleMinutes > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  lastRecommendations = recommendations;
  lastContext = { lat, lon, equipment, nightMinutes: nightTimes.length * 10, nightTimes };

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
  return normalizeDeg(gmst + lonDeg) / 15;
}

function toJulianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function renderSummary(recommendations, nightMinutes, lat, lon) {
  if (!summaryEl) return;

  const top = recommendations[0];
  const summaryTitle = t("planner.summaryTitle");
  const nightText = format(t("planner.summaryNight"), {
    latlon: formatLatLon(lat, lon),
    hours: Math.round(nightMinutes / 60)
  });

  const topText = top
    ? format(t("planner.summaryTop"), {
        name: top.name,
        score: top.score,
        alt: top.maxAlt.toFixed(1)
      })
    : t("planner.summaryEmpty");

  summaryEl.innerHTML = `
    <h2>${summaryTitle}</h2>
    <p>${nightText}</p>
    <p>${topText}</p>
  `;
}

function renderCards(recommendations, lat, lon, nightTimes) {
  resultCards.innerHTML = "";
  resultCount.textContent = format(t("planner.resultCount"), { count: recommendations.length });

  recommendations.forEach((item) => {
    const node = cardTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".target-name").textContent = item.name;
    node.querySelector(".target-meta").textContent = `${item.type} | ${item.constellation} | mag ${item.magnitude}`;
    node.querySelector(".score-chip").textContent = format(t("planner.cardScore"), { score: item.score });

    node.querySelector(".stats").innerHTML = `
      <span>${t("planner.cardAlt")} <strong>${item.maxAlt.toFixed(1)}°</strong></span>
      <span>${t("planner.cardVisible")} <strong>${item.visibleMinutes}${getLanguage() === "en" ? " min" : "분"}</strong></span>
      <span>${t("planner.cardBest")} <strong>${item.bestTime ? formatTime(item.bestTime) : "-"}</strong></span>
      <span>${t("planner.cardEquipment")} <strong>${toEquipmentLabel(item.minEquipment)}</strong></span>
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
    ctx.fillText(t("planner.noNight"), 12, 20);
    return;
  }

  const span = nightTimes[nightTimes.length - 1].getTime() - nightTimes[0].getTime();

  ctx.strokeStyle = "#7be0ff";
  ctx.lineWidth = 2;
  ctx.beginPath();

  trace.forEach((point, index) => {
    const x = ((point.time.getTime() - nightTimes[0].getTime()) / span) * width;
    const y = height - (clamp(point.altDeg, 0, 90) / 90) * height;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
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
  ctx.fillText(format(t("planner.locationBasis"), { latlon: formatLatLon(lat, lon) }), 10, height - 8);
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const value = t(key);
    if (value) element.textContent = value;
  });
}

function toEquipmentLabel(equipment) {
  if (equipment === "naked-eye") return t("equipment.naked");
  if (equipment === "binocular") return t("equipment.binocular");
  return t("equipment.scope");
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

function getLanguage() {
  return window.cosmosSettings?.get()?.language === "en" ? "en" : "ko";
}

function t(key) {
  const lang = getLanguage();
  return COPY[lang][key] || COPY.ko[key] || key;
}

function format(template, vars) {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), template);
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
