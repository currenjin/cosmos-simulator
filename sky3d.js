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
const skySearchResults = document.querySelector("#sky-search-results");
const skyPresetDayBtn = document.querySelector("#sky-preset-day");
const skyPresetYearBtn = document.querySelector("#sky-preset-year");
const skyPresetStopBtn = document.querySelector("#sky-preset-stop");
const syncSkyNowBtn = document.querySelector("#sync-sky-now");
const skyStatus = document.querySelector("#sky-status");
const scaleAweEl = document.querySelector("#scale-awe");
const scaleAccuracyEl = document.querySelector("#scale-accuracy");
const scaleCinematicEl = document.querySelector("#scale-cinematic");
const scaleStoryEl = document.querySelector("#scale-story");
const scaleCounterEl = document.querySelector("#scale-counter");
const scaleButtons = document.querySelectorAll(".scale-btn");
const scaleTourBtn = document.querySelector("#scale-tour-btn");

const toggleConstellations = document.querySelector("#toggle-constellations");
const toggleNebulae = document.querySelector("#toggle-nebulae");
const togglePlanets = document.querySelector("#toggle-planets");
const toggleLabels = document.querySelector("#toggle-labels");
const focusButtons = document.querySelectorAll("[data-focus]");
const constellationSelect = document.querySelector("#constellation-select");

const SKY_RADIUS = 92;
const HORIZON_RADIUS = 86;
const DAY_CYCLE_SPEED = 1440;
const YEAR_CYCLE_SPEED = 86400;

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

const solarScaleGroup = new THREE.Group();
const galaxyScaleGroup = new THREE.Group();
const localScaleGroup = new THREE.Group();
const scaleDepthGroup = new THREE.Group();
scene.add(solarScaleGroup);
scene.add(galaxyScaleGroup);
scene.add(localScaleGroup);
scene.add(scaleDepthGroup);

const scaleDepthNear = createScaleDepthParticles(440, 180, 260, 1.35, 0x7cb9ff, 0.4);
const scaleDepthMid = createScaleDepthParticles(360, 260, 360, 1.1, 0xc5dcff, 0.26);
const scaleDepthFar = createScaleDepthParticles(280, 360, 520, 1.0, 0xf6d39e, 0.2);
scaleDepthGroup.add(scaleDepthNear, scaleDepthMid, scaleDepthFar);

const labelLayer = document.createElement("div");
labelLayer.className = "viewer-layer";

const labels = [];
const rayVector = new THREE.Vector3();
const vectorCache = new Map();
const scaleLabelAnchors = new Map();
const scaleLabelPoint = new THREE.Vector3();

const brightStars = {
  betelgeuse: { name: "Betelgeuse", koName: "베텔게우스", raHours: 5.9195, decDeg: 7.4071, mag: 0.45, color: 0xffb36d },
  bellatrix: { name: "Bellatrix", koName: "벨라트릭스", raHours: 5.4189, decDeg: 6.3497, mag: 1.64, color: 0xbdd8ff },
  rigel: { name: "Rigel", koName: "리겔", raHours: 5.2423, decDeg: -8.2016, mag: 0.13, color: 0xb9d6ff },
  saiph: { name: "Saiph", koName: "사이프", raHours: 5.7959, decDeg: -9.6696, mag: 2.06, color: 0xb6d2ff },
  alnitak: { name: "Alnitak", koName: "알니타크", raHours: 5.6793, decDeg: -1.9426, mag: 1.77, color: 0xb7d5ff },
  alnilam: { name: "Alnilam", koName: "알닐람", raHours: 5.6036, decDeg: -1.2019, mag: 1.69, color: 0xb8d5ff },
  mintaka: { name: "Mintaka", koName: "민타카", raHours: 5.5334, decDeg: -0.2991, mag: 2.23, color: 0xbbd7ff },
  caph: { name: "Caph", koName: "카프", raHours: 0.1529, decDeg: 59.1498, mag: 2.27, color: 0xf8f9ff },
  schedar: { name: "Schedar", koName: "셰다르", raHours: 0.6751, decDeg: 56.5373, mag: 2.24, color: 0xffcf96 },
  tsih: { name: "Tsih", koName: "치", raHours: 0.9451, decDeg: 60.7167, mag: 2.15, color: 0xd9e7ff },
  ruchbah: { name: "Ruchbah", koName: "루흐바", raHours: 1.4303, decDeg: 60.2354, mag: 2.68, color: 0xe4eeff },
  segin: { name: "Segin", koName: "세긴", raHours: 2.2939, decDeg: 63.6701, mag: 3.35, color: 0xebf1ff },
  dubhe: { name: "Dubhe", koName: "두베", raHours: 11.0621, decDeg: 61.7508, mag: 1.79, color: 0xffd4a1 },
  merak: { name: "Merak", koName: "메라크", raHours: 11.0307, decDeg: 56.3824, mag: 2.37, color: 0xe2ecff },
  phecda: { name: "Phecda", koName: "페크다", raHours: 11.8972, decDeg: 53.6948, mag: 2.43, color: 0xecf2ff },
  megrez: { name: "Megrez", koName: "메그레즈", raHours: 12.257, decDeg: 57.0326, mag: 3.31, color: 0xeaf1ff },
  alioth: { name: "Alioth", koName: "알리오트", raHours: 12.9005, decDeg: 55.9598, mag: 1.76, color: 0xf3f7ff },
  mizar: { name: "Mizar", koName: "미자르", raHours: 13.3987, decDeg: 54.9254, mag: 2.23, color: 0xf6f9ff },
  alkaid: { name: "Alkaid", koName: "알카이드", raHours: 13.7923, decDeg: 49.3133, mag: 1.85, color: 0xc9ddff },
  vega: { name: "Vega", koName: "베가", raHours: 18.6156, decDeg: 38.7837, mag: 0.03, color: 0xd2e4ff },
  sheliak: { name: "Sheliak", koName: "셸리악", raHours: 18.8347, decDeg: 33.3627, mag: 3.52, color: 0xdce9ff },
  sulafat: { name: "Sulafat", koName: "술라파트", raHours: 18.9824, decDeg: 32.6896, mag: 3.25, color: 0xe4eeff },
  deneb: { name: "Deneb", koName: "데네브", raHours: 20.6905, decDeg: 45.2803, mag: 1.25, color: 0xe2ebff },
  sadr: { name: "Sadr", koName: "사드르", raHours: 20.3705, decDeg: 40.2567, mag: 2.23, color: 0xe3ecff },
  gienah: { name: "Gienah", koName: "기에나", raHours: 20.7702, decDeg: 33.9703, mag: 2.46, color: 0xd7e5ff },
  deltaCygni: { name: "Delta Cygni", koName: "델타 시그니", raHours: 19.7496, decDeg: 45.1308, mag: 2.87, color: 0xdde8ff },
  albireo: { name: "Albireo", koName: "알비레오", raHours: 19.512, decDeg: 27.9597, mag: 3.18, color: 0xffd9a6 },
  altair: { name: "Altair", koName: "알타이르", raHours: 19.8464, decDeg: 8.8683, mag: 0.77, color: 0xf3f8ff },
  tarazed: { name: "Tarazed", koName: "타라제드", raHours: 19.7709, decDeg: 10.6133, mag: 2.72, color: 0xffd09b },
  alshain: { name: "Alshain", koName: "알샤인", raHours: 19.9219, decDeg: 6.4068, mag: 3.71, color: 0xe6efff },
  antares: { name: "Antares", koName: "안타레스", raHours: 16.4901, decDeg: -26.4319, mag: 1.06, color: 0xff8f7c },
  dschubba: { name: "Dschubba", koName: "주바", raHours: 16.0056, decDeg: -22.6217, mag: 2.29, color: 0xcadfff },
  acrab: { name: "Acrab", koName: "아크랍", raHours: 16.0906, decDeg: -19.8066, mag: 2.56, color: 0xd8e7ff },
  shaula: { name: "Shaula", koName: "샤울라", raHours: 17.5601, decDeg: -37.1038, mag: 1.62, color: 0xcadfff },
  lesath: { name: "Lesath", koName: "레사스", raHours: 17.5127, decDeg: -37.2958, mag: 2.69, color: 0xe4eeff },
  sargas: { name: "Sargas", koName: "사르가스", raHours: 17.6219, decDeg: -42.9978, mag: 1.86, color: 0xffd0a6 }
};

