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

const JOURNEY_COPY = {
  ko: { autoplayStart: "자동 항해 시작", autoplayStop: "자동 항해 중지" },
  en: { autoplayStart: "Start Auto Cruise", autoplayStop: "Stop Auto Cruise" }
};

const STAGES = [
  {
    name: { ko: "지구와 달", en: "Earth & Moon" },
    description: {
      ko: "우주를 향한 첫 거리감. 지구는 생각보다 작고, 달은 의외로 멀리 떨어져 있습니다.",
      en: "Your first cosmic scale checkpoint: Earth is small, and the Moon is farther than most people expect."
    },
    distance: {
      astro: { ko: "38.4만 km", en: "384,400 km" },
      imperial: { ko: "23.9만 mi", en: "238,855 mi" }
    },
    lightTime: { ko: "1.28초", en: "1.28 seconds" },
    metaphor: {
      ko: "농구공(지구)에서 탁구공(달)까지 약 7m",
      en: "Basketball Earth to ping-pong Moon: about 7 meters"
    },
    insight: {
      ko: "지금 달을 보면 1.28초 전의 달을 보고 있습니다.",
      en: "When you look at the Moon, you see it 1.28 seconds in the past."
    },
    color: "#93d8ff",
    radius: 18,
    awe: {
      ko: [
        "아폴로가 도달한 거리는 우주 스케일에선 여전히 '현관문 앞' 수준입니다.",
        "달의 중력은 지구의 약 1/6이라 점프 높이가 크게 달라집니다."
      ],
      en: [
        "Apollo's distance is still just the cosmic doorstep.",
        "The Moon's gravity is about one-sixth of Earth's, changing motion dramatically."
      ]
    }
  },
  {
    name: { ko: "태양", en: "The Sun" },
    description: {
      ko: "생명의 에너지원. 지구에서 가장 가까운 별이지만 빛조차 8분 이상이 걸립니다.",
      en: "The nearest star and source of life, yet even its light takes over 8 minutes to arrive."
    },
    distance: {
      astro: { ko: "1 AU (1억 4,960만 km)", en: "1 AU (149.6 million km)" },
      imperial: { ko: "1 AU (9,300만 mi)", en: "1 AU (93.0 million mi)" }
    },
    lightTime: { ko: "8분 20초", en: "8 min 20 sec" },
    metaphor: {
      ko: "지구가 쌀알이면 태양은 농구공 크기",
      en: "If Earth is a grain of rice, the Sun is a basketball"
    },
    insight: {
      ko: "해 질 무렵 보는 태양은 실제 현재 태양보다 8분 20초 과거 모습입니다.",
      en: "Sunset light shows the Sun as it was 8 minutes and 20 seconds ago."
    },
    color: "#ffcb74",
    radius: 26,
    awe: {
      ko: [
        "태양 내부에서 생성된 광자는 표면까지 나오는데 수만 년이 걸릴 수 있습니다.",
        "지구 전체 에너지 소비량보다 훨씬 큰 에너지가 매초 태양에서 방출됩니다."
      ],
      en: [
        "A photon can take tens of thousands of years to escape the Sun's interior.",
        "Every second, the Sun releases vastly more energy than humanity uses."
      ]
    }
  },
  {
    name: { ko: "목성 궤도", en: "Jupiter Orbit" },
    description: {
      ko: "행성 사이 간격은 상상보다 텅 비어 있습니다.",
      en: "Planetary space is emptier and larger than intuition suggests."
    },
    distance: {
      astro: { ko: "5.2 AU", en: "5.2 AU" },
      imperial: { ko: "5.2 AU", en: "5.2 AU" }
    },
    lightTime: { ko: "43분", en: "43 minutes" },
    metaphor: { ko: "도시 하나를 건너야 다음 행성", en: "Cross a city to meet the next major world" },
    insight: {
      ko: "태양빛이 목성에 닿는 데 약 43분이 걸립니다.",
      en: "Sunlight needs about 43 minutes to reach Jupiter."
    },
    color: "#ffd6a8",
    radius: 34,
    awe: {
      ko: ["목성 자기장은 거대한 방사선 벨트를 형성합니다.", "태양계 질량 분포는 극도로 불균등합니다."],
      en: ["Jupiter's magnetic field powers vast radiation belts.", "Mass in the solar system is extremely unevenly distributed."]
    }
  },
  {
    name: { ko: "카이퍼 벨트", en: "Kuiper Belt" },
    description: {
      ko: "명왕성 밖 얼음 천체의 영역. 태양계 경계가 아직도 확장된 느낌을 줍니다.",
      en: "An icy frontier beyond Pluto that stretches the idea of the solar system's edge."
    },
    distance: {
      astro: { ko: "30~50 AU", en: "30-50 AU" },
      imperial: { ko: "30~50 AU", en: "30-50 AU" }
    },
    lightTime: { ko: "4~7시간", en: "4-7 hours" },
    metaphor: { ko: "동네를 넘어 도시 외곽까지 확장", en: "Beyond the neighborhood to the outskirts of a megacity" },
    insight: {
      ko: "이 구간의 천체를 볼 때는 이미 몇 시간 전 빛을 보고 있는 셈입니다.",
      en: "Objects here are already several light-hours in the past."
    },
    color: "#9cb8ff",
    radius: 42,
    awe: {
      ko: ["명왕성은 카이퍼 벨트 천체 중 하나입니다.", "혜성의 상당수는 먼 얼음 저장고에서 유래합니다."],
      en: ["Pluto is one among many Kuiper Belt objects.", "Many comets originate in distant icy reservoirs."]
    }
  },
  {
    name: { ko: "오르트 구름", en: "Oort Cloud" },
    description: {
      ko: "태양계를 둘러싼 거대한 혜성 구름 가설 영역입니다.",
      en: "A hypothesized comet cloud at the outer boundary of the Sun's domain."
    },
    distance: {
      astro: { ko: "약 5만~10만 AU", en: "about 50,000-100,000 AU" },
      imperial: { ko: "약 5만~10만 AU", en: "about 50,000-100,000 AU" }
    },
    lightTime: { ko: "0.8~1.6년", en: "0.8-1.6 years" },
    metaphor: { ko: "집 한 채가 대륙 끝까지 영향", en: "One home influencing an entire continent" },
    insight: {
      ko: "태양권 끝의 사건을 본다는 건 거의 1년 전 기록을 보는 일입니다.",
      en: "Seeing events near this edge means looking nearly a year into the past."
    },
    color: "#c8d8ff",
    radius: 54,
    awe: {
      ko: ["오르트 구름은 직접 관측 대신 궤도 분석으로 추정됩니다.", "장주기 혜성은 수천~수만 년 주기로 돌아옵니다."],
      en: ["The Oort Cloud is inferred mostly through orbital evidence.", "Long-period comets can return over thousands of years."]
    }
  },
  {
    name: { ko: "우리은하", en: "Milky Way" },
    description: {
      ko: "수천억 개 별이 속한 거대한 원반 은하. 태양계는 가장자리 근처에 있습니다.",
      en: "A giant disk galaxy with hundreds of billions of stars. Our solar system sits near an outer arm."
    },
    distance: {
      astro: { ko: "지름 약 10만 광년", en: "about 100,000 light-years across" },
      imperial: { ko: "지름 약 10만 광년", en: "about 100,000 light-years across" }
    },
    lightTime: { ko: "최대 10만 년", en: "up to 100,000 years" },
    metaphor: { ko: "모래알보다 작은 태양계가 거대한 도시 하나", en: "Our tiny solar system inside a metropolis of stars" },
    insight: {
      ko: "은하 반대편 별을 본다면 인류 문명 이전의 빛을 보는 것입니다.",
      en: "A star on the far side can show light from before human civilization."
    },
    color: "#f2d9ff",
    radius: 66,
    awe: {
      ko: ["태양이 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년이 걸립니다.", "은하수는 우리은하 원반을 옆에서 보는 흔적입니다."],
      en: ["The Sun takes about 230 million years to orbit the galactic center.", "The Milky Way band is our side view of the galactic disk."]
    }
  },
  {
    name: { ko: "국부은하군", en: "Local Group" },
    description: {
      ko: "우리은하, 안드로메다 등 수십 개 은하가 중력으로 묶인 집단입니다.",
      en: "A gravitational family of dozens of galaxies, including the Milky Way and Andromeda."
    },
    distance: {
      astro: { ko: "약 1,000만 광년 규모", en: "about 10 million light-years across" },
      imperial: { ko: "약 1,000만 광년 규모", en: "about 10 million light-years across" }
    },
    lightTime: { ko: "수백만 년", en: "millions of years" },
    metaphor: { ko: "도시(은하)들이 모여 만든 거대 광역권", en: "A mega-region made of whole galaxy-cities" },
    insight: {
      ko: "안드로메다를 볼 때 우리는 250만 년 전의 모습을 보고 있습니다.",
      en: "Looking at Andromeda means seeing it 2.5 million years ago."
    },
    color: "#f9c3ff",
    radius: 76,
    awe: {
      ko: ["우리은하와 안드로메다는 약 40억 년 후 충돌할 것으로 예측됩니다.", "은하군 사이에는 거의 완전한 암흑 공간이 펼쳐집니다."],
      en: ["Milky Way and Andromeda are expected to merge in about 4 billion years.", "Between groups lies mostly near-total darkness."]
    }
  },
  {
    name: { ko: "라니아케아 초은하단", en: "Laniakea Supercluster" },
    description: {
      ko: "수많은 은하군이 거대한 중력 흐름으로 연결된 구조입니다.",
      en: "A vast flow structure linking many galaxy groups by gravity."
    },
    distance: {
      astro: { ko: "약 5.2억 광년", en: "about 520 million light-years" },
      imperial: { ko: "약 5.2억 광년", en: "about 520 million light-years" }
    },
    lightTime: { ko: "수억 년", en: "hundreds of millions of years" },
    metaphor: { ko: "대륙 여러 개를 하나의 흐름으로 묶은 구조", en: "Like multiple continents connected in one cosmic flow" },
    insight: {
      ko: "우주의 대규모 구조를 보는 일은 지질시대보다 긴 과거를 보는 것입니다.",
      en: "Large-scale structure means looking farther back than geologic epochs."
    },
    color: "#ffb9d0",
    radius: 86,
    awe: {
      ko: ["은하는 무작위가 아니라 거대한 필라멘트 구조를 이룹니다.", "우주 팽창은 멀리 있는 구조일수록 더 빠른 거리 증가를 만듭니다."],
      en: ["Galaxies form huge filamentary structures, not random scatter.", "Cosmic expansion increases separation faster at greater distances."]
    }
  },
  {
    name: { ko: "관측 가능한 우주", en: "Observable Universe" },
    description: {
      ko: "우리가 볼 수 있는 한계 반경. 우주의 전체는 이보다 훨씬 클 수 있습니다.",
      en: "The limit of what light has allowed us to observe. The whole universe may be much larger."
    },
    distance: {
      astro: { ko: "반경 약 465억 광년", en: "radius about 46.5 billion light-years" },
      imperial: { ko: "반경 약 465억 광년", en: "radius about 46.5 billion light-years" }
    },
    lightTime: { ko: "우주 나이 138억 년과 팽창 보정", en: "13.8 billion years with expansion effects" },
    metaphor: { ko: "끝이 보이지 않는 암흑 바다", en: "A dark ocean with no visible edge" },
    insight: {
      ko: "보이는 우주는 빛이 도달한 범위일 뿐, 전체 우주는 아직 미지입니다.",
      en: "The observable universe is only what light has reached us from so far."
    },
    color: "#ff9ea8",
    radius: 96,
    awe: {
      ko: ["관측 가능한 우주 안에는 대략 2조 개 규모의 은하가 있을 것으로 추정됩니다.", "우주의 경이로움은 '모른다'는 사실 자체에서 더 커집니다."],
      en: ["The observable universe may contain on the order of two trillion galaxies.", "Awe deepens because so much of the universe remains unknown."]
    }
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

  autoplayButton.textContent = copy("autoplayStop");
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

window.addEventListener("cosmos:settings-changed", () => {
  if (!autoplayTimer) {
    autoplayButton.textContent = copy("autoplayStart");
  }
  updateText();
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
  autoplayButton.textContent = copy("autoplayStart");
}

function updateText() {
  const stage = STAGES[activeIndex];
  const lang = getLanguage();
  const unit = getUnit();

  stageNameEl.textContent = stage.name[lang];
  stageDescriptionEl.textContent = stage.description[lang];
  distanceEl.textContent = stage.distance[unit][lang];
  lightTimeEl.textContent = stage.lightTime[lang];
  metaphorEl.textContent = stage.metaphor[lang];
  insightEl.textContent = stage.insight[lang];

  scaleBarEl.style.setProperty("--scale-fill", `${((activeIndex + 1) / STAGES.length) * 100}%`);

  aweListEl.innerHTML = "";
  stage.awe[lang].forEach((line) => {
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
  const lang = getLanguage();
  const glow = 20 + stageValue * 10;

  ctx.strokeStyle = "rgba(150,192,255,0.28)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= STAGES.length; i += 1) {
    const r = (i / STAGES.length) * (height * 0.68);
    ctx.beginPath();
    ctx.arc(earthX, earthY, r, Math.PI * 1.05, Math.PI * 2);
    ctx.stroke();
  }

  const targetR = ((stageValue + 1) / STAGES.length) * (height * 0.68);
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
  ctx.fillText(stage.name[lang], targetX + 14, targetY - 10);

  ctx.font = "12px IBM Plex Sans KR, sans-serif";
  ctx.fillStyle = "#9cb2d9";
  ctx.fillText(stage.distance[getUnit()][lang], targetX + 14, targetY + 10);
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

function getLanguage() {
  return window.cosmosSettings?.get()?.language === "en" ? "en" : "ko";
}

function getUnit() {
  return window.cosmosSettings?.get()?.unit === "imperial" ? "imperial" : "astro";
}

function copy(key) {
  return JOURNEY_COPY[getLanguage()][key] || JOURNEY_COPY.ko[key];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
