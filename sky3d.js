import * as THREE from "https://esm.sh/three@0.161.0";
import { TARGETS } from "./targets.js";

const container = document.querySelector("#sky-viewer");
if (!container) {
  throw new Error("#sky-viewer element not found");
}

const simulatorView = document.querySelector("#simulator-view");
const latitudeInput = document.querySelector("#latitude");
const longitudeInput = document.querySelector("#longitude");
const dateInput = document.querySelector("#date");
const skyTimeInput = document.querySelector("#sky-time");
const skySpeedInput = document.querySelector("#sky-speed");
const liveTimeInput = document.querySelector("#sky-live-time");
const skySearchInput = document.querySelector("#sky-search");
const skySearchBtn = document.querySelector("#sky-search-btn");
const skySearchList = document.querySelector("#sky-search-list");
const syncSkyNowBtn = document.querySelector("#sync-sky-now");
const skyStatus = document.querySelector("#sky-status");

const toggleConstellations = document.querySelector("#toggle-constellations");
const toggleNebulae = document.querySelector("#toggle-nebulae");
const togglePlanets = document.querySelector("#toggle-planets");
const toggleLabels = document.querySelector("#toggle-labels");
const focusButtons = document.querySelectorAll("[data-focus]");

const SKY_RADIUS = 92;
const HORIZON_RADIUS = 86;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x030914, 120, 320);