const constellationLines = [
  ["betelgeuse", "bellatrix"],
  ["bellatrix", "rigel"],
  ["rigel", "saiph"],
  ["saiph", "betelgeuse"],
  ["bellatrix", "mintaka"],
  ["mintaka", "alnilam"],
  ["alnilam", "alnitak"],
  ["alnitak", "rigel"],
  ["betelgeuse", "alnitak"],
  ["schedar", "caph"],
  ["schedar", "tsih"],
  ["tsih", "ruchbah"],
  ["ruchbah", "segin"],
  ["dubhe", "merak"],
  ["merak", "phecda"],
  ["phecda", "megrez"],
  ["megrez", "dubhe"],
  ["megrez", "alioth"],
  ["alioth", "mizar"],
  ["mizar", "alkaid"],
  ["vega", "sheliak"],
  ["sheliak", "sulafat"],
  ["sulafat", "vega"],
  ["deneb", "sadr"],
  ["sadr", "albireo"],
  ["sadr", "gienah"],
  ["sadr", "deltaCygni"],
  ["altair", "tarazed"],
  ["altair", "alshain"],
  ["acrab", "dschubba"],
  ["dschubba", "antares"],
  ["antares", "shaula"],
  ["shaula", "lesath"],
  ["lesath", "sargas"],
  ["vega", "deneb"],
  ["deneb", "altair"],
  ["altair", "vega"]
];

const CONSTELLATION_CATALOG = [
  { id: "andromeda", en: "Andromeda", ko: "안드로메다자리", raHours: 1.45, decDeg: 37.8 },
  { id: "aquarius", en: "Aquarius", ko: "물병자리", raHours: 22.2, decDeg: -8.5 },
  { id: "aquila", en: "Aquila", ko: "독수리자리", raHours: 19.87, decDeg: 8.9 },
  { id: "aries", en: "Aries", ko: "양자리", raHours: 2.65, decDeg: 20.2 },
  { id: "auriga", en: "Auriga", ko: "마차부자리", raHours: 5.55, decDeg: 44.8 },
  { id: "bootes", en: "Bootes", ko: "목동자리", raHours: 14.7, decDeg: 30.9 },
  { id: "canis-major", en: "Canis Major", ko: "큰개자리", raHours: 6.82, decDeg: -23.5 },
  { id: "canis-minor", en: "Canis Minor", ko: "작은개자리", raHours: 7.55, decDeg: 1.5 },
  { id: "capricornus", en: "Capricornus", ko: "염소자리", raHours: 21.0, decDeg: -18.0 },
  { id: "cassiopeia", en: "Cassiopeia", ko: "카시오페이아자리", raHours: 1.1, decDeg: 60.1 },
  { id: "cygnus", en: "Cygnus", ko: "백조자리", raHours: 20.37, decDeg: 40.3 },
  { id: "gemini", en: "Gemini", ko: "쌍둥이자리", raHours: 7.25, decDeg: 24.5 },
  { id: "hercules", en: "Hercules", ko: "헤르쿨레스자리", raHours: 17.2, decDeg: 28.3 },
  { id: "leo", en: "Leo", ko: "사자자리", raHours: 10.65, decDeg: 17.3 },
  { id: "libra", en: "Libra", ko: "천칭자리", raHours: 15.2, decDeg: -15.0 },
  { id: "lyra", en: "Lyra", ko: "거문고자리", raHours: 18.8, decDeg: 36.2 },
  { id: "orion", en: "Orion", ko: "오리온자리", raHours: 5.6, decDeg: -1.4 },
  { id: "pegasus", en: "Pegasus", ko: "페가수스자리", raHours: 23.5, decDeg: 22.0 },
  { id: "perseus", en: "Perseus", ko: "페르세우스자리", raHours: 3.35, decDeg: 45.2 },
  { id: "pisces", en: "Pisces", ko: "물고기자리", raHours: 1.0, decDeg: 11.0 },
  { id: "sagittarius", en: "Sagittarius", ko: "궁수자리", raHours: 18.6, decDeg: -29.4 },
  { id: "scorpius", en: "Scorpius", ko: "전갈자리", raHours: 16.8, decDeg: -31.1 },
  { id: "taurus", en: "Taurus", ko: "황소자리", raHours: 4.7, decDeg: 18.5 },
  { id: "ursa-major", en: "Ursa Major", ko: "큰곰자리", raHours: 12.4, decDeg: 55.7 },
  { id: "ursa-minor", en: "Ursa Minor", ko: "작은곰자리", raHours: 15.0, decDeg: 77.0 },
  { id: "virgo", en: "Virgo", ko: "처녀자리", raHours: 13.1, decDeg: -2.0 }
];

const CONSTELLATION_SKETCHES = [
  {
    id: "taurus",
    segments: [
      [4.5987, 16.5093, 5.4382, 28.6074],
      [4.5987, 16.5093, 4.4769, 19.1804],
      [4.4769, 19.1804, 3.7914, 24.1051]
    ]
  },
  {
    id: "gemini",
    segments: [
      [7.5767, 31.8883, 7.7553, 28.0262],
      [7.5767, 31.8883, 6.7322, 25.1311],
      [7.7553, 28.0262, 6.6285, 16.3993]
    ]
  },
  {
    id: "leo",
    segments: [
      [10.3329, 19.8415, 10.1395, 11.9672],
      [10.1395, 11.9672, 11.2373, 15.4296],
      [11.2373, 15.4296, 11.2351, 20.5237],
      [11.2351, 20.5237, 11.8177, 14.5721]
    ]
  },
  {
    id: "virgo",
    segments: [
      [13.0363, 10.9591, 12.6943, -1.4494],
      [12.6943, -1.4494, 13.4199, -11.1614]
    ]
  },
  {
    id: "sagittarius",
    segments: [
      [18.0968, -30.4241, 18.3499, -29.8281],
      [18.3499, -29.8281, 18.9211, -26.2967],
      [18.3499, -29.8281, 18.4029, -34.3846],
      [18.9211, -26.2967, 19.0435, -29.8801]
    ]
  },
  {
    id: "pegasus",
    segments: [
      [23.0793, 15.2053, 23.0629, 28.0828],
      [23.0629, 28.0828, 0.1398, 29.0904],
      [0.1398, 29.0904, 0.2206, 15.1836],
      [0.2206, 15.1836, 23.0793, 15.2053]
    ]
  },
  {
    id: "andromeda",
    segments: [
      [0.1398, 29.0904, 1.1622, 35.6206],
      [1.1622, 35.6206, 2.0649, 42.3297]
    ]
  },
  {
    id: "perseus",
    segments: [
      [3.4054, 49.8612, 3.1361, 40.9556],
      [3.4054, 49.8612, 4.1444, 47.7125]
    ]
  },
  {
    id: "auriga",
    segments: [
      [5.2782, 45.998, 5.9921, 44.9474],
      [5.9921, 44.9474, 5.1086, 41.2345]
    ]
  },
  {
    id: "bootes",
    segments: [
      [14.261, 19.1825, 14.7498, 27.0742],
      [14.7498, 27.0742, 14.5346, 38.3083],
      [14.5346, 38.3083, 15.0324, 40.3906]
    ]
  },
  {
    id: "hercules",
    segments: [
      [16.5037, 21.4896, 16.6881, 31.6031],
      [16.6881, 31.6031, 16.7149, 38.9223],
      [16.7149, 38.9223, 17.2505, 36.8091],
      [17.2505, 36.8091, 16.5037, 21.4896]
    ]
  },
  {
    id: "canis-major",
    segments: [
      [6.7525, -16.7161, 6.3783, -17.9559],
      [6.7525, -16.7161, 7.1399, -26.3932],
      [7.1399, -26.3932, 6.9771, -28.9721]
    ]
  },
  {
    id: "canis-minor",
    segments: [[7.655, -5.225, 7.4525, 8.2893]]
  },
  {
    id: "aries",
    segments: [
      [2.1196, 23.4624, 2.8331, 27.2605],
      [2.8331, 27.2605, 3.1938, 19.7267]
    ]
  },
  {
    id: "capricornus",
    segments: [
      [20.3009, -12.5449, 20.7683, -25.2709],
      [20.7683, -25.2709, 21.784, -16.1273]
    ]
  },
  {
    id: "aquarius",
    segments: [
      [22.2805, -0.0201, 22.8769, -7.5796],
      [22.8769, -7.5796, 23.1574, -21.1725]
    ]
  },
  {
    id: "pisces",
    segments: [
      [0.3433, 8.1903, 1.5247, 15.3458],
      [1.5247, 15.3458, 1.2292, 24.5837]
    ]
  },
  {
    id: "libra",
    segments: [
      [15.2834, -9.3829, 15.5921, -14.7895],
      [15.5921, -14.7895, 14.8479, -16.0418]
    ]
  }
];

