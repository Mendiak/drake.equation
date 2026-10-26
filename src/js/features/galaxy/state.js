import * as THREE from 'three';

export const QUALITY_SETTINGS = {
    high: {
        starCount: 50000,
        globularClusters: 10,
        openClusters: 14,
        pixelRatioCap: 2,
        maxPixels: 4200000
    },
    medium: {
        starCount: 32000,
        globularClusters: 7,
        openClusters: 10,
        pixelRatioCap: 1.5,
        maxPixels: 2600000
    },
    low: {
        starCount: 18000,
        globularClusters: 4,
        openClusters: 6,
        pixelRatioCap: 1.25,
        maxPixels: 1600000
    }
};

export const COLORS = {
    total: 0xC9B8A6,
    planets: 0xF39C12,
    habitable: 0x4FA8E0,
    life: 0x3DDC84,
    intelligence: 0xB07BE8,
    tech: 0xFFFFFF
};

export const BRIGHTNESS_MULTIPLIERS = {
    total: 0.85,
    planets: 1.05,
    habitable: 1.1,
    life: 1.15,
    intelligence: 1.15,
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
    armTightness: 0.74,
    diskRadius: 120,
    diskInner: 0.12,
    coreRadius: 18,
    diskThickness: 6,
    coreThickness: 25,
    armSpread: 9,
    armCurvature: 3.5,
    bulgeFraction: 0.14,
    interArmFraction: 0.15,
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
export let lastFrameTime = 0;
export let lastBlinkTime = 0;
export let communicativeBlinkState = true;
export let currentView = { ...DEFAULT_VIEW };
export let renderScale = 1;

export function setGalaxyScene(v) { galaxyScene = v; }
export function setGalaxyCamera(v) { galaxyCamera = v; }
export function setGalaxyRenderer(v) { galaxyRenderer = v; }
export function setStarSystem(v) { starSystem = v; }
export function setGalaxyControls(v) { galaxyControls = v; }
export function setGalaxyRendererFS(v) { galaxyRendererFS = v; }
export function setLastFrameTime(v) { lastFrameTime = v; }
export function setLastBlinkTime(v) { lastBlinkTime = v; }
export function setCommunicativeBlinkState(v) { communicativeBlinkState = v; }
export function setCurrentView(v) { currentView = v; }
export function setRenderScale(v) { renderScale = v; }

export let fullscreenUIVisible = true;
export let fullscreenAutoHideTimer = null;
export let fullscreenUIForced = false;

export function setFullscreenUIVisible(v) { fullscreenUIVisible = v; }
export function setFullscreenAutoHideTimer(v) { fullscreenAutoHideTimer = v; }
export function setFullscreenUIForced(v) { fullscreenUIForced = v; }
