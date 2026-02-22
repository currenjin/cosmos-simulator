import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js";
import { TARGETS } from "./targets.js";

const container = document.querySelector("#sky-viewer");
if (!container) {
  throw new Error("#sky-viewer element not found");
}

const toggleConstellations = document.querySelector("#toggle-constellations");
const toggleNebulae = document.querySelector("#toggle-nebulae");
const toggleLabels = document.querySelector("#toggle-labels");
const focusButtons = document.querySelectorAll("[data-focus]");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x030914, 140, 250);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
camera.position.set(0, 0, 165);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 95;
controls.maxDistance = 220;
controls.target.set(0, 0, 0);

const ambient = new THREE.AmbientLight(0x8bb0ff, 0.45);
scene.add(ambient);

const fill = new THREE.DirectionalLight(0x9ec8ff, 0.75);
fill.position.set(50, 30, 40);
scene.add(fill);

const skySphere = new THREE.Mesh(
  new THREE.SphereGeometry(85, 48, 32),
  new THREE.MeshBasicMaterial({
    color: 0x08162b,
    wireframe: true,
    transparent: true,
    opacity: 0.18
  })
);
scene.add(skySphere);

const starCloud = createBackgroundStars(1800);
scene.add(starCloud);

const constellationGroup = new THREE.Group();
const nebulaGroup = new THREE.Group();
scene.add(constellationGroup);
scene.add(nebulaGroup);

const labelLayer = document.createElement("div");
labelLayer.className = "viewer-layer";
container.appendChild(labelLayer);

const labels = [];
const rayVector = new THREE.Vector3();

const brightStars = {
  betelgeuse: { name: "Betelgeuse", raHours: 5.9195, decDeg: 7.4071 },
  bellatrix: { name: "Bellatrix", raHours: 5.4189, decDeg: 6.3497 },
  rigel: { name: "Rigel", raHours: 5.2423, decDeg: -8.2016 },
  saiph: { name: "Saiph", raHours: 5.7959, decDeg: -9.6696 },
  alnitak: { name: "Alnitak", raHours: 5.6793, decDeg: -1.9426 },
  alnilam: { name: "Alnilam", raHours: 5.6036, decDeg: -1.2019 },
  mintaka: { name: "Mintaka", raHours: 5.5334, decDeg: -0.2991 },
  dubhe: { name: "Dubhe", raHours: 11.0621, decDeg: 61.7508 },
  merak: { name: "Merak", raHours: 11.0307, decDeg: 56.3824 },
  phecda: { name: "Phecda", raHours: 11.8972, decDeg: 53.6948 },
  megrez: { name: "Megrez", raHours: 12.257, decDeg: 57.0326 },
  alioth: { name: "Alioth", raHours: 12.9005, decDeg: 55.9598 },
  mizar: { name: "Mizar", raHours: 13.3987, decDeg: 54.9254 },
  alkaid: { name: "Alkaid", raHours: 13.7923, decDeg: 49.3133 },
  vega: { name: "Vega", raHours: 18.6156, decDeg: 38.7837 },
  deneb: { name: "Deneb", raHours: 20.6905, decDeg: 45.2803 },
  altair: { name: "Altair", raHours: 19.8464, decDeg: 8.8683 }
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

buildConstellationLayer();
buildNebulaLayer();
wireControls();
animate();

function buildConstellationLayer() {
  const starPositions = [];
  const starColors = [];

  Object.values(brightStars).forEach((star) => {
    const p = raDecToVector(star.raHours, star.decDeg, 84);
    starPositions.push(p.x, p.y, p.z);
    starColors.push(0.68, 0.83, 1.0);
    addLabel(star.name, p, "star");
  });

  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
  starsGeometry.setAttribute("color", new THREE.Float32BufferAttribute(starColors, 3));

  const starsMaterial = new THREE.PointsMaterial({
    size: 2.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true
  });

  constellationGroup.add(new THREE.Points(starsGeometry, starsMaterial));

  const linePositions = [];
  constellationLines.forEach(([a, b]) => {
    const pa = raDecToVector(brightStars[a].raHours, brightStars[a].decDeg, 83.7);
    const pb = raDecToVector(brightStars[b].raHours, brightStars[b].decDeg, 83.7);
    linePositions.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
  });

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x77baff,
    transparent: true,
    opacity: 0.58
  });

  constellationGroup.add(new THREE.LineSegments(lineGeometry, lineMaterial));
}

function buildNebulaLayer() {
  const interestingTargets = TARGETS.filter((target) =>
    ["Nebula", "Planetary Nebula", "Galaxy", "Globular Cluster"].includes(target.type)
  );

  const positions = [];
  const colors = [];

  interestingTargets.forEach((target) => {
    const p = raDecToVector(target.raHours, target.decDeg, 82);
    positions.push(p.x, p.y, p.z);

    if (target.type.includes("Galaxy")) {
      colors.push(1.0, 0.75, 0.68);
    } else if (target.type.includes("Globular")) {
      colors.push(0.8, 1.0, 0.76);
    } else {
      colors.push(0.72, 0.93, 1.0);
    }

    addLabel(target.name.replace("M", " M"), p, "nebula");
  });

  const nebulaGeometry = new THREE.BufferGeometry();
  nebulaGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  nebulaGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const nebulaMaterial = new THREE.PointsMaterial({
    size: 3.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
  });

  nebulaGroup.add(new THREE.Points(nebulaGeometry, nebulaMaterial));
}

function addLabel(text, point, type) {
  const el = document.createElement("span");
  el.className = `viewer-label ${type}`;
  el.textContent = text;
  labelLayer.appendChild(el);

  labels.push({
    element: el,
    point: point.clone()
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
      moveCameraToFocus(mode);
    });
  });

  window.addEventListener("resize", resizeRenderer);
}

function moveCameraToFocus(mode) {
  const focus = {
    orion: { raHours: 5.5, decDeg: -1.5 },
    "ursa-major": { raHours: 12.3, decDeg: 56.0 },
    summer: { raHours: 19.7, decDeg: 30.0 }
  }[mode];

  if (!focus) return;

  const direction = raDecToVector(focus.raHours, focus.decDeg, 1).normalize();
  const distance = camera.position.length();
  camera.position.copy(direction.multiplyScalar(distance));
  controls.update();
}

function resizeRenderer() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  skySphere.rotation.y += 0.00035;
  starCloud.rotation.y += 0.00025;

  updateLabels();
  renderer.render(scene, camera);
}

function updateLabels() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  labels.forEach(({ element, point }) => {
    rayVector.copy(point).project(camera);

    const x = (rayVector.x * 0.5 + 0.5) * width;
    const y = (-rayVector.y * 0.5 + 0.5) * height;

    const visible = rayVector.z < 1 && rayVector.z > -1;
    if (!visible) {
      element.style.opacity = "0";
      return;
    }

    element.style.opacity = "1";
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });
}

function createBackgroundStars(count) {
  const positions = [];
  const colors = [];

  for (let i = 0; i < count; i += 1) {
    const radius = 120 + Math.random() * 80;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    positions.push(x, y, z);

    const tone = 0.6 + Math.random() * 0.4;
    colors.push(tone * 0.82, tone * 0.9, tone);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    depthWrite: false
  });

  return new THREE.Points(geometry, material);
}

function raDecToVector(raHours, decDeg, radius) {
  const ra = (raHours / 24) * Math.PI * 2;
  const dec = (decDeg * Math.PI) / 180;

  return new THREE.Vector3(
    radius * Math.cos(dec) * Math.cos(ra),
    radius * Math.sin(dec),
    radius * Math.cos(dec) * Math.sin(ra)
  );
}