const SCALE_OBJECT_LABELS = {
  "scale:galaxy-core": { mode: "galaxy", ko: "은하 중심", en: "Galactic Core" },
  "scale:galaxy-sun": { mode: "galaxy", ko: "태양 위치", en: "Sun Position" },
  "scale:local-mw": { mode: "local", ko: "우리은하", en: "Milky Way" },
  "scale:local-andromeda": { mode: "local", ko: "안드로메다은하 (M31)", en: "Andromeda (M31)" },
  "scale:local-triangulum": { mode: "local", ko: "삼각형자리은하 (M33)", en: "Triangulum (M33)" },
  "scale:local-lmc": { mode: "local", ko: "대마젤란운", en: "Large Magellanic Cloud" },
  "scale:local-smc": { mode: "local", ko: "소마젤란운", en: "Small Magellanic Cloud" },
  "scale:local-m32": { mode: "local", ko: "M32", en: "M32" },
  "scale:local-m110": { mode: "local", ko: "M110", en: "M110" }
};

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

const sketchSegments = CONSTELLATION_SKETCHES.flatMap((item) =>
  item.segments.map((segment) => ({
    id: item.id,
    raA: segment[0],
    decA: segment[1],
    raB: segment[2],
    decB: segment[3]
  }))
);
const sketchLinePositions = new Float32Array(sketchSegments.length * 6);
const sketchLineGeometry = new THREE.BufferGeometry();
sketchLineGeometry.setAttribute("position", new THREE.BufferAttribute(sketchLinePositions, 3));
const sketchLineSegments = new THREE.LineSegments(
  sketchLineGeometry,
  new THREE.LineBasicMaterial({ color: 0x87c7ff, transparent: true, opacity: 0.34 })
);
constellationGroup.add(sketchLineSegments);

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
  ]),
  ...CONSTELLATION_CATALOG.map((item) => ({
    key: `constellation:${item.id}`,
    type: "constellation",
    name: item.en,
    raHours: item.raHours,
    decDeg: item.decDeg
  })),
  ...CONSTELLATION_CATALOG.map((item) => ({
    key: `constellation:${item.id}`,
    type: "constellation",
    name: item.ko,
    raHours: item.raHours,
    decDeg: item.decDeg
  }))
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
let scaleMode = "sky";
let scaleTransition = 1;
let scaleTransitionFrom = null;
let scaleTransitionTo = null;
let scaleTransitionStart = 0;
let scaleTransitionDuration = 1450;
let scaleOrbitYaw = 0;
let scaleOrbitPitch = 0.35;
let scaleOrbitRadius = 120;
let skyTrackActive = false;
let targetYaw = yaw;
let targetPitch = pitch;
let scaleFollowTargetKey = "";
const scaleLookCenter = new THREE.Vector3(0, 0, 0);
let cinematicUntil = 0;
let cinematicMode = "sky";
let scaleCounterFromLy = 1 / 63241;
let scaleCounterToLy = 1 / 63241;
let scaleCounterStart = performance.now();
let scaleCounterDuration = 1500;
let autoTourActive = false;
let autoTourIndex = -1;
let autoTourHoldUntil = 0;
let autoTourLastStage = "";

const scaleScene = createScaleScenes();
setScaleMode("sky", false);

const skyNightColor = new THREE.Color(0x071425);
const skyTwilightColor = new THREE.Color(0x2c3d58);
const fogNightColor = new THREE.Color(0x030914);
const fogTwilightColor = new THREE.Color(0x2e4d72);