const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);
camera.position.set(0, 2.2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.setAnimationLoop(animate);

const ambient = new THREE.AmbientLight(0x8bb0ff, 0.5);
scene.add(ambient);

const fill = new THREE.DirectionalLight(0xb2ceff, 0.42);
fill.position.set(30, 35, -20);
scene.add(fill);

const domeMaterial = new THREE.MeshBasicMaterial({
  color: 0x071425,
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.92
});

const dome = new THREE.Mesh(
  new THREE.SphereGeometry(SKY_RADIUS + 8, 48, 32),
  domeMaterial
);
scene.add(dome);

const backgroundStars = new THREE.Group();
const starCloudNear = createBackgroundStars(760, 116, 148, 1.15, 0.82);
const starCloudMid = createBackgroundStars(540, 148, 196, 0.95, 0.42);
const starCloudFar = createBackgroundStars(320, 196, 254, 0.8, 0.28);
backgroundStars.add(starCloudNear, starCloudMid, starCloudFar);
scene.add(backgroundStars);

const milkyWay = createMilkyWayShell();
scene.add(milkyWay);

const constellationGroup = new THREE.Group();
const nebulaGroup = new THREE.Group();
const planetGroup = new THREE.Group();
scene.add(constellationGroup);
scene.add(nebulaGroup);
scene.add(planetGroup);

const horizonRing = createHorizonRing();
scene.add(horizonRing);
const horizonAtmosphere = createHorizonAtmosphere();
scene.add(horizonAtmosphere);
const ground = createGround();
scene.add(ground);

const labelLayer = document.createElement("div");
labelLayer.className = "viewer-layer";

const labels = [];
const rayVector = new THREE.Vector3();
const vectorCache = new Map();

const brightStars = {
  betelgeuse: { name: "Betelgeuse", koName: "베텔게우스", raHours: 5.9195, decDeg: 7.4071, mag: 0.45, color: 0xffb36d },
  bellatrix: { name: "Bellatrix", koName: "벨라트릭스", raHours: 5.4189, decDeg: 6.3497, mag: 1.64, color: 0xbdd8ff },
  rigel: { name: "Rigel", koName: "리겔", raHours: 5.2423, decDeg: -8.2016, mag: 0.13, color: 0xb9d6ff },
  saiph: { name: "Saiph", koName: "사이프", raHours: 5.7959, decDeg: -9.6696, mag: 2.06, color: 0xb6d2ff },
  alnitak: { name: "Alnitak", koName: "알니타크", raHours: 5.6793, decDeg: -1.9426, mag: 1.77, color: 0xb7d5ff },
  alnilam: { name: "Alnilam", koName: "알닐람", raHours: 5.6036, decDeg: -1.2019, mag: 1.69, color: 0xb8d5ff },
  mintaka: { name: "Mintaka", koName: "민타카", raHours: 5.5334, decDeg: -0.2991, mag: 2.23, color: 0xbbd7ff },
  dubhe: { name: "Dubhe", koName: "두베", raHours: 11.0621, decDeg: 61.7508, mag: 1.79, color: 0xffd4a1 },
  merak: { name: "Merak", koName: "메라크", raHours: 11.0307, decDeg: 56.3824, mag: 2.37, color: 0xe2ecff },
  phecda: { name: "Phecda", koName: "페크다", raHours: 11.8972, decDeg: 53.6948, mag: 2.43, color: 0xecf2ff },
  megrez: { name: "Megrez", koName: "메그레즈", raHours: 12.257, decDeg: 57.0326, mag: 3.31, color: 0xeaf1ff },
  alioth: { name: "Alioth", koName: "알리오트", raHours: 12.9005, decDeg: 55.9598, mag: 1.76, color: 0xf3f7ff },
  mizar: { name: "Mizar", koName: "미자르", raHours: 13.3987, decDeg: 54.9254, mag: 2.23, color: 0xf6f9ff },
  alkaid: { name: "Alkaid", koName: "알카이드", raHours: 13.7923, decDeg: 49.3133, mag: 1.85, color: 0xc9ddff },
  vega: { name: "Vega", koName: "베가", raHours: 18.6156, decDeg: 38.7837, mag: 0.03, color: 0xd2e4ff },
  deneb: { name: "Deneb", koName: "데네브", raHours: 20.6905, decDeg: 45.2803, mag: 1.25, color: 0xe2ebff },
  altair: { name: "Altair", koName: "알타이르", raHours: 19.8464, decDeg: 8.8683, mag: 0.77, color: 0xf3f8ff }
};

const constellationLines = [
  ["betelgeuse", "bellatrix"],
  ["bellatrix", "mintaka"],
  ["mintaka", "alnilam"],
  ["alnilam", "alnitak"],
  ["alnitak", "saiph"],
  ["saiph", "rigel"],
  ["rigel", "mintaka"],
  ["betelgeuse", "alnitak"],
  ["dubhe", "merak"],
  ["merak", "phecda"],
  ["phecda", "megrez"],
  ["megrez", "alioth"],
  ["alioth", "mizar"],
  ["mizar", "alkaid"],
  ["vega", "deneb"],
  ["deneb", "altair"],
  ["altair", "vega"]
];

const planetTargets = [
  { key: "Mercury", name: "Mercury", color: 0xd7d4c5, size: 4.2 },
  { key: "Venus", name: "Venus", color: 0xffe5b8, size: 5.2 },
  { key: "Mars", name: "Mars", color: 0xff9d7f, size: 4.6 },
  { key: "Jupiter", name: "Jupiter", color: 0xffd8b0, size: 5.4 },
  { key: "Saturn", name: "Saturn", color: 0xffe9be, size: 5.0 }
];

const PLANET_NAME_KO = {
  Mercury: "수성",
  Venus: "금성",
  Mars: "화성",
  Jupiter: "목성",
  Saturn: "토성"
};

const TARGET_NAME_EN_BY_ID = {
  m45: "M45 Pleiades",
  m42: "M42 Orion Nebula",
  m31: "M31 Andromeda Galaxy",
  m13: "M13 Hercules Globular Cluster",
  m44: "M44 Praesepe",
  m35: "M35",
  m41: "M41",
  m47: "M47",
  m46: "M46",
  m48: "M48",
  m3: "M3",
  m5: "M5",
  m8: "M8 Lagoon Nebula",
  m20: "M20 Trifid Nebula",
  m57: "M57 Ring Nebula",
  m27: "M27 Dumbbell Nebula",
  m11: "M11 Wild Duck Cluster",
  m7: "M7",
  m6: "M6",
  m39: "M39"
};

const PLANET_ELEMENTS = {
  Mercury: { N0: 48.3313, Nd: 3.24587e-5, i0: 7.0047, id: 5e-8, w0: 29.1241, wd: 1.01444e-5, a: 0.387098, e0: 0.205635, ed: 5.59e-10, M0: 168.6562, Md: 4.0923344368 },
  Venus: { N0: 76.6799, Nd: 2.4659e-5, i0: 3.3946, id: 2.75e-8, w0: 54.891, wd: 1.38374e-5, a: 0.72333, e0: 0.006773, ed: -1.302e-9, M0: 48.0052, Md: 1.6021302244 },
  Earth: { N0: 0, Nd: 0, i0: 0, id: 0, w0: 282.9404, wd: 4.70935e-5, a: 1.0, e0: 0.016709, ed: -1.151e-9, M0: 356.047, Md: 0.9856002585 },
  Mars: { N0: 49.5574, Nd: 2.11081e-5, i0: 1.8497, id: -1.78e-8, w0: 286.5016, wd: 2.92961e-5, a: 1.523688, e0: 0.093405, ed: 2.516e-9, M0: 18.6021, Md: 0.5240207766 },
  Jupiter: { N0: 100.4542, Nd: 2.76854e-5, i0: 1.303, id: -1.557e-7, w0: 273.8777, wd: 1.64505e-5, a: 5.20256, e0: 0.048498, ed: 4.469e-9, M0: 19.895, Md: 0.0830853001 },
  Saturn: { N0: 113.6634, Nd: 2.3898e-5, i0: 2.4886, id: -1.081e-7, w0: 339.3939, wd: 2.97661e-5, a: 9.55475, e0: 0.055546, ed: -9.499e-9, M0: 316.967, Md: 0.0334442282 }
};

const starEntries = Object.entries(brightStars);
const starPositions = new Float32Array(starEntries.length * 3);
const starColors = new Float32Array(starEntries.length * 3);
const baseStarColors = new Float32Array(starEntries.length * 3);
for (let i = 0; i < starEntries.length; i += 1) {
  const star = starEntries[i][1];
  const magBoost = 1.18 - clamp(star.mag ?? 2.5, -1, 4.2) * 0.13;
  const color = new THREE.Color(star.color ?? 0xd7e7ff).multiplyScalar(clamp(magBoost, 0.55, 1.22));
  const base = i * 3;
  baseStarColors[base] = color.r;
  baseStarColors[base + 1] = color.g;
  baseStarColors[base + 2] = color.b;
  starColors[base] = color.r;
  starColors[base + 1] = color.g;
  starColors[base + 2] = color.b;
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

const starPoints = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({
    size: 2.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true
  })
);
constellationGroup.add(starPoints);

const linePositions = new Float32Array(constellationLines.length * 6);
const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

const lineSegments = new THREE.LineSegments(
  lineGeometry,
  new THREE.LineBasicMaterial({ color: 0x77baff, transparent: true, opacity: 0.58 })
);
constellationGroup.add(lineSegments);

const nebulaTargets = TARGETS.filter((target) =>
  ["Nebula", "Planetary Nebula", "Galaxy", "Globular Cluster"].includes(target.type)
);
const nebulaPositions = new Float32Array(nebulaTargets.length * 3);
const nebulaColors = new Float32Array(nebulaTargets.length * 3);
const baseNebulaColors = new Float32Array(nebulaTargets.length * 3);

for (let i = 0; i < nebulaTargets.length; i += 1) {
  const target = nebulaTargets[i];
  if (target.type.includes("Galaxy")) {
    baseNebulaColors[i * 3] = 1;
    baseNebulaColors[i * 3 + 1] = 0.75;
    baseNebulaColors[i * 3 + 2] = 0.68;
  } else if (target.type.includes("Globular")) {
    baseNebulaColors[i * 3] = 0.8;
    baseNebulaColors[i * 3 + 1] = 1;
    baseNebulaColors[i * 3 + 2] = 0.76;
  } else {
    baseNebulaColors[i * 3] = 0.72;
    baseNebulaColors[i * 3 + 1] = 0.93;
    baseNebulaColors[i * 3 + 2] = 1;
  }

  nebulaColors[i * 3] = baseNebulaColors[i * 3];
  nebulaColors[i * 3 + 1] = baseNebulaColors[i * 3 + 1];
  nebulaColors[i * 3 + 2] = baseNebulaColors[i * 3 + 2];
}

const nebulaGeometry = new THREE.BufferGeometry();
nebulaGeometry.setAttribute("position", new THREE.BufferAttribute(nebulaPositions, 3));
nebulaGeometry.setAttribute("color", new THREE.BufferAttribute(nebulaColors, 3));

const nebulaPoints = new THREE.Points(
  nebulaGeometry,
  new THREE.PointsMaterial({
    size: 3.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.93,
    sizeAttenuation: true
  })
);
nebulaGroup.add(nebulaPoints);

const planetPositions = new Float32Array(planetTargets.length * 3);
const planetColors = new Float32Array(planetTargets.length * 3);
for (let i = 0; i < planetTargets.length; i += 1) {
  const color = new THREE.Color(planetTargets[i].color);
  planetColors[i * 3] = color.r;
  planetColors[i * 3 + 1] = color.g;
  planetColors[i * 3 + 2] = color.b;
}

const planetGeometry = new THREE.BufferGeometry();
planetGeometry.setAttribute("position", new THREE.BufferAttribute(planetPositions, 3));
planetGeometry.setAttribute("color", new THREE.BufferAttribute(planetColors, 3));

const planetPoints = new THREE.Points(
  planetGeometry,
  new THREE.PointsMaterial({
    size: 5.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true
  })
);
planetGroup.add(planetPoints);

const searchableTargets = [
  ...starEntries.map(([key, star]) => ({
    key: `star:${key}`,
    type: "star",
    name: star.name,
    raHours: star.raHours,
    decDeg: star.decDeg
  })),
  ...starEntries.map(([key, star]) => ({
    key: `star:${key}`,
    type: "star",
    name: star.koName || star.name,
    raHours: star.raHours,
    decDeg: star.decDeg
  })),
  ...nebulaTargets.map((target) => ({
    key: `nebula:${target.id}`,
    type: "nebula",
    name: target.name,
    raHours: target.raHours,
    decDeg: target.decDeg
  })),
  ...nebulaTargets.map((target) => ({
    key: `nebula:${target.id}`,
    type: "nebula",
    name: TARGET_NAME_EN_BY_ID[target.id] || target.name,
    raHours: target.raHours,
    decDeg: target.decDeg
  })),
  ...planetTargets.flatMap((planet) => [
    {
      key: `planet:${planet.key}`,
      type: "planet",
      name: planet.name
    },
    {
      key: `planet:${planet.key}`,
      type: "planet",
      name: PLANET_NAME_KO[planet.key]
    }
  ])
];

let started = false;
let pendingStart = false;
let isDragging = false;
let yaw = toRad(180);
let pitch = toRad(35);
let lastX = 0;
let lastY = 0;
let lastFrameTs = 0;
let lastStatusUpdate = 0;
let timeSpeed = 1;
let searchHitKey = "";
let statusHint = "";
let statusHintUntil = 0;
let currentContext = {
  date: new Date(),
  lat: 37.5665,
  lon: 126.978
};
let currentSkyState = {
  sunAltDeg: -24,
  darkness: 1
};

const skyNightColor = new THREE.Color(0x071425);
const skyTwilightColor = new THREE.Color(0x2c3d58);
const fogNightColor = new THREE.Color(0x030914);
const fogTwilightColor = new THREE.Color(0x2e4d72);

initializeObserverInputs();
initializeSkyTime();
timeSpeed = Number(skySpeedInput?.value || "1");
buildLabels();
initializeSearchOptions();
updateSearchPlaceholder();
wireControls();
window.addEventListener("simulator:activate", ensureStarted);
window.addEventListener("resize", resizeRenderer);
window.addEventListener("cosmos:settings-changed", () => {
  updateSearchPlaceholder();
  refreshLabelTexts();
  updateStatus();
});

if (simulatorView && !simulatorView.hidden) {
  ensureStarted();
}

function initializeSkyTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  skyTimeInput.value = `${hh}:${mm}`;
}

