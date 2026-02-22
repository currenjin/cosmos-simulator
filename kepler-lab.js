const view = document.querySelector("#kepler-view");
if (!view) {
  throw new Error("#kepler-view element not found");
}

const aInput = document.querySelector("#kepler-a");
const eInput = document.querySelector("#kepler-e");
const periodEl = document.querySelector("#kepler-period");
const t2El = document.querySelector("#kepler-t2");
const a3El = document.querySelector("#kepler-a3");
const lawCheckEl = document.querySelector("#kepler-law-check");
const cEl = document.querySelector("#kepler-c");
const periEl = document.querySelector("#kepler-peri");
const apheEl = document.querySelector("#kepler-aphe");
const l1CheckEl = document.querySelector("#kepler-l1-check");
const rEl = document.querySelector("#kepler-r");
const forceEl = document.querySelector("#kepler-force");

const planetSelect = document.querySelector("#kepler-planet");
const planetAEl = document.querySelector("#planet-a");
const planetRealTEl = document.querySelector("#planet-real-t");
const planetTheoryTEl = document.querySelector("#planet-theory-t");
const planetErrorEl = document.querySelector("#planet-error");

const canvas = document.querySelector("#kepler-canvas");
const ctx = canvas.getContext("2d");
const tutorialOpenBtn = document.querySelector("#kepler-tutorial-open");

const PLANETS = [
  { key: "Mercury", a: 0.387, period: 0.241 },
  { key: "Venus", a: 0.723, period: 0.615 },
  { key: "Earth", a: 1.0, period: 1.0 },
  { key: "Mars", a: 1.524, period: 1.881 },
  { key: "Jupiter", a: 5.203, period: 11.862 },
  { key: "Saturn", a: 9.537, period: 29.457 },
  { key: "Uranus", a: 19.191, period: 84.017 },
  { key: "Neptune", a: 30.07, period: 164.79 }
];

const state = {
  a: 1,
  e: 0.45,
  M: 0,
  lastTs: 0,
  active: false,
  sweepPrev: null,
  sweepTimer: 0,
  tutorialIndex: -1,
  tutorialReady: false
};

const tutorialState = {
  overlay: null,
  stepEl: null,
  titleEl: null,
  bodyEl: null,
  prevBtn: null,
  nextBtn: null,
  closeBtn: null,
  activeTarget: null
};

const TUTORIAL_STEPS = [
  {
    selector: "#kepler-e",
    ko: {
      title: "1단계: 1법칙(타원 궤도)",
      body: "이심률 e를 조절해 궤도 타원이 얼마나 찌그러지는지 보세요. 태양은 항상 한 초점에 고정됩니다."
    },
    en: {
      title: "Step 1: First Law (Ellipse)",
      body: "Change eccentricity e and observe how the orbit stretches while the Sun stays at one focus."
    }
  },
  {
    selector: "#kepler-canvas",
    ko: {
      title: "2단계: 2법칙(면적 속도 일정)",
      body: "캔버스의 노란 면적 쐐기를 보세요. 같은 시간 간격마다 쓸어가는 면적이 거의 같게 유지됩니다."
    },
    en: {
      title: "Step 2: Second Law (Equal Areas)",
      body: "Watch the yellow swept sector. Equal time intervals sweep nearly equal areas."
    }
  },
  {
    selector: "#kepler-a",
    ko: {
      title: "3단계: 3법칙(T² ∝ a³)",
      body: "반장축 a를 바꾸면 주기 T가 함께 변합니다. 아래 수치에서 T²/a³ 값이 1에 가까운지 확인하세요."
    },
    en: {
      title: "Step 3: Third Law (T² ∝ a³)",
      body: "Adjust semi-major axis a and compare the resulting period T. Check that T²/a³ stays near 1."
    }
  },
  {
    selector: "#kepler-force",
    ko: {
      title: "4단계: 뉴턴 연결(역제곱 법칙)",
      body: "현재 거리 r와 힘 비율을 보며 r이 작아질수록 중력이 빠르게 강해지는 이유를 확인합니다."
    },
    en: {
      title: "Step 4: Newton Link (Inverse Square)",
      body: "Compare current r and force ratio to see how gravity rises quickly as distance decreases."
    }
  },
  {
    selector: "#kepler-planet",
    ko: {
      title: "5단계: 실제 데이터 검증",
      body: "행성을 바꿔 실측 주기와 이론 주기를 비교하세요. 법칙이 실제 천체 데이터와 연결됩니다."
    },
    en: {
      title: "Step 5: Validate with Real Data",
      body: "Switch planets and compare observed vs theoretical periods to connect law and observation."
    }
  }
];