initializeObserverInputs();
initializeSkyTime();
timeSpeed = Number(skySpeedInput?.value || "1");
buildLabels();
initializeSearchOptions();
initializeConstellationSelect();
renderSearchResults([]);
updateSearchPlaceholder();
wireControls();
updateScaleTourButtonText();
window.addEventListener("simulator:activate", ensureStarted);
window.addEventListener("resize", resizeRenderer);
window.addEventListener("cosmos:settings-changed", () => {
  updateSearchPlaceholder();
  refreshConstellationSelectOptions();
  refreshLabelTexts();
  updateScaleAweText();
  updateScaleStoryText();
  updateScaleAccuracyBadge();
  updateScaleTourButtonText();
  renderSearchResults(getSearchMatches(skySearchInput?.value || ""));
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

  CONSTELLATION_CATALOG.forEach((item) => {
    addLabel(`constellation:${item.id}`, "constellation");
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

  Object.keys(SCALE_OBJECT_LABELS).forEach((key) => {
    addLabel(key, "scale-object");
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
  if (type === "constellation") {
    const id = labelKey.replace("constellation:", "");
    const item = CONSTELLATION_CATALOG.find((constellation) => constellation.id === id);
    if (!item) return id;
    return lang === "en" ? item.en : item.ko;
  }
  if (type === "cardinal") {
    const axis = labelKey.replace("cardinal:", "");
    if (lang === "en") return axis;
    const mapKo = { N: "북", E: "동", S: "남", W: "서" };
    return mapKo[axis] || axis;
  }
  if (type === "scale-object") {
    const meta = SCALE_OBJECT_LABELS[labelKey];
    if (!meta) return labelKey;
    return lang === "en" ? meta.en : meta.ko;
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
      stopAutoScaleTour();
      if (scaleMode !== "sky") {
        setScaleMode("sky", false);
      }
      const mode = button.getAttribute("data-focus");
      moveViewToFocus(mode);
    });
  });

  syncSkyNowBtn?.addEventListener("click", syncSkyToNow);
  scaleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      stopAutoScaleTour();
      const mode = button.getAttribute("data-scale");
      if (!mode) return;
      setScaleMode(mode, true);
    });
  });
  scaleTourBtn?.addEventListener("click", () => {
    if (autoTourActive) {
      stopAutoScaleTour();
    } else {
      startAutoScaleTour();
    }
  });
  skyPresetDayBtn?.addEventListener("click", () => applyTimePreset("day"));
  skyPresetYearBtn?.addEventListener("click", () => applyTimePreset("year"));
  skyPresetStopBtn?.addEventListener("click", () => applyTimePreset("stop"));
  skySpeedInput?.addEventListener("change", () => {
    const next = Number(skySpeedInput.value);
    setTimeSpeed(next);
  });

  skySearchBtn?.addEventListener("click", focusSearchTarget);
  skySearchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      stopAutoScaleTour();
      focusSearchTarget();
    }
  });
  skySearchInput?.addEventListener("input", () => {
    renderSearchResults(getSearchMatches(skySearchInput.value || ""));
  });
  constellationSelect?.addEventListener("change", () => {
    const id = constellationSelect.value;
    if (!id) return;
    stopAutoScaleTour();
    focusConstellationById(id, true);
  });

  renderer.domElement.addEventListener("pointerdown", (event) => {
    stopAutoScaleTour();
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    skyTrackActive = false;
    if (scaleMode !== "sky") {
      scaleFollowTargetKey = "";
    }
    renderer.domElement.setPointerCapture(event.pointerId);
  });

  renderer.domElement.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;

    if (scaleMode === "sky") {
      yaw -= dx * 0.0055;
      pitch += dy * 0.0042;
      pitch = clamp(pitch, toRad(-12), toRad(86));
    } else {
      scaleOrbitYaw -= dx * 0.0042;
      scaleOrbitPitch += dy * 0.0036;
      scaleOrbitPitch = clamp(scaleOrbitPitch, toRad(-78), toRad(78));
    }
  });

  renderer.domElement.addEventListener("pointerup", (event) => {
    isDragging = false;
    renderer.domElement.releasePointerCapture(event.pointerId);
  });

  renderer.domElement.addEventListener(
    "wheel",
    (event) => {
      stopAutoScaleTour();
      event.preventDefault();
      if (scaleMode === "sky") {
        camera.fov = clamp(camera.fov + event.deltaY * 0.02, 30, 90);
        camera.updateProjectionMatrix();
      } else {
        scaleOrbitRadius = clamp(scaleOrbitRadius + event.deltaY * 0.08, 18, 620);
      }
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
  if (mode === "orion" || mode === "ursa-major") {
    focusConstellationById(mode, true);
    if (constellationSelect) {
      constellationSelect.value = mode;
    }
    return;
  }

  const focus = {
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

  if (constellationSelect) {
    constellationSelect.value = "";
  }
  moveViewToHorizontal(altDeg, azDeg);
}

function moveViewToHorizontal(altDeg, azDeg, smooth = true) {
  const v = horizontalToVector(altDeg, azDeg, 1).normalize();
  const nextPitch = Math.asin(v.y);
  const nextYaw = Math.atan2(v.x, -v.z);
  if (smooth) {
    targetPitch = nextPitch;
    targetYaw = nextYaw;
    skyTrackActive = true;
    return;
  }
  pitch = nextPitch;
  yaw = nextYaw;
  targetPitch = nextPitch;
  targetYaw = nextYaw;
  skyTrackActive = false;
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

function initializeConstellationSelect() {
  if (!constellationSelect) return;
  refreshConstellationSelectOptions();
}

function refreshConstellationSelectOptions() {
  if (!constellationSelect) return;
  const lang = getLanguage();
  const current = constellationSelect.value;
  const placeholder = lang === "en" ? "Select constellation" : "별자리를 선택하세요";
  const options = [
    `<option value="">${placeholder}</option>`,
    ...CONSTELLATION_CATALOG.map(
      (item) => `<option value="${item.id}">${lang === "en" ? item.en : item.ko}</option>`
    )
  ];
  constellationSelect.innerHTML = options.join("");
  if (current && CONSTELLATION_CATALOG.some((item) => item.id === current)) {
    constellationSelect.value = current;
  }
}

function focusConstellationById(id, smooth = true) {
  const constellation = CONSTELLATION_CATALOG.find((item) => item.id === id);
  if (!constellation) return;
  applyTargetFocus(
    {
      key: `constellation:${constellation.id}`,
      type: "constellation",
      name: getLanguage() === "en" ? constellation.en : constellation.ko,
      raHours: constellation.raHours,
      decDeg: constellation.decDeg
    },
    smooth
  );
}

function focusSearchTarget() {
  stopAutoScaleTour();
  const raw = skySearchInput?.value?.trim();
  if (!raw) return;
  const matches = getSearchMatches(raw, 8);
  renderSearchResults(matches);
  const target = findSearchTarget(raw, matches);
  if (!target) {
    setStatusHint(getLanguage() === "en" ? `No match for "${raw}"` : `"${raw}"에 해당하는 천체를 찾지 못했습니다.`);
    searchHitKey = "";
    return;
  }

  applyTargetFocus(target, true);
}

function findSearchTarget(query, precomputedMatches = null) {
  const q = normalizeSearch(query);
  if (!q) return null;

  if (precomputedMatches && precomputedMatches.length > 0) {
    return precomputedMatches[0];
  }
  const exact = searchableTargets.find((target) => normalizeSearch(target.name) === q);
  if (exact) return exact;

  return searchableTargets.find((target) => normalizeSearch(target.name).includes(q)) || null;
}

function getSearchMatches(query, limit = 8) {
  const q = normalizeSearch(query || "");
  if (!q) return [];

  const ranked = searchableTargets
    .map((target) => {
      const n = normalizeSearch(target.name);
      const index = n.indexOf(q);
      if (index < 0) return null;
      const exact = n === q ? 0 : 1;
      const startsWith = index === 0 ? 0 : 1;
      return { ...target, score: exact * 100 + startsWith * 10 + index };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score);

  const unique = new Map();
  ranked.forEach((target) => {
    if (!unique.has(target.key)) {
      unique.set(target.key, target);
    }
  });

  return Array.from(unique.values()).slice(0, limit);
}

function renderSearchResults(matches) {
  if (!skySearchResults) return;
  if (!matches || matches.length === 0) {
    skySearchResults.innerHTML = `<span class="empty">${getLanguage() === "en" ? "Type to see matching objects" : "입력하면 일치하는 천체가 표시됩니다"}</span>`;
    return;
  }

  skySearchResults.innerHTML = "";
  matches.forEach((target) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result-item";
    button.textContent = getTargetDisplayName(target);
    button.addEventListener("click", () => {
      if (skySearchInput) {
        skySearchInput.value = getTargetDisplayName(target);
      }
      renderSearchResults(getSearchMatches(skySearchInput?.value || ""));
      applyTargetFocus(target, true);
    });
    skySearchResults.appendChild(button);
  });
}

function getTargetDisplayName(target) {
  const lang = getLanguage();
  if (target.type === "planet") {
    const key = target.key.replace("planet:", "");
    return lang === "en" ? key : PLANET_NAME_KO[key] || key;
  }
  if (target.type === "star") {
    const key = target.key.replace("star:", "");
    const star = brightStars[key];
    if (!star) return target.name;
    return lang === "en" ? star.name : star.koName || star.name;
  }
  if (target.type === "nebula") {
    const id = target.key.replace("nebula:", "");
    const nebula = nebulaTargets.find((item) => item.id === id);
    if (!nebula) return target.name;
    return lang === "en" ? TARGET_NAME_EN_BY_ID[id] || nebula.name : nebula.name;
  }
  if (target.type === "constellation") {
    const id = target.key.replace("constellation:", "");
    const constellation = CONSTELLATION_CATALOG.find((item) => item.id === id);
    if (!constellation) return target.name;
    return lang === "en" ? constellation.en : constellation.ko;
  }
  return target.name;
}

function applyTargetFocus(target, smooth) {
  if (!target) return;

  searchHitKey = target.key;
  const display = getTargetDisplayName(target);
  if (target.type === "planet") {
    scaleFollowTargetKey = target.key;
    if (scaleMode !== "solar") {
      setScaleMode("solar", true);
    }
    setStatusHint(getLanguage() === "en" ? `Following: ${display}` : `추적 중: ${display}`, 2600);
    return;
  }

  scaleFollowTargetKey = "";
  if (target.type === "constellation" && constellationSelect) {
    constellationSelect.value = target.key.replace("constellation:", "");
  }
  if (scaleMode !== "sky") {
    setScaleMode("sky", false);
  }
  const equatorial = { raHours: target.raHours, decDeg: target.decDeg };
  const { altDeg, azDeg } = raDecToHorizontal(
    equatorial.raHours,
    equatorial.decDeg,
    currentContext.date,
    currentContext.lat,
    currentContext.lon
  );
  moveViewToHorizontal(altDeg, azDeg, smooth);
  setStatusHint(getLanguage() === "en" ? `Focused: ${display}` : `포커스: ${display}`, 2200);
}

function normalizeSearch(value) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function setStatusHint(text, ttlMs = 2800) {
  statusHint = text;
  statusHintUntil = Date.now() + ttlMs;
}

function updateScaleTourButtonText() {
  if (!scaleTourBtn) return;
  const lang = getLanguage();
  scaleTourBtn.classList.toggle("is-active", autoTourActive);
  scaleTourBtn.textContent = autoTourActive
    ? lang === "en"
      ? "Stop Tour"
      : "투어 중지"
    : lang === "en"
      ? "Start Scale Tour"
      : "스케일 투어 시작";
}

function startAutoScaleTour() {
  autoTourActive = true;
  autoTourIndex = -1;
  autoTourHoldUntil = performance.now();
  autoTourLastStage = "";
  updateScaleTourButtonText();
  setStatusHint(getLanguage() === "en" ? "Scale tour started" : "스케일 투어를 시작합니다", 2200);
}

function stopAutoScaleTour() {
  if (!autoTourActive) return;
  autoTourActive = false;
  autoTourIndex = -1;
  autoTourHoldUntil = 0;
  autoTourLastStage = "";
  updateScaleTourButtonText();
  setStatusHint(getLanguage() === "en" ? "Scale tour stopped" : "스케일 투어를 중지했습니다", 1800);
}

function updateAutoScaleTour(ts) {
  if (!autoTourActive) return;
  const sequence = ["sky", "solar", "galaxy", "local"];

  if (autoTourIndex < 0) {
    autoTourIndex = 0;
    autoTourLastStage = sequence[0];
    if (scaleMode !== sequence[0]) {
      setScaleMode(sequence[0], true);
    }
    autoTourHoldUntil = ts + 1900;
    return;
  }

  const currentStage = sequence[autoTourIndex];
  if (scaleMode !== currentStage) {
    setScaleMode(currentStage, true);
    autoTourHoldUntil = ts + 1900;
    return;
  }

  if (scaleTransition < 1) return;
  if (ts < autoTourHoldUntil) return;

  autoTourIndex += 1;
  if (autoTourIndex >= sequence.length) {
    autoTourActive = false;
    autoTourIndex = -1;
    autoTourHoldUntil = 0;
    updateScaleTourButtonText();
    setStatusHint(getLanguage() === "en" ? "Scale tour completed" : "스케일 투어를 완료했습니다", 2200);
    return;
  }
  autoTourLastStage = sequence[autoTourIndex];
  setScaleMode(autoTourLastStage, true);
  autoTourHoldUntil = ts + 2300;
}

function applyTimePreset(preset) {
  if (preset === "day") {
    setTimeSpeed(DAY_CYCLE_SPEED);
    setStatusHint(
      getLanguage() === "en"
        ? "24-hour cycle playback enabled"
        : "24시간 일주 운동 재생을 시작했습니다",
      2200
    );
    return;
  }
  if (preset === "year") {
    setTimeSpeed(YEAR_CYCLE_SPEED);
    setStatusHint(
      getLanguage() === "en"
        ? "1-year seasonal playback enabled"
        : "1년 계절 변화 재생을 시작했습니다",
      2200
    );
    return;
  }
  setTimeSpeed(0);
  setStatusHint(getLanguage() === "en" ? "Simulation paused" : "시뮬레이션 일시정지", 2200);
}

function setTimeSpeed(value) {
  const next = Number(value);
  timeSpeed = Number.isFinite(next) && next >= 0 ? next : 1;
  ensureSpeedOption(timeSpeed);
  if (skySpeedInput) {
    skySpeedInput.value = String(timeSpeed);
  }

  if (timeSpeed !== 1 && liveTimeInput.checked) {
    liveTimeInput.checked = false;
    currentContext.date = new Date();
    syncInputsFromContext();
  }

  updateCelestialPositions();
  updateStatus();
}

function ensureSpeedOption(speed) {
  if (!skySpeedInput) return;
  const value = String(speed);
  const exists = Array.from(skySpeedInput.options).some((opt) => opt.value === value);
  if (exists) return;
  const option = document.createElement("option");
  option.value = value;
  option.textContent = `x${speed}`;
  skySpeedInput.appendChild(option);
}

function createScaleScenes() {
  const solar = createSolarScaleScene();
  const galaxy = createGalaxyScaleScene();
  const local = createLocalGroupScaleScene();
  return { solar, galaxy, local };
}

function createSolarScaleScene() {
  const planetMeshes = new Map();
  const scale = 6.5;

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 28, 20),
    new THREE.MeshStandardMaterial({
      color: 0xffc978,
      emissive: 0x8a4a00,
      emissiveIntensity: 0.35
    })
  );
  solarScaleGroup.add(sun);
  const sunGlow = createGlowSphere(6.4, 0xffc978, 0.24);
  solarScaleGroup.add(sunGlow);

  const earthOrbit = new THREE.Mesh(
    new THREE.RingGeometry(scale * 0.98, scale * 1.02, 160),
    new THREE.MeshBasicMaterial({
      color: 0xffde9d,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide
    })
  );
  earthOrbit.rotation.x = -Math.PI / 2;
  solarScaleGroup.add(earthOrbit);

  const outerReference = new THREE.Mesh(
    new THREE.RingGeometry(scale * 29.8, scale * 30.2, 256),
    new THREE.MeshBasicMaterial({
      color: 0x8fb7ec,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    })
  );
  outerReference.rotation.x = -Math.PI / 2;
  solarScaleGroup.add(outerReference);

  planetTargets.forEach((planet) => {
    const orbit = new THREE.Mesh(
      new THREE.RingGeometry(scale * (getOrbitRadius(planet.key) - 0.05), scale * (getOrbitRadius(planet.key) + 0.05), 128),
      new THREE.MeshBasicMaterial({
        color: 0x6b8fbe,
        transparent: true,
        opacity: 0.26,
        side: THREE.DoubleSide
      })
    );
    orbit.rotation.x = -Math.PI / 2;
    solarScaleGroup.add(orbit);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(planet.size * 0.18, 18, 14),
      new THREE.MeshStandardMaterial({
        color: planet.color,
        emissive: 0x121212,
        emissiveIntensity: 0.15
      })
    );
    solarScaleGroup.add(mesh);
    planetMeshes.set(planet.key, mesh);
  });

  return {
    planetMeshes,
    scale,
    pulseMaterials: [sunGlow.material, earthOrbit.material, outerReference.material]
  };
}