function initializeObserverInputs() {
  if (dateInput && !dateInput.value) {
    dateInput.value = todayString();
  }
  if (latitudeInput && !latitudeInput.value) {
    latitudeInput.value = currentContext.lat.toFixed(4);
  }
  if (longitudeInput && !longitudeInput.value) {
    longitudeInput.value = currentContext.lon.toFixed(4);
  }
}

function buildLabels() {
  starEntries.forEach(([key]) => {
    addLabel(`star:${key}`, "star");
  });

  nebulaTargets.forEach((target) => {
    addLabel(`nebula:${target.id}`, "nebula");
  });

  planetTargets.forEach((planet) => {
    addLabel(`planet:${planet.key}`, "planet");
  });

  [
    ["N", 0],
    ["E", 90],
    ["S", 180],
    ["W", 270]
  ].forEach(([name, az]) => {
    addLabel(`cardinal:${name}`, "cardinal");
    vectorCache.set(`cardinal:${name}`, horizontalToVector(2, az, HORIZON_RADIUS + 2));
  });

  refreshLabelTexts();
}

function addLabel(key, type) {
  const el = document.createElement("span");
  el.className = `viewer-label ${type}`;
  labelLayer.appendChild(el);

  labels.push({
    element: el,
    key,
    type,
    labelKey: key
  });
}

