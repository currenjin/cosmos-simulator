const view = document.querySelector("#dynamics-view");
if (!view) {
  throw new Error("#dynamics-view element not found");
}

const massInput = document.querySelector("#dyn-mass");
const forceInput = document.querySelector("#dyn-force");
const thrustBtn = document.querySelector("#dyn-thrust-btn");
const resetBtn = document.querySelector("#dyn-reset-btn");
const accEl = document.querySelector("#dyn-acc");
const velEl = document.querySelector("#dyn-vel");
const reactionEl = document.querySelector("#dyn-reaction");

const thrustCanvas = document.querySelector("#dyn-thrust-canvas");
const thrustCtx = thrustCanvas.getContext("2d");

const orbitCanvas = document.querySelector("#dyn-orbit-canvas");
const orbitCtx = orbitCanvas.getContext("2d");
const kEl = document.querySelector("#dyn-k");
const uEl = document.querySelector("#dyn-u");
const eEl = document.querySelector("#dyn-e");
const lEl = document.querySelector("#dyn-l");
const eDriftEl = document.querySelector("#dyn-e-drift");
const lDriftEl = document.querySelector("#dyn-l-drift");

const thrustState = {
  x: 80,
  v: 0,
  flash: 0
};

const orbitState = {
  x: 1,
  y: 0,
  vx: 0,
  vy: 0.95,
  mu: 1,
  e0: null,
  l0: null
};

let running = false;
let lastTs = 0;

thrustBtn.addEventListener("click", applyThrust);
resetBtn.addEventListener("click", resetThrust);
massInput.addEventListener("input", updateNewtonPanel);
forceInput.addEventListener("input", updateNewtonPanel);

window.addEventListener("dynamics:activate", () => {
  ensureCanvasSizes();
  updateNewtonPanel();
  if (!running) {
    running = true;
    requestAnimationFrame(loop);
  }
});

window.addEventListener("cosmos:settings-changed", () => {
  updateNewtonPanel();
});

window.addEventListener("resize", ensureCanvasSizes);

initialize();

function initialize() {
  ensureCanvasSizes();
  updateNewtonPanel();
  initOrbitBaseline();

  if (location.hash === "#dynamics") {
    running = true;
    requestAnimationFrame(loop);
  }
}

function applyThrust() {
  const m = Number(massInput.value);
  const F = Number(forceInput.value);
  const a = F / m;

  thrustState.v += a;
  thrustState.flash = 1;
  updateNewtonPanel();
}

function resetThrust() {
  thrustState.x = 80;
  thrustState.v = 0;
  thrustState.flash = 0;
  initOrbitBaseline();
  updateNewtonPanel();
}

function updateNewtonPanel() {
  const m = Number(massInput.value);
  const F = Number(forceInput.value);
  const a = F / m;

  accEl.textContent = `${a.toFixed(2)} ${getLanguage() === "en" ? "units/s²" : "단위/s²"}`;
  velEl.textContent = `${thrustState.v.toFixed(2)} ${getLanguage() === "en" ? "units/s" : "단위/s"}`;

  const reactionText = getLanguage() === "en" ? `${F.toFixed(1)} N and opposite` : `${F.toFixed(1)} N, 같은 크기 반대 방향`;
  reactionEl.textContent = reactionText;
}

function ensureCanvasSizes() {
  resizeCanvas(thrustCanvas, thrustCtx);
  resizeCanvas(orbitCanvas, orbitCtx);
}

function resizeCanvas(canvas, ctx) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, Math.floor(rect.width));
  const height = Math.max(220, Math.floor(rect.height));

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function loop(ts) {
  if (!running) return;

  if (view.hidden || !document.body.classList.contains("dynamics-mode")) {
    requestAnimationFrame(loop);
    return;
  }

  const dt = Math.min(0.04, (ts - (lastTs || ts)) / 1000);
  lastTs = ts;

  stepThrust(dt);
  stepOrbit(dt);
  drawThrustScene();
  drawOrbitScene();

  requestAnimationFrame(loop);
}

function stepThrust(dt) {
  thrustState.x += thrustState.v * dt * 18;
  const w = thrustCanvas.clientWidth;

  if (thrustState.x > w - 60) {
    thrustState.x = w - 60;
    thrustState.v *= -0.4;
  }
  if (thrustState.x < 40) {
    thrustState.x = 40;
    thrustState.v *= -0.4;
  }

  thrustState.v *= 0.999;
  thrustState.flash = Math.max(0, thrustState.flash - dt * 2.4);
}