function createGalaxyScaleScene() {
  const disk = new THREE.Mesh(
    new THREE.CircleGeometry(130, 96),
    new THREE.MeshBasicMaterial({
      color: 0x6f8fd4,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide
    })
  );
  disk.rotation.x = -Math.PI / 2;
  galaxyScaleGroup.add(disk);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(8.5, 28, 20),
    new THREE.MeshBasicMaterial({
      color: 0xffd9a3,
      transparent: true,
      opacity: 0.9
    })
  );
  core.position.y = 0.6;
  galaxyScaleGroup.add(core);
  const coreGlow = createGlowSphere(22, 0xffd5a3, 0.2);
  coreGlow.position.y = 0.6;
  galaxyScaleGroup.add(coreGlow);

  const spiralArms = [];
  const armColors = [0x8cb8ff, 0x9bc4ff, 0x87b0f8, 0xa7ceff];
  for (let i = 0; i < 4; i += 1) {
    const arm = createSpiralArm(22, 126, i * (Math.PI / 2), armColors[i], 0.26);
    arm.position.y = 0.8;
    galaxyScaleGroup.add(arm);
    spiralArms.push(arm);
  }

  const centralBar = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 24, 20),
    new THREE.MeshBasicMaterial({
      color: 0xffc892,
      transparent: true,
      opacity: 0.5
    })
  );
  centralBar.rotation.z = Math.PI / 2;
  centralBar.position.y = 0.9;
  galaxyScaleGroup.add(centralBar);

  const sunMarker = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 14, 10),
    new THREE.MeshBasicMaterial({
      color: 0x8fdfff
    })
  );
  sunMarker.position.set(68, 1, 18);
  galaxyScaleGroup.add(sunMarker);
  scaleLabelAnchors.set("scale:galaxy-core", core);
  scaleLabelAnchors.set("scale:galaxy-sun", sunMarker);

  const sunOrbitPath = new THREE.Mesh(
    new THREE.RingGeometry(70, 72, 200),
    new THREE.MeshBasicMaterial({
      color: 0x9dd0ff,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    })
  );
  sunOrbitPath.rotation.x = -Math.PI / 2;
  galaxyScaleGroup.add(sunOrbitPath);

  const globularHalo = createScaleDepthParticles(220, 34, 122, 1.2, 0xc9dcff, 0.2);
  globularHalo.position.y = 3.2;
  galaxyScaleGroup.add(globularHalo);

  const distanceLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.8, 0), sunMarker.position.clone()]),
    new THREE.LineBasicMaterial({
      color: 0xb8d9ff,
      transparent: true,
      opacity: 0.34
    })
  );
  galaxyScaleGroup.add(distanceLine);

  const ring26kly = new THREE.Mesh(
    new THREE.RingGeometry(69.4, 70.6, 220),
    new THREE.MeshBasicMaterial({
      color: 0xffd395,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide
    })
  );
  ring26kly.rotation.x = -Math.PI / 2;
  galaxyScaleGroup.add(ring26kly);

  return {
    disk,
    core,
    sunMarker,
    pulseMaterials: [
      disk.material,
      coreGlow.material,
      distanceLine.material,
      sunOrbitPath.material,
      ring26kly.material,
      ...spiralArms.map((arm) => arm.material),
      centralBar.material
    ]
  };
}