function refreshLabelTexts() {
  labels.forEach((label) => {
    label.element.textContent = getLabelText(label.labelKey, label.type);
  });
}

function getLabelText(labelKey, type) {
  const lang = getLanguage();
  if (type === "star") {
    const starId = labelKey.replace("star:", "");
    const star = brightStars[starId];
    if (!star) return labelKey;
    return lang === "en" ? star.name : star.koName || star.name;
  }
  if (type === "planet") {
    const planetId = labelKey.replace("planet:", "");
    return lang === "en" ? planetId : PLANET_NAME_KO[planetId] || planetId;
  }
  if (type === "nebula") {
    const id = labelKey.replace("nebula:", "");
    const target = nebulaTargets.find((item) => item.id === id);
    if (!target) return id.toUpperCase();
    const ko = target.name.replace("M", " M");
    const en = (TARGET_NAME_EN_BY_ID[id] || target.name).replace("M", " M");
    return lang === "en" ? en : ko;
  }
  if (type === "cardinal") {
    const axis = labelKey.replace("cardinal:", "");
    if (lang === "en") return axis;
    const mapKo = { N: "북", E: "동", S: "남", W: "서" };
    return mapKo[axis] || axis;
  }
  return labelKey;
}

function wireControls() {
  toggleConstellations?.addEventListener("change", () => {
    constellationGroup.visible = toggleConstellations.checked;
  });

  toggleNebulae?.addEventListener("change", () => {
    nebulaGroup.visible = toggleNebulae.checked;
  });

  togglePlanets?.addEventListener("change", () => {
    planetGroup.visible = togglePlanets.checked;
  });

  toggleLabels?.addEventListener("change", () => {
    labelLayer.style.display = toggleLabels.checked ? "block" : "none";
  });

  constellationGroup.visible = toggleConstellations?.checked ?? true;
  nebulaGroup.visible = toggleNebulae?.checked ?? true;
  planetGroup.visible = togglePlanets?.checked ?? true;
  labelLayer.style.display = toggleLabels?.checked === false ? "none" : "block";

  focusButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.getAttribute("data-focus");
      moveViewToFocus(mode);
    });
  });

  syncSkyNowBtn?.addEventListener("click", syncSkyToNow);
  skySpeedInput?.addEventListener("change", () => {
    const next = Number(skySpeedInput.value);
    timeSpeed = Number.isFinite(next) && next > 0 ? next : 1;
    if (timeSpeed > 1 && liveTimeInput.checked) {
      liveTimeInput.checked = false;
      currentContext.date = new Date();
      syncInputsFromContext();
    }
    updateCelestialPositions();
    updateStatus();
  });

  skySearchBtn?.addEventListener("click", focusSearchTarget);
  skySearchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      focusSearchTarget();
    }
  });

  renderer.domElement.addEventListener("pointerdown", (event) => {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    renderer.domElement.setPointerCapture(event.pointerId);
  });

  renderer.domElement.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;

    yaw -= dx * 0.0055;
    pitch += dy * 0.0042;
    pitch = clamp(pitch, toRad(-12), toRad(86));
  });

  renderer.domElement.addEventListener("pointerup", (event) => {
    isDragging = false;
    renderer.domElement.releasePointerCapture(event.pointerId);
  });

  renderer.domElement.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      camera.fov = clamp(camera.fov + event.deltaY * 0.02, 30, 90);
      camera.updateProjectionMatrix();
    },
    { passive: false }
  );

  [latitudeInput, longitudeInput, dateInput, skyTimeInput, liveTimeInput].forEach((el) => {
    el?.addEventListener("change", () => {
      if (el === liveTimeInput && liveTimeInput.checked) {
        initializeSkyTime();
      }
      updateContextFromInputs();
      updateCelestialPositions();
    });
  });
}

function syncSkyToNow() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  dateInput.value = `${yyyy}-${mm}-${dd}`;
  initializeSkyTime();
  liveTimeInput.checked = true;

  if (!navigator.geolocation) {
    updateContextFromInputs();
    updateCelestialPositions();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitudeInput.value = position.coords.latitude.toFixed(4);
      longitudeInput.value = position.coords.longitude.toFixed(4);
      updateContextFromInputs();
      updateCelestialPositions();
    },
    () => {
      updateContextFromInputs();
      updateCelestialPositions();
    }
  );
}

function updateContextFromInputs() {
  const lat = Number(latitudeInput.value);
  const lon = Number(longitudeInput.value);

  const safeLat = Number.isFinite(lat) ? clamp(lat, -90, 90) : currentContext.lat;
  const safeLon = Number.isFinite(lon) ? clamp(lon, -180, 180) : currentContext.lon;

  let date;
  if (liveTimeInput.checked) {
    date = new Date();
    skyTimeInput.value = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  } else {
    const baseDate = dateInput.value || todayString();
    const time = skyTimeInput.value || "21:00";
    date = new Date(`${baseDate}T${time}:00`);
  }

  currentContext = {
    date,
    lat: safeLat,
    lon: safeLon
  };
}

