import * as THREE from 'three';

export const QUALITY_SETTINGS = {
    high: { starCount: 50000, globularClusters: 10, openClusters: 12 },
    medium: { starCount: 30000, globularClusters: 6, openClusters: 8 },
    low: { starCount: 15000, globularClusters: 3, openClusters: 4 }
};

export const COLORS = {
    total: 0x8B4545,
    planets: 0xf39c12,
    habitable: 0x3498db,
    life: 0x2ecc71,
    intelligence: 0xb060d0,
    tech: 0xffffff
};

export const BRIGHTNESS_MULTIPLIERS = {
    total: 0.85,
    planets: 1.05,
    habitable: 1.1,
    life: 1.15,
    intelligence: 1.35,
    tech: 1.0
};

export const RGB_COLORS = {};
(function precomputeColors() {
    const tempColor = new THREE.Color();
    for (const key in COLORS) {
        tempColor.setHex(COLORS[key]);
        const multiplier = BRIGHTNESS_MULTIPLIERS[key] || 1.0;
        RGB_COLORS[key] = {
            r: Math.min(1.0, tempColor.r * multiplier),
            g: Math.min(1.0, tempColor.g * multiplier),
            b: Math.min(1.0, tempColor.b * multiplier)
        };
    }
})();

export const BLINK_INTERVAL = 1000;

export const GALAXY_PARAMS = {
    spiralArms: 4,
    armTightness: 0.45,
    diskRadius: 120,
    coreRadius: 18,
    barLength: 30,
    barWidth: 8,
    diskThickness: 6,
    thickDisk: 18,
    coreThickness: 25,
    armSpread: 8,
    armDensity: 0.78,
    rotationSpeed: 0.0006,
    randomScatter: 0.15,
    armCurvature: 3.5,
    globularClusters: 12,
    openClusters: 18,
    clusterStarsMin: 80,
    clusterStarsMax: 250
};

export const DEFAULT_VIEW = {
    rotationSpeed: 0.001,
    tilt: 45,
    zoom: 200,
    starSize: 1.2
};

export const GALAXY_VISIBILITY = {
    total: true,
    planets: true,
    habitable: true,
    life: true,
    intelligence: true,
    tech: true
};

export let galaxyScene = null;
export let galaxyCamera = null;
export let galaxyRenderer = null;
export let starSystem = null;
export let galaxyControls = null;
export let galaxyRendererFS = null;
export let communicativeGlowSystem = null;
export let _lastFcIdx = 0;
export let lastFrameTime = 0;
export let lastBlinkTime = 0;
export let communicativeBlinkState = true;
export let currentView = { ...DEFAULT_VIEW };

export function setGalaxyScene(v) { galaxyScene = v; }
export function setGalaxyCamera(v) { galaxyCamera = v; }
export function setGalaxyRenderer(v) { galaxyRenderer = v; }
export function setStarSystem(v) { starSystem = v; }
export function setGalaxyControls(v) { galaxyControls = v; }
export function setGalaxyRendererFS(v) { galaxyRendererFS = v; }
export function setCommunicativeGlowSystem(v) { communicativeGlowSystem = v; }
export function setLastFcIdx(v) { _lastFcIdx = v; }
export function setLastFrameTime(v) { lastFrameTime = v; }
export function setLastBlinkTime(v) { lastBlinkTime = v; }
export function setCommunicativeBlinkState(v) { communicativeBlinkState = v; }
export function setCurrentView(v) { currentView = v; }