aInput.addEventListener("input", () => {
  state.a = Number(aInput.value);
  renderStaticInfo();
});
eInput.addEventListener("input", () => {
  state.e = Number(eInput.value);
  renderStaticInfo();
});

planetSelect.addEventListener("change", renderPlanetData);
tutorialOpenBtn?.addEventListener("click", () => {
  openTutorial(0);
});

window.addEventListener("kepler:activate", () => {
  state.active = true;
  ensureCanvasSize();
  renderStaticInfo();
  renderPlanetData();
  if (!state.lastTs) requestAnimationFrame(loop);
});

window.addEventListener("cosmos:settings-changed", () => {
  populatePlanets();
  renderStaticInfo();
  renderPlanetData();
  refreshTutorialText();
});

window.addEventListener("resize", ensureCanvasSize);

initialize();

function initialize() {
  populatePlanets();
  ensureCanvasSize();
  renderStaticInfo();
  renderPlanetData();
  ensureTutorial();

  if (location.hash === "#kepler") {
    state.active = true;
    requestAnimationFrame(loop);
  }
}

function ensureTutorial() {
  if (state.tutorialReady) return;

  const overlay = document.createElement("aside");
  overlay.className = "lab-tutorial-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="lab-tutorial-head">
      <strong>Kepler Tutorial</strong>
      <span class="lab-tutorial-step"></span>
    </div>
    <div class="lab-tutorial-body">
      <h4></h4>
      <p></p>
    </div>
    <div class="lab-tutorial-actions">
      <button type="button" class="tutorial-prev"></button>
      <button type="button" class="tutorial-next primary"></button>
      <button type="button" class="tutorial-close"></button>
    </div>
  `;
  view.appendChild(overlay);

  tutorialState.overlay = overlay;
  tutorialState.stepEl = overlay.querySelector(".lab-tutorial-step");
  tutorialState.titleEl = overlay.querySelector("h4");
  tutorialState.bodyEl = overlay.querySelector("p");
  tutorialState.prevBtn = overlay.querySelector(".tutorial-prev");
  tutorialState.nextBtn = overlay.querySelector(".tutorial-next");
  tutorialState.closeBtn = overlay.querySelector(".tutorial-close");

  tutorialState.prevBtn.addEventListener("click", () => openTutorial(state.tutorialIndex - 1));
  tutorialState.nextBtn.addEventListener("click", () => {
    if (state.tutorialIndex >= TUTORIAL_STEPS.length - 1) {
      closeTutorial();
    } else {
      openTutorial(state.tutorialIndex + 1);
    }
  });
  tutorialState.closeBtn.addEventListener("click", closeTutorial);

  state.tutorialReady = true;
  refreshTutorialText();
}

function refreshTutorialText() {
  if (!state.tutorialReady) return;
  const lang = getLanguage();
  if (tutorialOpenBtn) tutorialOpenBtn.textContent = lang === "en" ? "Start Tutorial" : "튜토리얼 시작";
  tutorialState.prevBtn.textContent = lang === "en" ? "Previous" : "이전";
  tutorialState.closeBtn.textContent = lang === "en" ? "Close" : "닫기";
  tutorialState.nextBtn.textContent = lang === "en" ? "Next" : "다음";

  if (state.tutorialIndex >= 0) {
    renderTutorialStep();
  }
}

function openTutorial(index) {
  ensureTutorial();
  const nextIndex = clampIndex(index, 0, TUTORIAL_STEPS.length - 1);
  state.tutorialIndex = nextIndex;
  tutorialState.overlay.hidden = false;
  renderTutorialStep();
}

function renderTutorialStep() {
  const step = TUTORIAL_STEPS[state.tutorialIndex];
  const lang = getLanguage();
  const copy = lang === "en" ? step.en : step.ko;

  tutorialState.stepEl.textContent = `${state.tutorialIndex + 1} / ${TUTORIAL_STEPS.length}`;
  tutorialState.titleEl.textContent = copy.title;
  tutorialState.bodyEl.textContent = copy.body;
  tutorialState.prevBtn.disabled = state.tutorialIndex <= 0;
  tutorialState.nextBtn.textContent =
    state.tutorialIndex >= TUTORIAL_STEPS.length - 1 ? (lang === "en" ? "Finish" : "완료") : lang === "en" ? "Next" : "다음";

  focusTutorialTarget(step.selector);
}

function focusTutorialTarget(selector) {
  if (tutorialState.activeTarget) {
    tutorialState.activeTarget.classList.remove("tutorial-focus");
    tutorialState.activeTarget = null;
  }

  const target = document.querySelector(selector);
  if (!target) return;

  target.classList.add("tutorial-focus");
  tutorialState.activeTarget = target;
  target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
}

function closeTutorial() {
  state.tutorialIndex = -1;
  if (tutorialState.overlay) tutorialState.overlay.hidden = true;
  if (tutorialState.activeTarget) {
    tutorialState.activeTarget.classList.remove("tutorial-focus");
    tutorialState.activeTarget = null;
  }
}

function populatePlanets() {
  const lang = getLanguage();
  const current = planetSelect.value;
  planetSelect.innerHTML = PLANETS.map((p) => `<option value="${p.key}">${lang === "en" ? p.key : toKoreanPlanet(p.key)}</option>`).join("");
  planetSelect.value = current || "Earth";
}

function renderPlanetData() {
  const selected = PLANETS.find((p) => p.key === planetSelect.value) || PLANETS[2];
  const tTheory = Math.sqrt(selected.a ** 3);
  const error = ((tTheory - selected.period) / selected.period) * 100;

  planetAEl.textContent = `${selected.a.toFixed(3)} AU`;
  planetRealTEl.textContent = `${selected.period.toFixed(3)} ${yearLabel()}`;
  planetTheoryTEl.textContent = `${tTheory.toFixed(3)} ${yearLabel()}`;
  planetErrorEl.textContent = `${error.toFixed(2)}%`;
}

function renderStaticInfo() {
  const T = Math.sqrt(state.a ** 3);
  const t2 = T * T;
  const a3 = state.a ** 3;
  const ratio = t2 / a3;
  const c = state.a * state.e;
  const q = state.a * (1 - state.e);
  const Q = state.a * (1 + state.e);

  periodEl.textContent = `${T.toFixed(3)} ${yearLabel()}`;
  t2El.textContent = t2.toFixed(3);
  a3El.textContent = a3.toFixed(3);
  cEl.textContent = `${c.toFixed(3)} AU`;
  periEl.textContent = `${q.toFixed(3)} AU`;
  apheEl.textContent = `${Q.toFixed(3)} AU`;

  if (getLanguage() === "en") {
    lawCheckEl.textContent = `Check: T²/a³ = ${ratio.toFixed(3)} (close to 1)`;
    l1CheckEl.textContent = `Ellipse check: c/a = ${state.e.toFixed(2)} and Sun stays at one focus.`;
  } else {
    lawCheckEl.textContent = `검증: T²/a³ = ${ratio.toFixed(3)} (1에 가까움)`;
    l1CheckEl.textContent = `타원 검증: c/a = ${state.e.toFixed(2)} 이고 태양은 한 초점에 위치합니다.`;
  }
}

function loop(ts) {
  if (!state.active && location.hash !== "#kepler") {
    state.lastTs = 0;
    return;
  }

  if (view.hidden || !document.body.classList.contains("kepler-mode")) {
    requestAnimationFrame(loop);
    return;
  }

  const dt = Math.min(0.05, (ts - (state.lastTs || ts)) / 1000);
  state.lastTs = ts;

  const T = Math.sqrt(state.a ** 3);
  const n = (Math.PI * 2) / T;
  state.M = (state.M + n * dt * 2.4) % (Math.PI * 2);

  const E = solveKepler(state.M, state.e);
  const pos = orbitalPosition(E, state.e);

  state.sweepTimer += dt;
  if (state.sweepTimer > 0.9 || !state.sweepPrev) {
    state.sweepPrev = { ...pos };
    state.sweepTimer = 0;
  }

  drawScene(pos, state.sweepPrev);
  updateNewtonInfo(pos.r);

  requestAnimationFrame(loop);
}

function drawScene(pos, prevPos) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.fillStyle = "#07101f";
  ctx.fillRect(0, 0, w, h);

  const focusX = w * 0.38;
  const focusY = h * 0.54;
  const aDraw = mapLog(state.a, 0.4, 30, 80, Math.min(190, w * 0.34));
  const bDraw = aDraw * Math.sqrt(1 - state.e ** 2);

  // Orbit relative to focus (sun at focus)
  ctx.strokeStyle = "rgba(126,182,255,0.52)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i <= 360; i += 2) {
    const t = (i * Math.PI) / 180;
    const x = focusX + aDraw * Math.cos(t) - state.e * aDraw;
    const y = focusY + bDraw * Math.sin(t);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const px = focusX + aDraw * (Math.cos(pos.E) - state.e);
  const py = focusY + bDraw * Math.sin(pos.E);

  const ppx = focusX + aDraw * (Math.cos(prevPos.E) - state.e);
  const ppy = focusY + bDraw * Math.sin(prevPos.E);

  // Areal sweep visual (Kepler 2nd law)
  ctx.fillStyle = "rgba(248,202,120,0.22)";
  ctx.beginPath();
  ctx.moveTo(focusX, focusY);
  ctx.lineTo(ppx, ppy);
  ctx.lineTo(px, py);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f6c97d";
  ctx.beginPath();
  ctx.arc(focusX, focusY, 8, 0, Math.PI * 2);
  ctx.fill();

  const glow = ctx.createRadialGradient(px, py, 3, px, py, 18);
  glow.addColorStop(0, "rgba(115,210,255,1)");
  glow.addColorStop(1, "rgba(115,210,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(px, py, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#9fe1ff";
  ctx.beginPath();
  ctx.arc(px, py, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#cde4ff";
  ctx.font = "12px Space Grotesk, sans-serif";
  ctx.fillText(getLanguage() === "en" ? "Sun (focus)" : "태양(초점)", focusX + 12, focusY - 10);
  ctx.fillText(getLanguage() === "en" ? "Planet" : "행성", px + 10, py - 8);
}

function updateNewtonInfo(rAu) {
  const forceRatio = 1 / (rAu * rAu);
  if (getUnit() === "imperial") {
    const miles = rAu * 92955807;
    rEl.textContent = `${rAu.toFixed(3)} AU (${Math.round(miles).toLocaleString()} mi)`;
  } else {
    const km = rAu * 149597870;
    rEl.textContent = `${rAu.toFixed(3)} AU (${Math.round(km).toLocaleString()} km)`;
  }

  forceEl.textContent = `${forceRatio.toFixed(3)}x`;
}

function solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 7; i += 1) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  return E;
}

function orbitalPosition(E, e) {
  const x = Math.cos(E) - e;
  const y = Math.sqrt(1 - e * e) * Math.sin(E);
  const r = 1 - e * Math.cos(E);
  return { x, y, r, E };
}

function ensureCanvasSize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, Math.floor(rect.width));
  const height = Math.max(260, Math.floor(rect.height));

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function mapLog(value, min, max, outMin, outMax) {
  const t = (Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
  return outMin + (outMax - outMin) * t;
}

function clampIndex(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function yearLabel() {
  return getLanguage() === "en" ? "yr" : "년";
}

function toKoreanPlanet(name) {
  return (
    {
      Mercury: "수성",
      Venus: "금성",
      Earth: "지구",
      Mars: "화성",
      Jupiter: "목성",
      Saturn: "토성",
      Uranus: "천왕성",
      Neptune: "해왕성"
    }[name] || name
  );
}

function getLanguage() {
  return window.cosmosSettings?.get()?.language === "en" ? "en" : "ko";
}

function getUnit() {
  return window.cosmosSettings?.get()?.unit === "imperial" ? "imperial" : "astro";
}