function syncInputsFromContext() {
  const d = currentContext.date;
  dateInput.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  skyTimeInput.value = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function moveViewToFocus(mode) {
  const focus = {
    orion: { raHours: 5.5, decDeg: -1.5 },
    "ursa-major": { raHours: 12.3, decDeg: 56.0 },
    summer: { raHours: 19.7, decDeg: 30.0 }
  }[mode];

  if (!focus) return;

  const { altDeg, azDeg } = raDecToHorizontal(
    focus.raHours,
    focus.decDeg,
    currentContext.date,
    currentContext.lat,
    currentContext.lon
  );

  moveViewToHorizontal(altDeg, azDeg);
}

function moveViewToHorizontal(altDeg, azDeg) {
  const v = horizontalToVector(altDeg, azDeg, 1).normalize();
  pitch = Math.asin(v.y);
  yaw = Math.atan2(v.x, -v.z);
}

function initializeSearchOptions() {
  if (!skySearchList) return;
  const names = Array.from(new Set(searchableTargets.map((item) => item.name))).sort((a, b) => a.localeCompare(b));
  skySearchList.innerHTML = names.map((name) => `<option value="${name}"></option>`).join("");
}

function updateSearchPlaceholder() {
  if (!skySearchInput) return;
  skySearchInput.placeholder = getLanguage() === "en" ? "Orion / M42 / Vega" : "오리온 / M42 / Vega";
}

function focusSearchTarget() {
  const raw = skySearchInput?.value?.trim();
  if (!raw) return;

  const target = findSearchTarget(raw);
  if (!target) {
    setStatusHint(getLanguage() === "en" ? `No match for "${raw}"` : `"${raw}"에 해당하는 천체를 찾지 못했습니다.`);
    searchHitKey = "";
    return;
  }

  const equatorial =
    target.type === "planet"
      ? getPlanetRaDec(target.key.replace("planet:", ""), currentContext.date)
      : { raHours: target.raHours, decDeg: target.decDeg };
  const { altDeg, azDeg } = raDecToHorizontal(
    equatorial.raHours,
    equatorial.decDeg,
    currentContext.date,
    currentContext.lat,
    currentContext.lon
  );
  moveViewToHorizontal(altDeg, azDeg);
  searchHitKey = target.key;
  setStatusHint(getLanguage() === "en" ? `Focused: ${target.name}` : `포커스: ${target.name}`, 2200);
}

function findSearchTarget(query) {
  const q = normalizeSearch(query);
  if (!q) return null;

  const exact = searchableTargets.find((target) => normalizeSearch(target.name) === q);
  if (exact) return exact;

  return searchableTargets.find((target) => normalizeSearch(target.name).includes(q)) || null;
}

function normalizeSearch(value) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function setStatusHint(text, ttlMs = 2800) {
  statusHint = text;
  statusHintUntil = Date.now() + ttlMs;
}

function createHorizonRing() {
  const points = [];
  for (let az = 0; az <= 360; az += 2) {
    points.push(horizontalToVector(0, az, HORIZON_RADIUS));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x90c7ff,
    transparent: true,
    opacity: 0.32
  });

  const line = new THREE.Line(geometry, material);
  line.position.y = 0;
  return line;
}

function createGround() {
  const group = new THREE.Group();

  const grassTexture = createGrassTexture();
  grassTexture.wrapS = THREE.RepeatWrapping;
  grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(20, 20);
  grassTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const outerGround = new THREE.Mesh(
    new THREE.CircleGeometry(180, 96),
    new THREE.MeshStandardMaterial({
      map: grassTexture,
      color: 0x3c6b3e,
      roughness: 0.95,
      metalness: 0.0
    })
  );
  outerGround.rotation.x = -Math.PI / 2;
  outerGround.position.y = -0.45;
  group.add(outerGround);

  const innerGround = new THREE.Mesh(
    new THREE.CircleGeometry(HORIZON_RADIUS + 8, 80),
    new THREE.MeshStandardMaterial({
      color: 0x2f5831,
      transparent: true,
      opacity: 0.86,
      roughness: 1.0,
      metalness: 0.0
    })
  );
  innerGround.rotation.x = -Math.PI / 2;
  innerGround.position.y = -0.42;
  group.add(innerGround);

  return group;
}

