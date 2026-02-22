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
const liveTimeInput = document.querySelector("#sky-live-time");
const syncSkyNowBtn = document.querySelector("#sync-sky-now");
const skyStatus = document.querySelector("#sky-status");

const toggleConstellations = document.querySelector("#toggle-constellations");
const toggleNebulae = document.querySelector("#toggle-nebulae");
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
scene.add(constellationGroup);
scene.add(nebulaGroup);

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
  betelgeuse: { name: "Betelgeuse", raHours: 5.9195, decDeg: 7.4071, mag: 0.45, color: 0xffb36d },
  bellatrix: { name: "Bellatrix", raHours: 5.4189, decDeg: 6.3497, mag: 1.64, color: 0xbdd8ff },
  rigel: { name: "Rigel", raHours: 5.2423, decDeg: -8.2016, mag: 0.13, color: 0xb9d6ff },
  saiph: { name: "Saiph", raHours: 5.7959, decDeg: -9.6696, mag: 2.06, color: 0xb6d2ff },
  alnitak: { name: "Alnitak", raHours: 5.6793, decDeg: -1.9426, mag: 1.77, color: 0xb7d5ff },
  alnilam: { name: "Alnilam", raHours: 5.6036, decDeg: -1.2019, mag: 1.69, color: 0xb8d5ff },
  mintaka: { name: "Mintaka", raHours: 5.5334, decDeg: -0.2991, mag: 2.23, color: 0xbbd7ff },
  dubhe: { name: "Dubhe", raHours: 11.0621, decDeg: 61.7508, mag: 1.79, color: 0xffd4a1 },
  merak: { name: "Merak", raHours: 11.0307, decDeg: 56.3824, mag: 2.37, color: 0xe2ecff },
  phecda: { name: "Phecda", raHours: 11.8972, decDeg: 53.6948, mag: 2.43, color: 0xecf2ff },
  megrez: { name: "Megrez", raHours: 12.257, decDeg: 57.0326, mag: 3.31, color: 0xeaf1ff },
  alioth: { name: "Alioth", raHours: 12.9005, decDeg: 55.9598, mag: 1.76, color: 0xf3f7ff },
  mizar: { name: "Mizar", raHours: 13.3987, decDeg: 54.9254, mag: 2.23, color: 0xf6f9ff },
  alkaid: { name: "Alkaid", raHours: 13.7923, decDeg: 49.3133, mag: 1.85, color: 0xc9ddff },
  vega: { name: "Vega", raHours: 18.6156, decDeg: 38.7837, mag: 0.03, color: 0xd2e4ff },
  deneb: { name: "Deneb", raHours: 20.6905, decDeg: 45.2803, mag: 1.25, color: 0xe2ebff },
  altair: { name: "Altair", raHours: 19.8464, decDeg: 8.8683, mag: 0.77, color: 0xf3f8ff }
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

let started = false;
let pendingStart = false;
let isDragging = false;
let yaw = toRad(180);
let pitch = toRad(35);
let lastX = 0;
let lastY = 0;
let lastStatusUpdate = 0;
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

initializeSkyTime();
buildLabels();
wireControls();
window.addEventListener("simulator:activate", ensureStarted);
window.addEventListener("resize", resizeRenderer);

if (simulatorView && !simulatorView.hidden) {
  ensureStarted();
}

function initializeSkyTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  skyTimeInput.value = `${hh}:${mm}`;
}

function buildLabels() {
  starEntries.forEach(([key, star]) => {
    addLabel(star.name, `star:${key}`, "star");
  });

  nebulaTargets.forEach((target) => {
    addLabel(target.name.replace("M", " M"), `nebula:${target.id}`, "nebula");
  });

  [
    ["N", 0],
    ["E", 90],
    ["S", 180],
    ["W", 270]
  ].forEach(([name, az]) => {
    addLabel(name, `cardinal:${name}`, "cardinal");
    vectorCache.set(`cardinal:${name}`, horizontalToVector(2, az, HORIZON_RADIUS + 2));
  });
}

function addLabel(text, key, type) {
  const el = document.createElement("span");
  el.className = `viewer-label ${type}`;
  el.textContent = text;
  labelLayer.appendChild(el);

  labels.push({
    element: el,
    key,
    type
  });
}

function wireControls() {
  toggleConstellations?.addEventListener("change", () => {
    constellationGroup.visible = toggleConstellations.checked;
  });

  toggleNebulae?.addEventListener("change", () => {
    nebulaGroup.visible = toggleNebulae.checked;
  });

  toggleLabels?.addEventListener("change", () => {
    labelLayer.style.display = toggleLabels.checked ? "block" : "none";
  });

  focusButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.getAttribute("data-focus");
      moveViewToFocus(mode);
    });
  });

  syncSkyNowBtn?.addEventListener("click", syncSkyToNow);

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

  const v = horizontalToVector(altDeg, azDeg, 1).normalize();
  pitch = Math.asin(v.y);
  yaw = Math.atan2(v.x, -v.z);
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

  if (liveTimeInput.checked) {
    updateContextFromInputs();
  }

  if (ts - lastStatusUpdate > 800) {
    updateStatus();
    updateCelestialPositions();
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

  if (getLanguage() === "en") {
    skyStatus.textContent = `Observer ${formatLatLon(currentContext.lat, currentContext.lon)} | Time ${yyyy}-${mm}-${dd} ${hh}:${min} | ${darknessLabel}`;
  } else {
    skyStatus.textContent = `관측 위치 ${formatLatLon(currentContext.lat, currentContext.lon)} | 기준 시각 ${yyyy}-${mm}-${dd} ${hh}:${min} | ${darknessLabel}`;
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
    if (!visible || !aboveHorizon) {
      element.style.opacity = "0";
      return;
    }

    element.style.opacity = "1";
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
