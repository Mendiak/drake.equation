import * as THREE from 'three';
import { defaultValues } from '../../core/config.js';
import {
    QUALITY_SETTINGS, GALAXY_PARAMS, COLORS, DEFAULT_VIEW,
    galaxyScene, galaxyCamera, galaxyRenderer, starSystem,
    currentView, renderScale,
    setStarSystem
} from './state.js';

const TWO_PI = Math.PI * 2;

let _starSprite = null;
let _glowSprite = null;

/**
 * Picks a quality tier from the actual GPU when the browser exposes it.
 * deviceMemory only exists in Chromium, so it is used as a fallback signal.
 */
function detectGpuTier() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) return null;

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const rendererName = debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : '';
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) loseContext.loseContext();

        const name = rendererName.toLowerCase();
        if (!name) return null;

        if (/swiftshader|software|llvmpipe|basic render/.test(name)) return 'low';
        if (/intel|uhd graphics|hd graphics|mali|adreno|powervr|videocore/.test(name)) {
            return /iris|arc/.test(name) ? 'medium' : 'low';
        }
        if (/geforce|nvidia|radeon rx|radeon pro|apple m/.test(name)) return 'high';
        return null;
    } catch {
        return null;
    }
}

function detectPerformanceTier() {
    const gpuTier = detectGpuTier();
    if (gpuTier) return gpuTier;

    const memory = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency || 4;
    const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    if (coarsePointer) return 'low';
    if ((typeof memory === 'number' && memory <= 4) || cores <= 2) return 'low';
    if (typeof memory === 'number' && memory >= 8 && cores >= 8) return 'high';
    return 'medium';
}

const CURRENT_QUALITY = QUALITY_SETTINGS[detectPerformanceTier()];
export const STAR_COUNT = CURRENT_QUALITY.starCount;
export const QUALITY = CURRENT_QUALITY;

export function updateSliderBackground(input, min, max) {
    const value = parseFloat(input.value);
    const percentage = ((value - min) / (max - min)) * 100;
    input.style.setProperty('--slider-fill', `${percentage}%`);
}

/** Bell-shaped random value with standard deviation 1. */
function gaussian() {
    return (Math.random() + Math.random() + Math.random() - 1.5) * 2;
}

export function generateGlobularClusterPosition() {
    const distance = 40 + Math.random() * 70;
    const theta = Math.random() * TWO_PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const verticalFactor = 0.7;
    return {
        x: distance * Math.sin(phi) * Math.cos(theta),
        y: distance * Math.cos(phi) * verticalFactor,
        z: distance * Math.sin(phi) * Math.sin(theta)
    };
}

export function generateOpenClusterPosition() {
    const armIndex = Math.floor(Math.random() * GALAXY_PARAMS.spiralArms);
    const baseAngle = (armIndex / GALAXY_PARAMS.spiralArms) * TWO_PI;
    const radius = 35 + Math.random() * (GALAXY_PARAMS.diskRadius - 45);
    const spiralAngle = baseAngle + Math.log(radius + 1) * GALAXY_PARAMS.armTightness * GALAXY_PARAMS.armCurvature;
    const armOffset = gaussian() * 3;
    const angleOffset = gaussian() * 0.02;
    const effectiveRadius = radius + armOffset;
    const finalAngle = spiralAngle + angleOffset;
    return {
        x: Math.cos(finalAngle) * effectiveRadius,
        y: gaussian() * 1.5,
        z: Math.sin(finalAngle) * effectiveRadius
    };
}

/**
 * Builds a cluster as flat arrays so every cluster can be merged into the
 * single star buffer (one draw call for the whole galaxy).
 */
export function generateClusterStars(centerX, centerY, centerZ, starCount, clusterType) {
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const phases = new Float32Array(starCount);

    const isGlobular = clusterType === 'globular';
    const scaleRadius = isGlobular ? 5.5 : 3.2;
    const maxRadius = isGlobular ? 14 : 8;
    const flatten = isGlobular ? 1 : 0.45;

    for (let i = 0; i < starCount; i++) {
        const u = Math.random();
        const r = Math.min(maxRadius, scaleRadius * Math.sqrt(u / (1 - u + 1e-4)));
        const theta = Math.random() * TWO_PI;
        const cosPhi = 2 * Math.random() - 1;
        const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);

        positions[i * 3] = centerX + r * sinPhi * Math.cos(theta);
        positions[i * 3 + 1] = centerY + r * cosPhi * flatten;
        positions[i * 3 + 2] = centerZ + r * sinPhi * Math.sin(theta);
        sizes[i] = 0.45 + Math.random() * 1.1;
        phases[i] = Math.random();
    }

    return { positions, sizes, phases };
}