function updateCelestialPositions() {
  const { date, lat, lon } = currentContext;
  const sunEq = getSunRaDec(date);
  const sunHorizontal = raDecToHorizontal(sunEq.raHours, sunEq.decDeg, date, lat, lon);
  const darkness = computeSkyDarkness(sunHorizontal.altDeg);
  currentSkyState = {
    sunAltDeg: sunHorizontal.altDeg,
    darkness
  };

  starEntries.forEach(([key, star], index) => {
    const { altDeg, azDeg } = raDecToHorizontal(star.raHours, star.decDeg, date, lat, lon);
    const v = horizontalToVector(altDeg, azDeg, SKY_RADIUS);
    vectorCache.set(`star:${key}`, v);

    const base = index * 3;
    starPositions[base] = v.x;
    starPositions[base + 1] = v.y;
    starPositions[base + 2] = v.z;

    const altitudeFade = clamp((altDeg + 6) / 34, 0, 1);
    const visibility = darkness * Math.pow(altitudeFade, 1.3);
    const brightness = 0.03 + visibility * 0.97;
    starColors[base] = baseStarColors[base] * brightness;
    starColors[base + 1] = baseStarColors[base + 1] * brightness;
    starColors[base + 2] = baseStarColors[base + 2] * brightness;
  });

  starGeometry.attributes.position.needsUpdate = true;
  starGeometry.attributes.color.needsUpdate = true;

  constellationLines.forEach(([a, b], index) => {
    const va = vectorCache.get(`star:${a}`) || new THREE.Vector3();
    const vb = vectorCache.get(`star:${b}`) || new THREE.Vector3();
    const base = index * 6;

    linePositions[base] = va.x;
    linePositions[base + 1] = va.y;
    linePositions[base + 2] = va.z;
    linePositions[base + 3] = vb.x;
    linePositions[base + 4] = vb.y;
    linePositions[base + 5] = vb.z;
  });

  lineGeometry.attributes.position.needsUpdate = true;

  nebulaTargets.forEach((target, index) => {
    const { altDeg, azDeg } = raDecToHorizontal(target.raHours, target.decDeg, date, lat, lon);
    const v = horizontalToVector(altDeg, azDeg, SKY_RADIUS - 1.5);
    vectorCache.set(`nebula:${target.id}`, v);

    const base = index * 3;
    nebulaPositions[base] = v.x;
    nebulaPositions[base + 1] = v.y;
    nebulaPositions[base + 2] = v.z;

    const altitudeFade = clamp((altDeg + 10) / 38, 0, 1);
    const visibility = darkness * Math.pow(altitudeFade, 1.55);
    const brightness = 0.02 + visibility * 0.98;
    nebulaColors[base] = baseNebulaColors[base] * brightness;
    nebulaColors[base + 1] = baseNebulaColors[base + 1] * brightness;
    nebulaColors[base + 2] = baseNebulaColors[base + 2] * brightness;
  });

  nebulaGeometry.attributes.position.needsUpdate = true;
  nebulaGeometry.attributes.color.needsUpdate = true;

  planetTargets.forEach((planet, index) => {
    const { raHours, decDeg } = getPlanetRaDec(planet.key, date);
    const { altDeg, azDeg } = raDecToHorizontal(raHours, decDeg, date, lat, lon);
    const v = horizontalToVector(altDeg, azDeg, SKY_RADIUS - 1.1);
    vectorCache.set(`planet:${planet.key}`, v);

    const base = index * 3;
    planetPositions[base] = v.x;
    planetPositions[base + 1] = v.y;
    planetPositions[base + 2] = v.z;
  });
  planetGeometry.attributes.position.needsUpdate = true;
}

function resizeRenderer() {
  if (!started) return;

  const width = container.clientWidth;
  const height = container.clientHeight;
  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function ensureStarted() {
  if (started) {
    resizeRenderer();
    return;
  }
  if (pendingStart) return;

  const width = container.clientWidth;
  const height = container.clientHeight;
  if (!width || !height) {
    pendingStart = true;
    requestAnimationFrame(() => {
      pendingStart = false;
      ensureStarted();
    });
    return;
  }

  container.appendChild(renderer.domElement);
  container.appendChild(labelLayer);
  renderer.domElement.style.cursor = "grab";
  renderer.domElement.addEventListener("pointerdown", () => {
    renderer.domElement.style.cursor = "grabbing";
  });
  renderer.domElement.addEventListener("pointerup", () => {
    renderer.domElement.style.cursor = "grab";
  });

  renderer.setSize(width, height);
  started = true;
  pendingStart = false;
  updateContextFromInputs();
  updateCelestialPositions();
  resizeRenderer();
}

function animate(ts) {
  if (!started) return;

  const dt = Math.min(0.25, Math.max(0, (ts - (lastFrameTs || ts)) / 1000));
  lastFrameTs = ts;

  if (liveTimeInput.checked && timeSpeed === 1) {
    updateContextFromInputs();
  } else {
    if (liveTimeInput.checked && timeSpeed > 1) {
      liveTimeInput.checked = false;
      currentContext.date = new Date();
      syncInputsFromContext();
    }
    currentContext.date = new Date(currentContext.date.getTime() + dt * 1000 * timeSpeed);
    syncInputsFromContext();
  }

  if (ts - lastStatusUpdate > 400) {
    updateCelestialPositions();
    updateStatus();
    lastStatusUpdate = ts;
  }

  backgroundStars.rotation.y += 0.000045;
  starCloudNear.rotation.y -= 0.00002;
  starCloudFar.rotation.y += 0.000028;
  milkyWay.rotation.y += 0.00003;

  const twinkle = 0.85 + Math.sin(ts * 0.0013) * 0.05;
  const darkness = currentSkyState.darkness;
  starPoints.material.opacity = (0.14 + darkness * 0.84) * twinkle;
  nebulaPoints.material.opacity = 0.02 + darkness * 0.88 + Math.sin(ts * 0.0008) * 0.02;
  planetPoints.material.opacity = 0.22 + darkness * 0.76;
  starCloudNear.material.opacity = 0.06 + darkness * 0.76;
  starCloudMid.material.opacity = 0.04 + darkness * 0.4;
  starCloudFar.material.opacity = 0.03 + darkness * 0.25;
  milkyWay.material.opacity = 0.02 + darkness * 0.36;

  const horizonLift = clamp((Math.sin(pitch) + 0.15) * 0.5, 0.05, 1);
  const twilightFactor = 1 - darkness;
  horizonAtmosphere.children[0].material.opacity = 0.1 + twilightFactor * 0.26 + (1 - horizonLift) * 0.12;
  horizonAtmosphere.children[1].material.opacity = 0.05 + twilightFactor * 0.2 + (1 - horizonLift) * 0.08;
  domeMaterial.opacity = 0.76 + darkness * 0.2 + (1 - horizonLift) * 0.05;
  domeMaterial.color.lerpColors(skyTwilightColor, skyNightColor, darkness);
  scene.fog.color.lerpColors(fogTwilightColor, fogNightColor, darkness);

  const lookDirection = new THREE.Vector3(
    Math.cos(pitch) * Math.sin(yaw),
    Math.sin(pitch),
    -Math.cos(pitch) * Math.cos(yaw)
  );
  camera.lookAt(camera.position.clone().add(lookDirection));

  updateLabels();
  renderer.render(scene, camera);
}

function updateStatus() {
  if (!skyStatus) return;

  const d = currentContext.date;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const darknessLabel = getSkyConditionLabel(currentSkyState.sunAltDeg);
  const speedLabel = timeSpeed === 1 ? "" : ` | ${getLanguage() === "en" ? "Speed" : "배속"} x${timeSpeed}`;
  const activeHint = Date.now() < statusHintUntil ? ` | ${statusHint}` : "";

  if (getLanguage() === "en") {
    skyStatus.textContent = `Observer ${formatLatLon(currentContext.lat, currentContext.lon)} | Time ${yyyy}-${mm}-${dd} ${hh}:${min} | ${darknessLabel}${speedLabel}${activeHint}`;
  } else {
    skyStatus.textContent = `관측 위치 ${formatLatLon(currentContext.lat, currentContext.lon)} | 기준 시각 ${yyyy}-${mm}-${dd} ${hh}:${min} | ${darknessLabel}${speedLabel}${activeHint}`;
  }
}

function updateLabels() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  labels.forEach(({ element, key, type }) => {
    const point = vectorCache.get(key);
    if (!point) {
      element.style.opacity = "0";
      return;
    }

    rayVector.copy(point).project(camera);

    const x = (rayVector.x * 0.5 + 0.5) * width;
    const y = (-rayVector.y * 0.5 + 0.5) * height;

    const visible = rayVector.z < 1 && rayVector.z > -1;
    const aboveHorizon = point.y > 0 || type === "cardinal";
    const typeVisible =
      type === "star"
        ? toggleConstellations?.checked !== false
        : type === "nebula"
          ? toggleNebulae?.checked !== false
          : type === "planet"
            ? togglePlanets?.checked !== false
            : true;
    if (!visible || !aboveHorizon || !typeVisible) {
      element.style.opacity = "0";
      element.classList.remove("search-hit");
      return;
    }

    element.style.opacity = "1";
    element.classList.toggle("search-hit", key === searchHitKey);
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });
}

