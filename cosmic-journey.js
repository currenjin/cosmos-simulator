const journeyView = document.querySelector("#journey-view");
if (!journeyView) {
  throw new Error("#journey-view element not found");
}

const scaleInput = document.querySelector("#journey-scale");
const autoplayButton = document.querySelector("#journey-autoplay");
const stageNameEl = document.querySelector("#journey-stage-name");
const stageDescriptionEl = document.querySelector("#journey-stage-description");
const distanceEl = document.querySelector("#journey-distance");
const lightTimeEl = document.querySelector("#journey-light-time");
const metaphorEl = document.querySelector("#journey-scale-metaphor");
const insightEl = document.querySelector("#journey-insight");
const aweListEl = document.querySelector("#journey-awe-list");
const scaleBarEl = document.querySelector("#journey-scale-bar");
const canvas = document.querySelector("#journey-canvas");
const ctx = canvas.getContext("2d");

const STAGES = [
  {
    name: "지구와 달",
    description: "우주를 향한 첫 거리감. 지구는 생각보다 작고, 달은 의외로 멀리 떨어져 있습니다.",
    distance: "38.4만 km",
    lightTime: "1.28초",
    metaphor: "농구공(지구)에서 탁구공(달)까지 약 7m",
    insight: "지금 달을 보면 1.28초 전의 달을 보고 있습니다.",
    color: "#93d8ff",
    radius: 18,
    awe: ["아폴로가 도달한 거리는 우주 스케일에선 여전히 '현관문 앞' 수준입니다.", "달의 중력은 지구의 약 1/6이라 점프 높이가 크게 달라집니다."]
  },
  {
    name: "태양",
    description: "생명의 에너지원. 지구에서 가장 가까운 별이지만 빛조차 8분 이상이 걸립니다.",
    distance: "1 AU (1억 4,960만 km)",
    lightTime: "8분 20초",
    metaphor: "지구가 쌀알이면 태양은 농구공 크기",
    insight: "해 질 무렵 보는 태양은 실제 현재 태양보다 8분 20초 과거 모습입니다.",
    color: "#ffcb74",
    radius: 26,
    awe: ["태양 내부에서 생성된 광자는 표면까지 나오는데 수만 년이 걸릴 수 있습니다.", "지구 전체 에너지 소비량보다 훨씬 큰 에너지가 매초 태양에서 방출됩니다."]
  },
  {
    name: "목성 궤도",
    description: "태양계의 거대한 스케일이 체감되는 구간. 행성 사이 간격은 상상보다 텅 비어 있습니다.",
    distance: "5.2 AU",
    lightTime: "43분",
    metaphor: "도시 하나를 건너야 다음 행성",
    insight: "태양빛이 목성에 닿는 데 약 43분, 돌아와 관측되기까지는 더 걸립니다.",
    color: "#ffd6a8",
    radius: 34,
    awe: ["목성 자기장은 지구보다 훨씬 강하며 거대한 방사선 벨트를 형성합니다.", "태양계 대부분의 질량은 태양과 목성에 집중되어 있습니다."]
  },
  {
    name: "카이퍼 벨트",
    description: "명왕성 밖 얼음 천체의 영역. 태양계 경계가 아직도 확장된 느낌을 줍니다.",
    distance: "30~50 AU",
    lightTime: "4~7시간",
    metaphor: "동네를 넘어 도시 외곽까지 확장",
    insight: "이 구간의 천체를 볼 때는 이미 몇 시간 전 빛을 보고 있는 셈입니다.",
    color: "#9cb8ff",
    radius: 42,
    awe: ["명왕성은 카이퍼 벨트 천체 중 하나이며 유일한 사례가 아닙니다.", "혜성의 상당수는 이 먼 얼음 저장고에서 유래합니다."]
  },
  {
    name: "오르트 구름",
    description: "태양계를 둘러싼 거대한 혜성 구름 가설 영역. 사실상 태양의 중력권 외곽입니다.",
    distance: "약 5만~10만 AU",
    lightTime: "0.8~1.6년",
    metaphor: "집 한 채가 대륙 끝까지 영향",
    insight: "태양권 끝의 사건을 본다는 건 거의 1년 전 기록을 보는 일입니다.",
    color: "#c8d8ff",
    radius: 54,
    awe: ["오르트 구름은 직접 관측이 어려워 이론과 궤도 분석으로 추정합니다.", "장주기 혜성은 이 외곽에서 수천~수만 년 주기로 돌아옵니다."]
  },
  {
    name: "우리은하",
    description: "수천억 개의 별이 속한 거대한 원반 은하. 태양계는 한 팔의 가장자리에 있습니다.",
    distance: "지름 약 10만 광년",
    lightTime: "최대 10만 년",
    metaphor: "모래알보다 작은 태양계가 거대한 도시 하나",
    insight: "은하 반대편 별을 본다면 인류 문명 이전의 빛을 보는 것입니다.",
    color: "#f2d9ff",
    radius: 66,
    awe: ["태양이 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년이 걸립니다.", "밤하늘 은하수는 우리은하 원반을 옆에서 보는 흔적입니다."]
  },
  {
    name: "국부은하군",
    description: "우리은하, 안드로메다, 삼각형은하 등 수십 개 은하가 중력으로 묶인 집단입니다.",
    distance: "약 1,000만 광년 규모",
    lightTime: "수백만 년",
    metaphor: "도시(은하)들이 모여 만든 거대 광역권",
    insight: "안드로메다를 볼 때 우리는 250만 년 전의 모습을 보고 있습니다.",
    color: "#f9c3ff",
    radius: 76,
    awe: ["우리은하와 안드로메다는 약 40억 년 후 충돌할 것으로 예측됩니다.", "은하군 사이에는 거의 완전한 암흑 공간이 펼쳐집니다."]
  },
  {
    name: "라니아케아 초은하단",
    description: "수많은 은하군이 거대한 중력 구조로 연결된 흐름의 일부입니다.",
    distance: "약 5.2억 광년",
    lightTime: "수억 년",
    metaphor: "지도 위 대륙 여러 개를 하나의 흐름으로 묶은 구조",
    insight: "우주의 대규모 구조를 보는 일은 지질시대보다 긴 과거를 보는 것입니다.",
    color: "#ffb9d0",
    radius: 86,
    awe: ["은하는 무작위가 아니라 필라멘트(실타래) 구조를 이룹니다.", "우주 팽창은 멀리 있는 구조일수록 더 빠르게 거리 증가를 유도합니다."]
  },
  {
    name: "관측 가능한 우주",
    description: "우리가 관측 가능한 한계 반경. 우주의 전체는 이보다 훨씬 클 수 있습니다.",
    distance: "반경 약 465억 광년",
    lightTime: "우주 나이 138억 년과 팽창 보정",
    metaphor: "끝이 보이지 않는 암흑 바다",
    insight: "보이는 우주는 빛이 도달한 범위일 뿐, 전체 우주는 아직 미지입니다.",
    color: "#ff9ea8",
    radius: 96,
    awe: ["관측 가능한 우주 안에는 대략 2조 개 규모의 은하가 있을 것으로 추정됩니다.", "우주의 경이로움은 '모른다'는 사실 자체에서 더 커집니다."]
  }
];