function drawThrustScene() {
  const w = thrustCanvas.clientWidth;
  const h = thrustCanvas.clientHeight;
  thrustCtx.fillStyle = "#07101d";
  thrustCtx.fillRect(0, 0, w, h);

  thrustCtx.strokeStyle = "rgba(130,175,255,0.32)";
  thrustCtx.lineWidth = 1;
  thrustCtx.beginPath();
  thrustCtx.moveTo(20, h - 40);
  thrustCtx.lineTo(w - 20, h - 40);
  thrustCtx.stroke();

  const y = h - 62;

  if (thrustState.flash > 0) {
    thrustCtx.fillStyle = `rgba(248,202,120,${0.4 * thrustState.flash})`;
    thrustCtx.beginPath();
    thrustCtx.moveTo(thrustState.x - 20, y + 8);
    thrustCtx.lineTo(thrustState.x - 40 - 40 * thrustState.flash, y + 16);
    thrustCtx.lineTo(thrustState.x - 20, y + 24);
    thrustCtx.closePath();
    thrustCtx.fill();
  }

  thrustCtx.fillStyle = "#87d9ff";
  thrustCtx.fillRect(thrustState.x - 20, y, 40, 24);

  thrustCtx.fillStyle = "#e4f0ff";
  thrustCtx.font = "12px Space Grotesk, sans-serif";
  thrustCtx.fillText(getLanguage() === "en" ? "Ship" : "우주선", thrustState.x - 14, y - 8);
}

function initOrbitBaseline() {
  const stats = orbitStats();
  orbitState.e0 = stats.E;
  orbitState.l0 = stats.L;
}

function stepOrbit(dt) {
  const r = Math.hypot(orbitState.x, orbitState.y);
  const ax = (-orbitState.mu * orbitState.x) / (r * r * r);
  const ay = (-orbitState.mu * orbitState.y) / (r * r * r);

  orbitState.vx += ax * dt;
  orbitState.vy += ay * dt;
  orbitState.x += orbitState.vx * dt;
  orbitState.y += orbitState.vy * dt;

  const stats = orbitStats();
  renderConservation(stats);
}

function orbitStats() {
  const r = Math.hypot(orbitState.x, orbitState.y);
  const v2 = orbitState.vx * orbitState.vx + orbitState.vy * orbitState.vy;
  const K = 0.5 * v2;
  const U = -orbitState.mu / r;
  const E = K + U;
  const L = orbitState.x * orbitState.vy - orbitState.y * orbitState.vx;
  return { r, K, U, E, L };
}

function renderConservation(stats) {
  kEl.textContent = stats.K.toFixed(4);
  uEl.textContent = stats.U.toFixed(4);
  eEl.textContent = stats.E.toFixed(4);
  lEl.textContent = stats.L.toFixed(4);

  const eDrift = orbitState.e0 ? Math.abs((stats.E - orbitState.e0) / orbitState.e0) * 100 : 0;
  const lDrift = orbitState.l0 ? Math.abs((stats.L - orbitState.l0) / orbitState.l0) * 100 : 0;

  eDriftEl.textContent = `${eDrift.toFixed(3)}%`;
  lDriftEl.textContent = `${lDrift.toFixed(3)}%`;
}

function drawOrbitScene() {
  const w = orbitCanvas.clientWidth;
  const h = orbitCanvas.clientHeight;
  orbitCtx.fillStyle = "#060f1e";
  orbitCtx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.52;
  const scale = Math.min(w, h) * 0.28;

  orbitCtx.fillStyle = "#f6c97d";
  orbitCtx.beginPath();
  orbitCtx.arc(cx, cy, 8, 0, Math.PI * 2);
  orbitCtx.fill();

  const px = cx + orbitState.x * scale;
  const py = cy + orbitState.y * scale;

  orbitCtx.strokeStyle = "rgba(120,170,255,0.34)";
  orbitCtx.lineWidth = 1;
  orbitCtx.beginPath();
  orbitCtx.moveTo(cx, cy);
  orbitCtx.lineTo(px, py);
  orbitCtx.stroke();

  orbitCtx.fillStyle = "#8fdfff";
  orbitCtx.beginPath();
  orbitCtx.arc(px, py, 5, 0, Math.PI * 2);
  orbitCtx.fill();

  orbitCtx.strokeStyle = "rgba(255,210,128,0.28)";
  orbitCtx.beginPath();
  orbitCtx.arc(cx, cy, scale, 0, Math.PI * 2);
  orbitCtx.stroke();
}

function getLanguage() {
  return window.cosmosSettings?.get()?.language === "en" ? "en" : "ko";
}