function createLocalGroupScaleScene() {
  const mw = new THREE.Mesh(
    new THREE.CircleGeometry(30, 40),
    new THREE.MeshBasicMaterial({
      color: 0xa6b9ff,
      transparent: true,
      opacity: 0.46
    })
  );
  mw.rotation.x = -Math.PI / 2;
  mw.position.set(-86, 0, 0);
  localScaleGroup.add(mw);
  scaleLabelAnchors.set("scale:local-mw", mw);
  const mwGlow = createGlowSphere(44, 0xa8beff, 0.14);
  mwGlow.position.copy(mw.position);
  localScaleGroup.add(mwGlow);

  const andromeda = new THREE.Mesh(
    new THREE.CircleGeometry(38, 48),
    new THREE.MeshBasicMaterial({
      color: 0xffd7b1,
      transparent: true,
      opacity: 0.42
    })
  );
  andromeda.rotation.x = -Math.PI / 2;
  andromeda.position.set(112, 0, -34);
  localScaleGroup.add(andromeda);
  scaleLabelAnchors.set("scale:local-andromeda", andromeda);
  const andromedaGlow = createGlowSphere(54, 0xffd7b5, 0.12);
  andromedaGlow.position.copy(andromeda.position);
  localScaleGroup.add(andromedaGlow);

  const triangulum = new THREE.Mesh(
    new THREE.CircleGeometry(14, 30),
    new THREE.MeshBasicMaterial({
      color: 0xc8d8ff,
      transparent: true,
      opacity: 0.4
    })
  );
  triangulum.rotation.x = -Math.PI / 2;
  triangulum.position.set(72, 0, 36);
  localScaleGroup.add(triangulum);
  scaleLabelAnchors.set("scale:local-triangulum", triangulum);

  const lmc = new THREE.Mesh(
    new THREE.CircleGeometry(9, 24),
    new THREE.MeshBasicMaterial({
      color: 0x9fd1ff,
      transparent: true,
      opacity: 0.38
    })
  );
  lmc.rotation.x = -Math.PI / 2;
  lmc.position.set(-52, 0, -22);
  localScaleGroup.add(lmc);
  scaleLabelAnchors.set("scale:local-lmc", lmc);

  const smc = new THREE.Mesh(
    new THREE.CircleGeometry(6, 20),
    new THREE.MeshBasicMaterial({
      color: 0xb4daff,
      transparent: true,
      opacity: 0.34
    })
  );
  smc.rotation.x = -Math.PI / 2;
  smc.position.set(-38, 0, -34);
  localScaleGroup.add(smc);
  scaleLabelAnchors.set("scale:local-smc", smc);

  const m32 = new THREE.Mesh(
    new THREE.CircleGeometry(5, 18),
    new THREE.MeshBasicMaterial({
      color: 0xffe0be,
      transparent: true,
      opacity: 0.38
    })
  );
  m32.rotation.x = -Math.PI / 2;
  m32.position.set(98, 0, -20);
  localScaleGroup.add(m32);
  scaleLabelAnchors.set("scale:local-m32", m32);

  const m110 = new THREE.Mesh(
    new THREE.CircleGeometry(6, 18),
    new THREE.MeshBasicMaterial({
      color: 0xffd8b4,
      transparent: true,
      opacity: 0.32
    })
  );
  m110.rotation.x = -Math.PI / 2;
  m110.position.set(127, 0, -49);
  localScaleGroup.add(m110);
  scaleLabelAnchors.set("scale:local-m110", m110);

  const bridge = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([mw.position.clone(), andromeda.position.clone()]),
    new THREE.LineBasicMaterial({
      color: 0x7da7dd,
      transparent: true,
      opacity: 0.28
    })
  );
  localScaleGroup.add(bridge);

  const bridgeTri = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([mw.position.clone(), triangulum.position.clone()]),
    new THREE.LineBasicMaterial({
      color: 0x8db2e2,
      transparent: true,
      opacity: 0.2
    })
  );
  localScaleGroup.add(bridgeTri);

  const bridgeAndTri = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([andromeda.position.clone(), triangulum.position.clone()]),
    new THREE.LineBasicMaterial({
      color: 0x93b8ea,
      transparent: true,
      opacity: 0.2
    })
  );
  localScaleGroup.add(bridgeAndTri);

  return {
    mw,
    andromeda,
    pulseMaterials: [
      bridge.material,
      bridgeTri.material,
      bridgeAndTri.material,
      mwGlow.material,
      andromedaGlow.material,
      triangulum.material,
      lmc.material,
      smc.material
    ]
  };
}

function setScaleMode(mode, animated = true) {
  const validMode = ["sky", "solar", "galaxy", "local"].includes(mode) ? mode : "sky";
  const prevMode = scaleMode;
  scaleMode = validMode;
  cinematicMode = scaleMode;
  updateScaleButtons();
  updateScaleAweText();
  updateScaleAccuracyBadge();
  updateScaleStoryText();
  scaleLookCenter.copy(getScaleCenter(scaleMode));
  scaleCounterFromLy = getScaleRepresentativeLy(prevMode);
  scaleCounterToLy = getScaleRepresentativeLy(scaleMode);
  scaleCounterStart = performance.now();
  scaleCounterDuration = 1700;
  if (scaleMode !== "sky") {
    cinematicUntil = performance.now() + 1900;
  } else {
    cinematicUntil = 0;
  }

  const skyVisible = scaleMode === "sky";
  dome.visible = skyVisible;
  backgroundStars.visible = skyVisible;
  milkyWay.visible = skyVisible;
  constellationGroup.visible = skyVisible;
  nebulaGroup.visible = skyVisible;
  planetGroup.visible = skyVisible;
  horizonRing.visible = skyVisible;
  horizonAtmosphere.visible = skyVisible;
  ground.visible = skyVisible;
  scaleDepthGroup.visible = !skyVisible;

  solarScaleGroup.visible = scaleMode === "solar";
  galaxyScaleGroup.visible = scaleMode === "galaxy";
  localScaleGroup.visible = scaleMode === "local";
  if (scaleMode !== "solar") {
    scaleFollowTargetKey = "";
  }

  if (scaleMode === "sky") {
    updateContextFromInputs();
    updateCelestialPositions();
  }

  const from = captureCameraState(prevMode);
  const to = getCameraPreset(scaleMode);
  if (scaleMode !== "sky") {
    setScaleOrbitFromPreset(scaleMode, to);
  }
  if (animated) {
    scaleTransition = 0;
    scaleTransitionFrom = from;
    scaleTransitionTo = to;
    scaleTransitionStart = performance.now();
    scaleTransitionDuration = 1450;
  } else {
    scaleTransition = 1;
    scaleTransitionFrom = to;
    scaleTransitionTo = to;
    applyCameraState(to);
  }
}

function setScaleOrbitFromPreset(mode, preset) {
  const center = getScaleCenter(mode);
  const offset = preset.position.clone().sub(center);
  const radius = Math.max(0.001, offset.length());
  scaleOrbitRadius = radius;
  scaleOrbitYaw = Math.atan2(offset.x, offset.z);
  scaleOrbitPitch = Math.asin(clamp(offset.y / radius, -1, 1));
}

function updateScaleButtons() {
  scaleButtons.forEach((button) => {
    button.classList.toggle("is-active", button.getAttribute("data-scale") === scaleMode);
  });
}

function updateScaleAweText() {
  if (!scaleAweEl) return;
  const lang = getLanguage();
  const textByMode = {
    sky: {
      ko: "하늘 모드: 드래그 회전, 휠 확대/축소로 관측 시점을 확인하세요.",
      en: "Sky mode: drag to rotate and use wheel zoom to inspect your observing view."
    },
    solar: {
      ko: "태양계 모드: 태양 중심 궤도(대략)입니다. 드래그/휠로 직접 검증하세요.",
      en: "Solar mode: approximate heliocentric orbits. Drag and zoom to inspect directly."
    },
    galaxy: {
      ko: "은하 모드: 중심 팽대부, 나선팔, 태양 궤도(약 2.6만 광년)를 함께 확인해보세요.",
      en: "Galaxy mode: inspect the bulge, spiral arms, and the Sun's orbit (~26k ly)."
    },
    local: {
      ko: "국부은하군 모드: 우리은하-안드로메다-삼각형자리은하와 위성은하 연결을 확인하세요.",
      en: "Local Group mode: inspect MW-Andromeda-Triangulum and satellite galaxy links."
    }
  };
  scaleAweEl.textContent = textByMode[scaleMode][lang];
}

function updateScaleStoryText() {
  if (!scaleStoryEl) return;
  const lang = getLanguage();
  const storyByMode = {
    sky: {
      ko: "지금 보는 하늘은 지금 여기의 시간과 공간을 그대로 비춘다.",
      en: "This sky reflects your exact place and time, right now."
    },
    solar: {
      ko: "태양계의 점 하나가 곧 지구 궤도다. 같은 별 아래 속도만 다를 뿐이다.",
      en: "A tiny point here is an Earth orbit; under one star, only speed differs."
    },
    galaxy: {
      ko: "우리 태양은 은하 외곽의 작은 점이다. 중심빛은 약 2만6천 년을 건너온다.",
      en: "Our Sun is a tiny outer-disk point; core light takes about 26,000 years to reach us."
    },
    local: {
      ko: "안드로메다의 빛은 약 250만 년 전 출발했다. 우리는 과거를 보고 있다.",
      en: "Andromeda’s light left about 2.5 million years ago; you are seeing the past."
    }
  };
  scaleStoryEl.textContent = storyByMode[scaleMode][lang];
}

function getScaleRepresentativeLy(mode) {
  if (mode === "solar") return 30 / 63241;
  if (mode === "galaxy") return 26000;
  if (mode === "local") return 2_500_000;
  return 1 / 63241;
}