scaleInput.max = String(STAGES.length - 1);

const stars = Array.from({ length: 260 }, () => ({
  x: Math.random(),
  y: Math.random(),
  size: 0.4 + Math.random() * 1.6,
  twinkle: Math.random() * Math.PI * 2
}));

let activeIndex = 0;
let displayedIndex = 0;
let running = false;
let autoplayTimer = null;
let lastTs = 0;

scaleInput.addEventListener("input", () => {
  activeIndex = Number(scaleInput.value);
  stopAutoplay();
  updateText();
});

autoplayButton.addEventListener("click", () => {
  if (autoplayTimer) {
    stopAutoplay();
    return;
  }

  autoplayButton.textContent = "자동 항해 중지";
  autoplayTimer = window.setInterval(() => {
    activeIndex = (activeIndex + 1) % STAGES.length;
    scaleInput.value = String(activeIndex);
    updateText();
  }, 2400);
});

window.addEventListener("journey:activate", () => {
  ensureCanvasSize();
  if (!running) {
    running = true;
    requestAnimationFrame(animate);
  }
});

window.addEventListener("resize", ensureCanvasSize);

initialize();

function initialize() {
  const hashMode = location.hash === "#journey";
  updateText();
  ensureCanvasSize();

  if (hashMode) {
    running = true;
    requestAnimationFrame(animate);
  }
}