export function generateSpiralGalaxyPosition() {
    if (Math.random() < GALAXY_PARAMS.bulgeFraction) {
        const radius = GALAXY_PARAMS.coreRadius * Math.pow(Math.random(), 1.4);
        const theta = Math.random() * TWO_PI;
        return {
            x: Math.cos(theta) * radius,
            y: gaussian() * GALAXY_PARAMS.coreThickness * 0.14,
            z: Math.sin(theta) * radius
        };
    }

    const radiusNorm = GALAXY_PARAMS.diskInner +
        (1 - GALAXY_PARAMS.diskInner) * Math.pow(Math.random(), 1.55);
    const radius = radiusNorm * GALAXY_PARAMS.diskRadius;

    const armIndex = Math.floor(Math.random() * GALAXY_PARAMS.spiralArms);
    const baseAngle = (armIndex / GALAXY_PARAMS.spiralArms) * TWO_PI;
    const spiralAngle = baseAngle +
        Math.log(radius + 1) * GALAXY_PARAMS.armTightness * GALAXY_PARAMS.armCurvature;

    const inArm = Math.random() > GALAXY_PARAMS.interArmFraction;
    const armWidth = GALAXY_PARAMS.armSpread * (0.3 + 0.7 * radiusNorm);
    const armOffset = gaussian() * armWidth * (inArm ? 1 : 1.8);

    const waviness = 0.06 * Math.sin(radius * 0.045 + armIndex * 0.7) +
        0.03 * Math.cos(radius * 0.08 - armIndex * 0.4);
    const angularScatter = gaussian() * 0.03 * (0.4 + radiusNorm);

    const effectiveRadius = Math.max(1.5, radius + armOffset);
    const finalAngle = (inArm ? spiralAngle : Math.random() * TWO_PI) + waviness + angularScatter;

    const thickness = GALAXY_PARAMS.diskThickness * (0.5 + 0.5 * (1 - radiusNorm));

    return {
        x: Math.cos(finalAngle) * effectiveRadius,
        y: gaussian() * thickness * 0.5,
        z: Math.sin(finalAngle) * effectiveRadius
    };
}

function createStarTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const half = size / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.85)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.28)');
    gradient.addColorStop(0.75, 'rgba(255, 255, 255, 0.06)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createGlowTexture() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const half = size / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.55)');
    gradient.addColorStop(0.45, 'rgba(255, 255, 255, 0.22)');
    gradient.addColorStop(0.75, 'rgba(255, 255, 255, 0.05)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export function getStarSprite() {
    if (!_starSprite) _starSprite = createStarTexture();
    return _starSprite;
}

export function getGlowSprite() {
    if (!_glowSprite) _glowSprite = createGlowTexture();
    return _glowSprite;
}