function formatLyValue(ly, lang) {
  const abs = Math.max(ly, 1e-9);
  if (abs < 0.01) {
    const au = abs * 63241;
    return `${au.toFixed(1)} AU`;
  }
  if (abs < 1000) {
    return `${abs.toFixed(abs < 10 ? 2 : 1)} ${lang === "en" ? "ly" : "광년"}`;
  }
  if (abs < 1_000_000) {
    return `${(abs / 1000).toFixed(1)} ${lang === "en" ? "kly" : "천 광년"}`;
  }
  return `${(abs / 1_000_000).toFixed(2)} ${lang === "en" ? "Mly" : "백만 광년"}`;
}

function updateCinematicOverlay(ts) {
  const inCinematic = ts < cinematicUntil && scaleMode !== "sky";
  simulatorView?.classList.toggle("cinematic-active", inCinematic);
  scaleCinematicEl?.classList.toggle("is-visible", scaleMode !== "sky");
  if (!scaleCounterEl) return;
  const t = clamp((ts - scaleCounterStart) / scaleCounterDuration, 0, 1);
  const eased = easeInOutCubic(t);
  const ly = scaleCounterFromLy + (scaleCounterToLy - scaleCounterFromLy) * eased;
  const lang = getLanguage();
  const prefix = lang === "en" ? "Scale Distance" : "스케일 거리";
  scaleCounterEl.textContent = `${prefix}: ${formatLyValue(ly, lang)}`;
}

function updateScaleAccuracyBadge() {
  if (!scaleAccuracyEl) return;
  const lang = getLanguage();
  const metaByMode = {
    sky: {
      className: "is-observed",
      ko: "정확도: 관측 기반",
      en: "Accuracy: Observation-based"
    },
    solar: {
      className: "is-approx",
      ko: "정확도: 근사 모델",
      en: "Accuracy: Approximate model"
    },
    galaxy: {
      className: "is-concept",
      ko: "정확도: 개념적 배치",
      en: "Accuracy: Conceptual layout"
    },
    local: {
      className: "is-concept",
      ko: "정확도: 개념적 배치",
      en: "Accuracy: Conceptual layout"
    }
  };

  const meta = metaByMode[scaleMode] || metaByMode.sky;
  scaleAccuracyEl.className = `scale-accuracy-badge ${meta.className}`;
  scaleAccuracyEl.textContent = lang === "en" ? meta.en : meta.ko;
}

function captureCameraState(mode) {
  const currentDirection = new THREE.Vector3();
  camera.getWorldDirection(currentDirection);
  const currentState = {
    position: camera.position.clone(),
    lookAt: camera.position.clone().add(currentDirection),
    fov: camera.fov
  };

  if (mode !== "sky") {
    return currentState;
  }

  if (mode === "sky") {
    const lookDirection = new THREE.Vector3(
      Math.cos(pitch) * Math.sin(yaw),
      Math.sin(pitch),
      -Math.cos(pitch) * Math.cos(yaw)
    );
    return {
      position: camera.position.clone(),
      lookAt: camera.position.clone().add(lookDirection),
      fov: camera.fov
    };
  }
  return currentState;
}

function getCameraPreset(mode) {
  const presets = {
    sky: {
      position: new THREE.Vector3(0, 2.2, 0),
      lookAt: new THREE.Vector3(0, 12, -80),
      fov: 70
    },
    solar: {
      position: new THREE.Vector3(0, 24, 56),
      lookAt: new THREE.Vector3(0, 0, 0),
      fov: 58
    },
    galaxy: {
      position: new THREE.Vector3(0, 118, 240),
      lookAt: new THREE.Vector3(0, 0, 0),
      fov: 52
    },
    local: {
      position: new THREE.Vector3(48, 180, 430),
      lookAt: new THREE.Vector3(12, 0, -10),
      fov: 48
    }
  };
  return presets[mode] || presets.sky;
}

function getScaleCenter(mode) {
  if (mode === "local") return new THREE.Vector3(12, 0, -10);
  return new THREE.Vector3(0, 0, 0);
}

function getScaleFollowCenter(mode) {
  if (mode === "solar" && scaleFollowTargetKey.startsWith("planet:")) {
    const planetKey = scaleFollowTargetKey.replace("planet:", "");
    const node = scaleScene.solar.planetMeshes.get(planetKey);
    if (node) {
      return node.position.clone();
    }
  }
  return getScaleCenter(mode);
}

function updateScaleTransition(ts) {
  if (scaleTransition >= 1 || !scaleTransitionFrom || !scaleTransitionTo) return;
  const t = clamp((ts - scaleTransitionStart) / scaleTransitionDuration, 0, 1);
  scaleTransition = easeInOutCubic(t);
}

function applyCameraForScale() {
  if (scaleMode === "sky" && scaleTransition >= 1) {
    const lookDirection = new THREE.Vector3(
      Math.cos(pitch) * Math.sin(yaw),
      Math.sin(pitch),
      -Math.cos(pitch) * Math.cos(yaw)
    );
    camera.lookAt(camera.position.clone().add(lookDirection));
    return;
  }

  if (scaleTransition < 1) {
    const from = scaleTransitionFrom || getCameraPreset(scaleMode);
    const to = scaleTransitionTo || getCameraPreset(scaleMode);
    const position = from.position.clone().lerp(to.position, scaleTransition);
    const lookAt = from.lookAt.clone().lerp(to.lookAt, scaleTransition);
    camera.position.copy(position);
    camera.fov = from.fov + (to.fov - from.fov) * scaleTransition;
    camera.updateProjectionMatrix();
    camera.lookAt(lookAt);
    return;
  }

  const center = getScaleFollowCenter(scaleMode);
  scaleLookCenter.lerp(center, 0.18);
  const breath = !isDragging ? 1 + Math.sin(lastFrameTs * 0.00024) * 0.016 : 1;
  const radius = scaleOrbitRadius * breath;
  const orbitalPos = new THREE.Vector3(
    scaleLookCenter.x + radius * Math.cos(scaleOrbitPitch) * Math.sin(scaleOrbitYaw),
    scaleLookCenter.y + radius * Math.sin(scaleOrbitPitch),
    scaleLookCenter.z + radius * Math.cos(scaleOrbitPitch) * Math.cos(scaleOrbitYaw)
  );
  camera.position.copy(orbitalPos);
  camera.lookAt(scaleLookCenter);
}

function applyCameraState(state) {
  camera.position.copy(state.position);
  camera.fov = state.fov;
  camera.updateProjectionMatrix();
  camera.lookAt(state.lookAt);
}

function updateScaleScene(ts) {
  const pulse = 0.5 + 0.5 * Math.sin(ts * 0.0018);

  if (scaleMode === "solar") {
    updateSolarScalePositions();
    solarScaleGroup.rotation.y += 0.00045;
    scaleScene.solar.pulseMaterials?.forEach((material, index) => {
      material.opacity = 0.12 + pulse * (0.18 + index * 0.05);
    });
  } else if (scaleMode === "galaxy") {
    galaxyScaleGroup.rotation.y += 0.00016;
    scaleScene.galaxy.pulseMaterials?.forEach((material, index) => {
      material.opacity = 0.14 + (0.5 + 0.5 * Math.sin(ts * 0.0012 + index)) * 0.2;
    });
  } else if (scaleMode === "local") {
    localScaleGroup.rotation.y += 0.00008;
    scaleScene.local.pulseMaterials?.forEach((material, index) => {
      material.opacity = 0.12 + (0.5 + 0.5 * Math.sin(ts * 0.00075 + index)) * 0.18;
    });
  }

  if (scaleMode !== "sky") {
    scaleDepthNear.rotation.y += 0.00011;
    scaleDepthMid.rotation.y -= 0.00007;
    scaleDepthFar.rotation.y += 0.00004;
    applyScaleAtmosphere(ts);
  }
}

function applyScaleAtmosphere(ts) {
  const pulse = 0.5 + 0.5 * Math.sin(ts * 0.0009);
  if (scaleMode === "solar") {
    scene.fog.color.setRGB(0.08 + pulse * 0.03, 0.06 + pulse * 0.02, 0.05);
    ambient.color.setRGB(1.0, 0.8, 0.62);
    fill.color.setRGB(1.0, 0.88, 0.72);
    renderer.toneMappingExposure = 1.05;
    return;
  }
  if (scaleMode === "galaxy") {
    scene.fog.color.setRGB(0.03, 0.05 + pulse * 0.03, 0.09 + pulse * 0.04);
    ambient.color.setRGB(0.62, 0.74, 0.96);
    fill.color.setRGB(0.7, 0.86, 1.0);
    renderer.toneMappingExposure = 0.92;
    return;
  }
  if (scaleMode === "local") {
    scene.fog.color.setRGB(0.03, 0.035 + pulse * 0.015, 0.065 + pulse * 0.025);
    ambient.color.setRGB(0.56, 0.66, 0.9);
    fill.color.setRGB(0.67, 0.77, 1.0);
    renderer.toneMappingExposure = 0.88;
  }
}