function stopAutoplay() {
  if (!autoplayTimer) return;
  window.clearInterval(autoplayTimer);
  autoplayTimer = null;
  autoplayButton.textContent = "자동 항해 시작";
}

function updateText() {
  const stage = STAGES[activeIndex];
  stageNameEl.textContent = stage.name;
  stageDescriptionEl.textContent = stage.description;
  distanceEl.textContent = stage.distance;
  lightTimeEl.textContent = stage.lightTime;
  metaphorEl.textContent = stage.metaphor;
  insightEl.textContent = stage.insight;

  scaleBarEl.style.setProperty("--scale-fill", `${((activeIndex + 1) / STAGES.length) * 100}%`);

  aweListEl.innerHTML = "";
  stage.awe.forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    aweListEl.appendChild(li);
  });
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

function animate(ts) {
  if (!running) return;

  if (journeyView.hidden || document.body.classList.contains("journey-mode") === false) {
    requestAnimationFrame(animate);
    return;
  }

  const delta = Math.min(32, ts - (lastTs || ts));
  lastTs = ts;

  displayedIndex += (activeIndex - displayedIndex) * (1 - Math.exp(-delta * 0.013));

  drawScene(ts * 0.001, displayedIndex);
  requestAnimationFrame(animate);
}

function drawScene(time, stageValue) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#050b1d");
  gradient.addColorStop(0.55, "#090f25");
  gradient.addColorStop(1, "#1a1230");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  stars.forEach((star) => {
    const t = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(time * 0.9 + star.twinkle + stageValue * 0.7));
    const x = star.x * width;
    const y = star.y * (height * 0.86);
    ctx.globalAlpha = t;
    ctx.fillStyle = "#cde5ff";
    ctx.beginPath();
    ctx.arc(x, y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  const nebulaDrift = Math.sin(time * 0.16) * 40;
  drawNebula(width * 0.25 + nebulaDrift, height * 0.26, 180, "rgba(90,140,255,0.2)");
  drawNebula(width * 0.72 - nebulaDrift * 0.5, height * 0.38, 220, "rgba(255,145,198,0.15)");

  const earthX = width * 0.14;
  const earthY = height * 0.84;
  ctx.fillStyle = "#5cc6ff";
  ctx.beginPath();
  ctx.arc(earthX, earthY, 8, 0, Math.PI * 2);
  ctx.fill();

  const stage = STAGES[Math.round(stageValue)];
  const glow = 20 + stageValue * 10;

  ctx.strokeStyle = "rgba(150,192,255,0.28)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= STAGES.length; i += 1) {
    const r = (i / STAGES.length) * (height * 0.68);
    ctx.beginPath();
    ctx.arc(earthX, earthY, r, Math.PI * 1.05, Math.PI * 2);
    ctx.stroke();
  }

  const targetR = (stageValue + 1) / STAGES.length * (height * 0.68);
  const targetX = earthX + targetR * 0.95;
  const targetY = earthY - targetR * 0.62;

  ctx.strokeStyle = "rgba(255,255,255,0.42)";
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(earthX, earthY);
  ctx.lineTo(targetX, targetY);
  ctx.stroke();
  ctx.setLineDash([]);

  const radial = ctx.createRadialGradient(targetX, targetY, 2, targetX, targetY, glow);
  radial.addColorStop(0, stage.color);
  radial.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = radial;
  ctx.beginPath();
  ctx.arc(targetX, targetY, glow, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = stage.color;
  ctx.beginPath();
  ctx.arc(targetX, targetY, clamp(stage.radius * 0.08, 5, 12), 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "600 15px Space Grotesk, sans-serif";
  ctx.fillStyle = "#e3eeff";
  ctx.fillText(stage.name, targetX + 14, targetY - 10);

  ctx.font = "12px IBM Plex Sans KR, sans-serif";
  ctx.fillStyle = "#9cb2d9";
  ctx.fillText(stage.distance, targetX + 14, targetY + 10);
}

function drawNebula(x, y, radius, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