function createBackgroundStars(count, minRadius = 130, maxRadius = 225, size = 0.95, opacity = 0.64) {
  const positions = [];
  const colors = [];

  for (let i = 0; i < count; i += 1) {
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    positions.push(x, y, z);

    const tone = 0.52 + Math.random() * 0.44;
    const warmth = Math.random();
    if (warmth < 0.16) {
      colors.push(tone, tone * 0.84, tone * 0.72);
    } else if (warmth < 0.32) {
      colors.push(tone * 0.75, tone * 0.87, tone);
    } else {
      colors.push(tone * 0.89, tone * 0.92, tone);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size,
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false
    })
  );
}

function createMilkyWayShell() {
  const texture = createMilkyWayTexture();
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1.15, 1);
  texture.offset.set(-0.08, 0);

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(SKY_RADIUS + 7.5, 56, 34),
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  shell.rotation.z = toRad(56);
  shell.rotation.x = toRad(-12);
  return shell;
}

function createMilkyWayTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const centerY = canvas.height * 0.5;
  const width = canvas.height * 0.24;

  for (let y = 0; y < canvas.height; y += 1) {
    const dy = (y - centerY) / width;
    const gaussian = Math.exp(-dy * dy);
    const bandAlpha = Math.pow(gaussian, 1.05) * 0.48;
    if (bandAlpha < 0.015) continue;

    const gradient = ctx.createLinearGradient(0, y, canvas.width, y);
    gradient.addColorStop(0, `rgba(186, 207, 255, ${bandAlpha * 0.34})`);
    gradient.addColorStop(0.45, `rgba(228, 205, 176, ${bandAlpha * 0.42})`);
    gradient.addColorStop(1, `rgba(170, 199, 255, ${bandAlpha * 0.3})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, y, canvas.width, 1);
  }

  for (let i = 0; i < 4200; i += 1) {
    const x = Math.random() * canvas.width;
    const jitter = (Math.random() - 0.5) * width * 1.8;
    const y = centerY + jitter;
    const dy = (y - centerY) / width;
    const density = Math.exp(-dy * dy);
    if (Math.random() > density) continue;

    const size = 0.35 + Math.random() * 1.2 * density;
    const alpha = 0.02 + Math.random() * 0.16 * density;
    ctx.fillStyle = `rgba(240, 245, 255, ${alpha})`;
    ctx.fillRect(x, y, size, size);
  }

  for (let i = 0; i < 70; i += 1) {
    const x = Math.random() * canvas.width;
    const y = centerY + (Math.random() - 0.5) * width * 1.3;
    const size = 20 + Math.random() * 58;
    const alpha = 0.008 + Math.random() * 0.016;
    const color = i % 3 === 0 ? "190, 170, 150" : "160, 178, 210";
    const g = ctx.createRadialGradient(x, y, 0, x, y, size);
    g.addColorStop(0, `rgba(${color}, ${alpha})`);
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

function createHorizonAtmosphere() {
  const group = new THREE.Group();

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(HORIZON_RADIUS - 8, HORIZON_RADIUS + 34, 96),
    new THREE.MeshBasicMaterial({
      color: 0x5ea4ff,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.24;
  group.add(ring);

  const haze = new THREE.Mesh(
    new THREE.CylinderGeometry(HORIZON_RADIUS + 18, HORIZON_RADIUS + 18, 11, 96, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x78aef4,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  haze.position.y = 4.3;
  group.add(haze);

  return group;
}

function createGrassTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#3f6b40";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 22000; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const h = 1 + Math.random() * 5;
    const w = 1;

    const shade = 70 + Math.floor(Math.random() * 80);
    ctx.fillStyle = `rgb(${20 + Math.floor(shade * 0.25)}, ${shade}, ${18 + Math.floor(shade * 0.2)})`;
    ctx.fillRect(x, y, w, h);
  }

  for (let i = 0; i < 1800; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const s = 1 + Math.random() * 2;
    ctx.fillStyle = "rgba(195, 176, 108, 0.18)";
    ctx.fillRect(x, y, s, s);
  }

  return new THREE.CanvasTexture(canvas);
}

function getPlanetRaDec(planetKey, date) {
  const d = daysSinceJ2000(date);
  const earth = getHeliocentricEclipticXYZ("Earth", d);
  const planet = getHeliocentricEclipticXYZ(planetKey, d);
  const xg = planet.x - earth.x;
  const yg = planet.y - earth.y;
  const zg = planet.z - earth.z;

  const epsilon = toRad(23.4393 - 3.563e-7 * d);
  const xe = xg;
  const ye = yg * Math.cos(epsilon) - zg * Math.sin(epsilon);
  const ze = yg * Math.sin(epsilon) + zg * Math.cos(epsilon);

  const ra = Math.atan2(ye, xe);
  const dec = Math.atan2(ze, Math.hypot(xe, ye));
  return {
    raHours: normalizeDeg(toDeg(ra)) / 15,
    decDeg: toDeg(dec)
  };
}

function getHeliocentricEclipticXYZ(planetKey, d) {
  const el = PLANET_ELEMENTS[planetKey];
  if (!el) {
    return { x: 0, y: 0, z: 0 };
  }

  const N = toRad(normalizeDeg(el.N0 + el.Nd * d));
  const i = toRad(el.i0 + el.id * d);
  const w = toRad(normalizeDeg(el.w0 + el.wd * d));
  const a = el.a;
  const e = el.e0 + el.ed * d;
  const M = toRad(normalizeDeg(el.M0 + el.Md * d));
  const E = solveEccentricAnomaly(M, e);

  const xv = a * (Math.cos(E) - e);
  const yv = a * (Math.sqrt(1 - e * e) * Math.sin(E));
  const v = Math.atan2(yv, xv);
  const r = Math.hypot(xv, yv);

  const xh = r * (Math.cos(N) * Math.cos(v + w) - Math.sin(N) * Math.sin(v + w) * Math.cos(i));
  const yh = r * (Math.sin(N) * Math.cos(v + w) + Math.cos(N) * Math.sin(v + w) * Math.cos(i));
  const zh = r * (Math.sin(v + w) * Math.sin(i));
  return { x: xh, y: yh, z: zh };
}

function solveEccentricAnomaly(M, e) {
  let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
  for (let j = 0; j < 7; j += 1) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-7) break;
  }
  return E;
}

function raDecToHorizontal(raHours, decDeg, date, latDeg, lonDeg) {
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

function horizontalToVector(altDeg, azDeg, radius) {
  const alt = toRad(altDeg);
  const az = toRad(azDeg);

  return new THREE.Vector3(
    radius * Math.cos(alt) * Math.sin(az),
    radius * Math.sin(alt),
    -radius * Math.cos(alt) * Math.cos(az)
  );
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

function getSunRaDec(date) {
  const jd = toJulianDay(date);
  const d = jd - 2451545;
  const g = toRad(normalizeDeg(357.529 + 0.98560028 * d));
  const q = normalizeDeg(280.459 + 0.98564736 * d);
  const L = toRad(normalizeDeg(q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)));
  const epsilon = toRad(23.439 - 0.00000036 * d);

  const ra = Math.atan2(Math.cos(epsilon) * Math.sin(L), Math.cos(L));
  const dec = Math.asin(Math.sin(epsilon) * Math.sin(L));
  return {
    raHours: normalizeDeg(toDeg(ra)) / 15,
    decDeg: toDeg(dec)
  };
}

function computeSkyDarkness(sunAltDeg) {
  if (sunAltDeg <= -18) return 1;
  if (sunAltDeg >= -4) return 0;
  return clamp((-sunAltDeg - 4) / 14, 0, 1);
}

function getSkyConditionLabel(sunAltDeg) {
  const isEn = getLanguage() === "en";
  if (sunAltDeg <= -18) return isEn ? "Astronomical Night" : "천문박명 이후(암야)";
  if (sunAltDeg <= -12) return isEn ? "Astronomical Twilight" : "천문박명";
  if (sunAltDeg <= -6) return isEn ? "Nautical Twilight" : "항해박명";
  if (sunAltDeg <= -0.833) return isEn ? "Civil Twilight" : "시민박명";
  return isEn ? "Daylight" : "주간";
}

function toJulianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function daysSinceJ2000(date) {
  return toJulianDay(date) - 2451545.0;
}

function formatLatLon(lat, lon) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`;
}

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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

function getLanguage() {
  return window.cosmosSettings?.get()?.language === "en" ? "en" : "ko";
}