function updateSolarScalePositions() {
  const d = daysSinceJ2000(currentContext.date);

  planetTargets.forEach((planet) => {
    const node = scaleScene.solar.planetMeshes.get(planet.key);
    if (!node) return;
    const h = getHeliocentricEclipticXYZ(planet.key, d);
    const x = h.x * scaleScene.solar.scale;
    const y = h.z * scaleScene.solar.scale * 0.55;
    const z = h.y * scaleScene.solar.scale;
    node.position.set(x, y, z);
  });
}

function getOrbitRadius(planetKey) {
  if (planetKey === "Mercury") return 0.39;
  if (planetKey === "Venus") return 0.72;
  if (planetKey === "Mars") return 1.52;
  if (planetKey === "Jupiter") return 5.2;
  if (planetKey === "Saturn") return 9.54;
  return 1;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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

function createGlowSphere(radius, color, opacity) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 28, 20),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
}

function createSpiralArm(startRadius, endRadius, phase, color, opacity) {
  const points = [];
  const turns = 1.65;
  const segments = 140;
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const radius = startRadius + (endRadius - startRadius) * t;
    const theta = phase + t * Math.PI * 2 * turns;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const y = (Math.sin(t * Math.PI * 3 + phase) * 1.8) * (1 - t * 0.55);
    points.push(new THREE.Vector3(x, y, z));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity
    })
  );
}

function createScaleDepthParticles(count, minRadius, maxRadius, size, color, opacity) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const base = i * 3;
    positions[base] = radius * Math.sin(phi) * Math.cos(theta);
    positions[base + 1] = radius * Math.cos(phi);
    positions[base + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });
  return new THREE.Points(geometry, material);
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

  sketchSegments.forEach((segment, index) => {
    const a = raDecToHorizontal(segment.raA, segment.decA, date, lat, lon);
    const b = raDecToHorizontal(segment.raB, segment.decB, date, lat, lon);
    const va = horizontalToVector(a.altDeg, a.azDeg, SKY_RADIUS - 0.8);
    const vb = horizontalToVector(b.altDeg, b.azDeg, SKY_RADIUS - 0.8);
    const base = index * 6;
    sketchLinePositions[base] = va.x;
    sketchLinePositions[base + 1] = va.y;
    sketchLinePositions[base + 2] = va.z;
    sketchLinePositions[base + 3] = vb.x;
    sketchLinePositions[base + 4] = vb.y;
    sketchLinePositions[base + 5] = vb.z;
  });
  sketchLineGeometry.attributes.position.needsUpdate = true;

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

  CONSTELLATION_CATALOG.forEach((item) => {
    const { altDeg, azDeg } = raDecToHorizontal(item.raHours, item.decDeg, date, lat, lon);
    const v = horizontalToVector(altDeg, azDeg, SKY_RADIUS - 2.8);
    vectorCache.set(`constellation:${item.id}`, v);
  });
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
    if (scaleMode === "sky") {
      updateCelestialPositions();
    }
    updateScaleScene(ts);
    updateStatus();
    lastStatusUpdate = ts;
  }

  if (scaleMode === "sky" && skyTrackActive) {
    const yawDelta = shortestAngleDelta(yaw, targetYaw);
    yaw += yawDelta * 0.12;
    pitch += (targetPitch - pitch) * 0.12;
    if (Math.abs(yawDelta) < 0.0009 && Math.abs(targetPitch - pitch) < 0.0009) {
      yaw = targetYaw;
      pitch = targetPitch;
      skyTrackActive = false;
    }
  }

  updateAutoScaleTour(ts);
  updateScaleTransition(ts);

  backgroundStars.rotation.y += 0.000045;
  starCloudNear.rotation.y -= 0.00002;
  starCloudFar.rotation.y += 0.000028;
  milkyWay.rotation.y += 0.00003;

  const twinkle = 0.85 + Math.sin(ts * 0.0013) * 0.05;
  const darkness = currentSkyState.darkness;
  const skyVisibility = scaleMode === "sky" ? 1 : 0;
  starPoints.material.opacity = ((0.14 + darkness * 0.84) * twinkle) * skyVisibility;
  nebulaPoints.material.opacity = (0.02 + darkness * 0.88 + Math.sin(ts * 0.0008) * 0.02) * skyVisibility;
  planetPoints.material.opacity = (0.22 + darkness * 0.76) * skyVisibility;
  starCloudNear.material.opacity = (0.06 + darkness * 0.76) * skyVisibility;
  starCloudMid.material.opacity = (0.04 + darkness * 0.4) * skyVisibility;
  starCloudFar.material.opacity = (0.03 + darkness * 0.25) * skyVisibility;
  milkyWay.material.opacity = (0.02 + darkness * 0.36) * skyVisibility;

  const horizonLift = clamp((Math.sin(pitch) + 0.15) * 0.5, 0.05, 1);
  const twilightFactor = 1 - darkness;
  horizonAtmosphere.children[0].material.opacity = 0.1 + twilightFactor * 0.26 + (1 - horizonLift) * 0.12;
  horizonAtmosphere.children[1].material.opacity = 0.05 + twilightFactor * 0.2 + (1 - horizonLift) * 0.08;
  domeMaterial.opacity = 0.76 + darkness * 0.2 + (1 - horizonLift) * 0.05;
  domeMaterial.color.lerpColors(skyTwilightColor, skyNightColor, darkness);
  if (scaleMode === "sky") {
    scene.fog.color.lerpColors(fogTwilightColor, fogNightColor, darkness);
    ambient.color.set(0x8bb0ff);
    fill.color.set(0xb2ceff);
    renderer.toneMappingExposure = 0.95;
  }

  updateCinematicOverlay(ts);
  applyCameraForScale();

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
  const modeLabel = ` | ${getLanguage() === "en" ? "Scale" : "스케일"} ${getScaleModeName()}`;
  const activeHint = Date.now() < statusHintUntil ? ` | ${statusHint}` : "";

  if (getLanguage() === "en") {
    skyStatus.textContent = `Observer ${formatLatLon(currentContext.lat, currentContext.lon)} | Time ${yyyy}-${mm}-${dd} ${hh}:${min} | ${darknessLabel}${modeLabel}${speedLabel}${activeHint}`;
  } else {
    skyStatus.textContent = `관측 위치 ${formatLatLon(currentContext.lat, currentContext.lon)} | 기준 시각 ${yyyy}-${mm}-${dd} ${hh}:${min} | ${darknessLabel}${modeLabel}${speedLabel}${activeHint}`;
  }
}

function getScaleModeName() {
  if (scaleMode === "solar") return getLanguage() === "en" ? "Solar" : "태양계";
  if (scaleMode === "galaxy") return getLanguage() === "en" ? "Galaxy" : "은하";
  if (scaleMode === "local") return getLanguage() === "en" ? "Local Group" : "국부은하군";
  return getLanguage() === "en" ? "Sky" : "하늘";
}

function updateLabels() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  labels.forEach(({ element, key, type }) => {
    let point = vectorCache.get(key);
    if (type === "scale-object") {
      const meta = SCALE_OBJECT_LABELS[key];
      const anchor = scaleLabelAnchors.get(key);
      const validMode = meta?.mode === scaleMode && scaleMode !== "sky";
      if (!anchor || !validMode) {
        element.style.opacity = "0";
        return;
      }
      anchor.getWorldPosition(scaleLabelPoint);
      point = scaleLabelPoint;
    }

    if (!point) {
      element.style.opacity = "0";
      return;
    }

    rayVector.copy(point).project(camera);

    const x = (rayVector.x * 0.5 + 0.5) * width;
    const y = (-rayVector.y * 0.5 + 0.5) * height;

    const visible = rayVector.z < 1 && rayVector.z > -1;
    const aboveHorizon = type === "scale-object" ? true : point.y > 0 || type === "cardinal";
    const typeVisible =
      type === "star"
        ? scaleMode === "sky" && toggleConstellations?.checked !== false
        : type === "nebula"
          ? scaleMode === "sky" && toggleNebulae?.checked !== false
          : type === "planet"
            ? scaleMode === "sky" && togglePlanets?.checked !== false
            : type === "constellation"
              ? scaleMode === "sky"
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

function shortestAngleDelta(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getLanguage() {
  return window.cosmosSettings?.get()?.language === "en" ? "en" : "ko";
}