function createStarMaterial(sprite) {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: sprite },
            uTime: { value: 0 },
            uSizeScale: { value: DEFAULT_VIEW.starSize },
            uViewportHeight: { value: 900 },
            uBlink: { value: 1 },
            uOpacity: { value: 0.9 }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uSizeScale;
            uniform float uViewportHeight;
            uniform float uBlink;

            attribute vec3 aColor;
            attribute float aSize;
            attribute float aPhase;
            attribute float aTech;

            varying vec3 vColor;
            varying float vTech;

            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;

                float twinkle = 0.9 + 0.1 * sin(uTime * 1.9 + aPhase * 6.2831853);
                float blink = mix(1.0, uBlink, aTech);
                float pointSize = aSize * uSizeScale * mix(1.0, 2.0, aTech);

                gl_PointSize = clamp(
                    pointSize * uViewportHeight * 0.5 / max(-mvPosition.z, 1.0),
                    1.0,
                    32.0
                );

                vColor = aColor * twinkle * blink;
                vTech = aTech;
            }
        `,
        fragmentShader: `
            uniform sampler2D uTexture;
            uniform float uOpacity;

            varying vec3 vColor;
            varying float vTech;

            void main() {
                vec4 sprite = texture2D(uTexture, gl_PointCoord);
                if (sprite.a < 0.02) discard;

                vec3 color = vColor * mix(1.0, 1.35, vTech);
                gl_FragColor = vec4(color, sprite.a * uOpacity);

                #include <colorspace_fragment>
            }
        `,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending
    });
}

function createCoreGlow() {
    if (!galaxyScene) return;
    const glowSprite = getGlowSprite();

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowSprite,
        color: 0xffdcae,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
    }));
    halo.scale.set(150, 150, 1);
    halo.renderOrder = -1;
    galaxyScene.add(halo);

    const nucleus = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowSprite,
        color: 0xfff3e0,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
    }));
    nucleus.scale.set(38, 38, 1);
    nucleus.renderOrder = -1;
    galaxyScene.add(nucleus);
}

function buildClusterBuffers() {
    const positions = [];
    const sizes = [];
    const phases = [];

    const globularCount = CURRENT_QUALITY.globularClusters;
    for (let i = 0; i < globularCount; i++) {
        const center = generateGlobularClusterPosition();
        const count = Math.floor(
            GALAXY_PARAMS.clusterStarsMin +
            Math.random() * (GALAXY_PARAMS.clusterStarsMax - GALAXY_PARAMS.clusterStarsMin)
        );
        const cluster = generateClusterStars(center.x, center.y, center.z, count, 'globular');
        positions.push(...cluster.positions);
        sizes.push(...cluster.sizes);
        phases.push(...cluster.phases);
    }

    const openCount = CURRENT_QUALITY.openClusters;
    for (let i = 0; i < openCount; i++) {
        const center = generateOpenClusterPosition();
        const count = Math.floor(
            GALAXY_PARAMS.clusterStarsMin * 0.4 +
            Math.random() * (GALAXY_PARAMS.clusterStarsMax * 0.6 - GALAXY_PARAMS.clusterStarsMin * 0.4)
        );
        const cluster = generateClusterStars(center.x, center.y, center.z, count, 'open');
        positions.push(...cluster.positions);
        sizes.push(...cluster.sizes);
        phases.push(...cluster.phases);
    }

    return {
        positions: new Float32Array(positions),
        sizes: new Float32Array(sizes),
        phases: new Float32Array(phases)
    };
}

function buildStarGeometry() {
    const clusters = buildClusterBuffers();
    const clusterCount = clusters.sizes.length;
    const total = STAR_COUNT + clusterCount;

    const positions = new Float32Array(total * 3);
    const colors = new Float32Array(total * 3);
    const sizes = new Float32Array(total);
    const phases = new Float32Array(total);
    const tech = new Float32Array(total);

    const fpThreshold = total * Math.min(1, defaultValues.fp);
    const neThreshold = Math.min(fpThreshold, total * defaultValues.fp * defaultValues.ne);
    const flThreshold = neThreshold * Math.min(1, defaultValues.fl);
    const fiThreshold = flThreshold * Math.min(1, defaultValues.fi);
    const fcThreshold = fiThreshold * Math.min(1, defaultValues.fc);

    for (let i = 0; i < STAR_COUNT; i++) {
        const star = generateSpiralGalaxyPosition();
        const i3 = i * 3;
        positions[i3] = star.x;
        positions[i3 + 1] = star.y;
        positions[i3 + 2] = star.z;

        let colorHex;
        if (i < fcThreshold) colorHex = COLORS.tech;
        else if (i < fiThreshold) colorHex = COLORS.intelligence;
        else if (i < flThreshold) colorHex = COLORS.life;
        else if (i < neThreshold) colorHex = COLORS.habitable;
        else if (i < fpThreshold) colorHex = COLORS.planets;
        else colorHex = COLORS.total;

        const color = new THREE.Color(colorHex);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        // Most stars are tiny; a few are noticeably brighter.
        sizes[i] = 0.55 + Math.pow(Math.random(), 2.2) * 1.9;
        phases[i] = Math.random();
    }

    positions.set(clusters.positions, STAR_COUNT * 3);
    sizes.set(clusters.sizes, STAR_COUNT);
    phases.set(clusters.phases, STAR_COUNT);

    for (let i = STAR_COUNT; i < total; i++) {
        const i3 = i * 3;
        const color = new THREE.Color(COLORS.total);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aTech', new THREE.BufferAttribute(tech, 1));
    geometry.computeBoundingSphere();

    return geometry;
}

export function createStarField() {
    if (!galaxyScene) return null;

    const geometry = buildStarGeometry();
    const material = createStarMaterial(getStarSprite());
    const system = new THREE.Points(geometry, material);

    // The disk is animated and may shear at the edges; never cull it.
    system.frustumCulled = false;
    system.renderOrder = 0;

    galaxyScene.add(system);
    setStarSystem(system);

    createCoreGlow();

    return system;
}

function getActiveContainer() {
    const normalContainer = document.getElementById('galaxy-simulation-container');
    const fullscreenContainer = document.getElementById('galaxy-simulation-container-fullscreen');
    const overlay = document.getElementById('galaxy-fullscreen-overlay');
    const isFullscreen = overlay && overlay.classList.contains('active');
    return isFullscreen && fullscreenContainer ? fullscreenContainer : normalContainer;
}

function resizeRenderer(container) {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);

    const dprCap = CURRENT_QUALITY.pixelRatioCap;
    const maxPixels = CURRENT_QUALITY.maxPixels;
    const areaCap = Math.sqrt(maxPixels / (width * height));
    const pixelRatio = Math.max(
        0.7,
        Math.min(window.devicePixelRatio || 1, dprCap, areaCap) * renderScale
    );

    galaxyRenderer.setPixelRatio(pixelRatio);
    galaxyRenderer.setSize(width, height, true);
}

function updateViewportUniform() {
    if (!starSystem || !galaxyRenderer) return;
    const uniforms = starSystem.material.uniforms;
    if (!uniforms || !uniforms.uViewportHeight) return;
    uniforms.uViewportHeight.value = galaxyRenderer.domElement.height || 900;
}

/**
 * Frames the whole disk no matter the viewport shape. The zoom slider is
 * applied as a multiplier over this fitted distance (200 = fitted view).
 */
export function applyCameraView() {
    if (!galaxyCamera) return;

    const tiltRad = (currentView.tilt * Math.PI) / 180;

    // The disk is foreshortened as the camera tilts, so frame the projected
    // extents rather than the full diameter.
    const fitRadius = GALAXY_PARAMS.diskRadius * 1.22 + 10;
    const verticalExtent = Math.abs(Math.sin(tiltRad)) * fitRadius + 16;

    const verticalHalf = Math.tan((galaxyCamera.fov * Math.PI / 180) / 2);
    const horizontalHalf = verticalHalf * Math.max(galaxyCamera.aspect, 0.2);
    const fitDistance = Math.max(
        fitRadius / Math.max(horizontalHalf, 0.05),
        verticalExtent / Math.max(verticalHalf, 0.05)
    );

    const zoomFactor = Math.min(2.5, Math.max(0.35, DEFAULT_VIEW.zoom / currentView.zoom));
    const distance = fitDistance * zoomFactor;

    const cosTilt = Math.cos(tiltRad);
    // Avoid a degenerate lookAt when the camera is exactly above the pole.
    const z = Math.abs(cosTilt) < 0.02 ? distance * 0.02 : cosTilt * distance;

    galaxyCamera.position.set(0, Math.sin(tiltRad) * distance, z);
    galaxyCamera.up.set(0, 1, 0);
    galaxyCamera.lookAt(0, 0, 0);
}

export function onGalaxyResize() {
    if (!galaxyCamera || !galaxyRenderer) return;
    const container = getActiveContainer();
    if (!container || container.clientHeight === 0 || container.clientWidth === 0) return;

    resizeRenderer(container);
    galaxyCamera.aspect = container.clientWidth / container.clientHeight;
    galaxyCamera.updateProjectionMatrix();
    updateViewportUniform();
    applyCameraView();
}
