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
  sweepTimer: 0
};

aInput.addEventListener("input", () => {
  state.a = Number(aInput.value);
  renderStaticInfo();
});
eInput.addEventListener("input", () => {
  state.e = Number(eInput.value);
  renderStaticInfo();
});

planetSelect.addEventListener("change", renderPlanetData);

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
});

window.addEventListener("resize", ensureCanvasSize);

initialize();

function initialize() {
  populatePlanets();
  ensureCanvasSize();
  renderStaticInfo();
  renderPlanetData();

  if (location.hash === "#kepler") {
    state.active = true;
    requestAnimationFrame(loop);
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
