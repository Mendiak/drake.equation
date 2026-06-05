import * as THREE from 'three';
import { t, currentLang } from './i18n.js';
import { defaultValues } from './config.js';

let galaxyScene, galaxyCamera, galaxyRenderer, starSystem, galaxyControls;
let galaxyRendererFS;

const QUALITY_SETTINGS = {
    high: { starCount: 50000, globularClusters: 10, openClusters: 12 },
    medium: { starCount: 30000, globularClusters: 6, openClusters: 8 },
    low: { starCount: 15000, globularClusters: 3, openClusters: 4 }
};

function detectPerformanceTier() {
    const hasHighEndDevice = navigator.deviceMemory && navigator.deviceMemory >= 8;
    const hasManyCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 8;

    if (hasHighEndDevice && hasManyCores) return 'high';
    if (navigator.deviceMemory && navigator.deviceMemory <= 4) return 'low';
    return 'medium';
}

const CURRENT_QUALITY = QUALITY_SETTINGS[detectPerformanceTier()];
const STAR_COUNT = CURRENT_QUALITY.starCount;

const DEFAULT_VIEW = {
    rotationSpeed: 0.001,
    tilt: 45,
    zoom: 200,
    starSize: 1.2
};

let currentView = { ...DEFAULT_VIEW };

const COLORS = {
    total: 0x8B4545,
    planets: 0xf39c12,
    habitable: 0x3498db,
    life: 0x2ecc71,
    intelligence: 0xb060d0,
    tech: 0xffffff
};

const BRIGHTNESS_MULTIPLIERS = {
    total: 0.85,
    planets: 1.05,
    habitable: 1.1,
    life: 1.15,
    intelligence: 1.35,
    tech: 1.0
};

const RGB_COLORS = {};
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

const GALAXY_VISIBILITY = {
    total: true,
    planets: true,
    habitable: true,
    life: true,
    intelligence: true,
    tech: true
};

let communicativeBlinkState = true;
let lastBlinkTime = 0;
const BLINK_INTERVAL = 1000;

const GALAXY_PARAMS = {
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

function initGalaxySimulation() {
    const container = document.getElementById('galaxy-simulation-container');
    if (!container || container.clientHeight === 0 || container.clientWidth === 0) {
        setTimeout(initGalaxySimulation, 100);
        return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    galaxyScene = new THREE.Scene();
    galaxyCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1500);
    galaxyCamera.position.z = 200;
    galaxyCamera.position.y = 80;
    galaxyCamera.position.x = 0;
    galaxyCamera.lookAt(0, 0, 0);

    try {
        galaxyRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        galaxyRenderer.setSize(width, height);
        galaxyRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(galaxyRenderer.domElement);
    } catch (error) {
        console.warn('WebGL not supported:', error);
        container.innerHTML = '<div class="webgl-error" style="display:flex;align-items:center;justify-content:center;height:100%;text-align:center;padding:20px;color:#fff;">' +
            '<div><strong>WebGL not available</strong><br>' +
            'The galaxy simulation requires WebGL. Please ensure your browser supports WebGL and hardware acceleration is enabled.</div></div>';
        return;
    }

    createStarField();
    animateGalaxyWithRotation();

    const params = getCurrentDrakeParams();
    updateGalaxySimulation(params);

    const fullscreenBtn = document.querySelector('.fullscreen-btn-overlay');
    if (fullscreenBtn) {
        fullscreenBtn.disabled = false;
        fullscreenBtn.style.opacity = '0.7';
        fullscreenBtn.style.cursor = 'pointer';
    }

    initGalaxySliders();

    updateLegendUI();

    window.addEventListener('resize', onGalaxyResize);
}

function initGalaxySliders() {
}

function updateSliderBackground(input, min, max) {
    const value = parseFloat(input.value);
    const percentage = ((value - min) / (max - min)) * 100;
    input.style.setProperty('--slider-fill', `${percentage}%`);
}

function generateGlobularClusterPosition() {
    const distance = 20 + Math.random() * 50;
    const theta = Math.random() * Math.PI * 2;

    const phi = Math.acos(2 * Math.random() - 1);
    const verticalFactor = 0.4;

    const x = distance * Math.sin(phi) * Math.cos(theta);
    const y = distance * Math.cos(phi) * verticalFactor;
    const z = distance * Math.sin(phi) * Math.sin(theta);

    return { x, y, z };
}

function generateOpenClusterPosition() {
    const armIndex = Math.floor(Math.random() * GALAXY_PARAMS.spiralArms);
    const baseAngle = (armIndex / GALAXY_PARAMS.spiralArms) * Math.PI * 2;

    const radius = 35 + Math.random() * (GALAXY_PARAMS.diskRadius - 45);

    const spiralAngle = baseAngle + Math.log(radius + 1) * GALAXY_PARAMS.armTightness * GALAXY_PARAMS.armCurvature;

    const armOffset = (Math.random() - 0.5) * 6;
    const angleOffset = (Math.random() - 0.5) * 0.15;

    const effectiveRadius = radius + armOffset;
    const finalAngle = spiralAngle + angleOffset;

    const x = Math.cos(finalAngle) * effectiveRadius;
    const y = (Math.random() - 0.5) * 4;
    const z = Math.sin(finalAngle) * effectiveRadius;

    return { x, y, z };
}

function generateClusterStars(centerX, centerY, centerZ, starCount, clusterType) {
    const positions = [];
    const colors = [];
    const sizes = [];

    const fpThreshold = starCount * defaultValues.fp;
    const neThreshold = fpThreshold * (defaultValues.ne / 10);
    const flThreshold = neThreshold * defaultValues.fl;
    const fiThreshold = flThreshold * defaultValues.fi;
    const fcThreshold = fiThreshold * defaultValues.fc;

    for (let i = 0; i < starCount; i++) {
        const u = Math.random();
        const rScale = clusterType === 'globular' ? 8 : 5;
        const r = rScale * Math.pow(u, 1/3) / Math.pow(1 - u, 1/3);
        const clampedR = Math.min(r, clusterType === 'globular' ? 20 : 12);

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        const x = centerX + clampedR * Math.sin(phi) * Math.cos(theta);
        const y = centerY + clampedR * Math.cos(phi);
        const z = centerZ + clampedR * Math.sin(phi) * Math.sin(theta);

        positions.push(x, y, z);

        let colorHex;
        if (i < fcThreshold) {
            colorHex = COLORS.tech;
        } else if (i < fiThreshold) {
            colorHex = COLORS.intelligence;
        } else if (i < flThreshold) {
            colorHex = COLORS.life;
        } else if (i < neThreshold) {
            colorHex = COLORS.habitable;
        } else if (i < fpThreshold) {
            colorHex = COLORS.planets;
        } else {
            colorHex = COLORS.total;
        }

        const color = new THREE.Color(colorHex);
        colors.push(color.r, color.g, color.b);

        sizes.push(0.8 + Math.random() * 1.8);
    }

    return { positions, colors, sizes };
}

let communicativeGlowSystem = null;

function createStarField() {
    const mainGeometry = new THREE.BufferGeometry();
    const glowGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);

    const glowPositions = [];
    const glowIndices = [];

    const fpThreshold = STAR_COUNT * defaultValues.fp;
    const neThreshold = fpThreshold * (defaultValues.ne / 10);
    const flThreshold = neThreshold * defaultValues.fl;
    const fiThreshold = flThreshold * defaultValues.fi;
    const fcThreshold = fiThreshold * defaultValues.fc;

    for (let i = 0; i < STAR_COUNT; i++) {
        const starData = generateSpiralGalaxyPosition();

        positions[i * 3] = starData.x;
        positions[i * 3 + 1] = starData.y;
        positions[i * 3 + 2] = starData.z;

        let colorHex;
        if (i < fcThreshold) {
            colorHex = COLORS.tech;
            glowPositions.push(starData.x, starData.y, starData.z);
            glowIndices.push(i);
        } else if (i < fiThreshold) {
            colorHex = COLORS.intelligence;
        } else if (i < flThreshold) {
            colorHex = COLORS.life;
        } else if (i < neThreshold) {
            colorHex = COLORS.habitable;
        } else if (i < fpThreshold) {
            colorHex = COLORS.planets;
        } else {
            colorHex = COLORS.total;
        }

        const color = new THREE.Color(colorHex);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = Math.random() * 1.5 + 0.5;
    }

    mainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    mainGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    mainGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const sprite = createStarTexture();
    const glowSprite = createGlowTexture();

    const mainMaterial = new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
        map: sprite,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    starSystem = new THREE.Points(mainGeometry, mainMaterial);
    galaxyScene.add(starSystem);

    if (glowPositions.length > 0) {
        const glowGeometry = new THREE.BufferGeometry();
        glowGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(glowPositions), 3));

        const glowMaterial = new THREE.PointsMaterial({
            size: 3.5,
            vertexColors: false,
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            map: glowSprite,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        communicativeGlowSystem = new THREE.Points(glowGeometry, glowMaterial);
        starSystem.add(communicativeGlowSystem);
    }

    createStarClusters(sprite);
}

function createStarClusters(sprite) {
    for (let i = 0; i < GALAXY_PARAMS.globularClusters; i++) {
        const clusterPos = generateGlobularClusterPosition();
        const starCount = Math.floor(
            GALAXY_PARAMS.clusterStarsMin +
            Math.random() * (GALAXY_PARAMS.clusterStarsMax - GALAXY_PARAMS.clusterStarsMin)
        );

        const clusterData = generateClusterStars(
            clusterPos.x, clusterPos.y, clusterPos.z,
            starCount, 'globular'
        );

        const clusterGeometry = new THREE.BufferGeometry();
        const clusterPositions = new Float32Array(clusterData.positions);
        const clusterColors = new Float32Array(clusterData.colors.length);
        const clusterSizes = new Float32Array(clusterData.sizes);

        for (let j = 0; j < clusterData.colors.length / 3; j++) {
            const hslColor = new THREE.Color();
            hslColor.setHSL(
                clusterData.colors[j * 3],
                clusterData.colors[j * 3 + 1],
                clusterData.colors[j * 3 + 2]
            );
            clusterColors[j * 3] = hslColor.r;
            clusterColors[j * 3 + 1] = hslColor.g;
            clusterColors[j * 3 + 2] = hslColor.b;
        }

        clusterGeometry.setAttribute('position', new THREE.BufferAttribute(clusterPositions, 3));
        clusterGeometry.setAttribute('color', new THREE.BufferAttribute(clusterColors, 3));
        clusterGeometry.setAttribute('size', new THREE.BufferAttribute(clusterSizes, 1));

        const clusterMaterial = new THREE.PointsMaterial({
            size: 1.0,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: true,
            map: sprite,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const cluster = new THREE.Points(clusterGeometry, clusterMaterial);
        starSystem.add(cluster);
    }

    for (let i = 0; i < GALAXY_PARAMS.openClusters; i++) {
        const clusterPos = generateOpenClusterPosition();
        const starCount = Math.floor(
            GALAXY_PARAMS.clusterStarsMin * 0.4 +
            Math.random() * (GALAXY_PARAMS.clusterStarsMax * 0.6 - GALAXY_PARAMS.clusterStarsMin * 0.4)
        );

        const clusterData = generateClusterStars(
            clusterPos.x, clusterPos.y, clusterPos.z,
            starCount, 'open'
        );

        const clusterGeometry = new THREE.BufferGeometry();
        const clusterPositions = new Float32Array(clusterData.positions);
        const clusterColors = new Float32Array(clusterData.colors.length);
        const clusterSizes = new Float32Array(clusterData.sizes);

        for (let j = 0; j < clusterData.colors.length / 3; j++) {
            const hslColor = new THREE.Color();
            hslColor.setHSL(
                clusterData.colors[j * 3],
                clusterData.colors[j * 3 + 1],
                clusterData.colors[j * 3 + 2]
            );
            clusterColors[j * 3] = hslColor.r;
            clusterColors[j * 3 + 1] = hslColor.g;
            clusterColors[j * 3 + 2] = hslColor.b;
        }

        clusterGeometry.setAttribute('position', new THREE.BufferAttribute(clusterPositions, 3));
        clusterGeometry.setAttribute('color', new THREE.BufferAttribute(clusterColors, 3));
        clusterGeometry.setAttribute('size', new THREE.BufferAttribute(clusterSizes, 1));

        const clusterMaterial = new THREE.PointsMaterial({
            size: 1.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            sizeAttenuation: true,
            map: sprite,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const cluster = new THREE.Points(clusterGeometry, clusterMaterial);
        starSystem.add(cluster);
    }
}

function getStellarPopulationColor(population) {
    const color = new THREE.Color();

    switch(population) {
        case 'core':
            color.setHSL(0.1 + Math.random() * 0.05, 0.6, 0.7 + Math.random() * 0.2);
            break;
        case 'bar':
            color.setHSL(0.12 + Math.random() * 0.08, 0.4, 0.75 + Math.random() * 0.15);
            break;
        case 'thickDisk':
            color.setHSL(0.13 + Math.random() * 0.07, 0.5, 0.7 + Math.random() * 0.15);
            break;
        case 'spiralArm':
            color.setHSL(0.55 + Math.random() * 0.15, 0.7, 0.8 + Math.random() * 0.2);
            break;
        default:
            color.setHSL(0.1 + Math.random() * 0.15, 0.3, 0.75 + Math.random() * 0.2);
    }

    return color;
}

function generateSpiralGalaxyPosition() {
    const armIndex = Math.floor(Math.random() * GALAXY_PARAMS.spiralArms);
    const baseAngle = (armIndex / GALAXY_PARAMS.spiralArms) * Math.PI * 2;

    const radiusRandom = Math.random();
    let radiusNorm;

    const distributionType = Math.random();
    if (distributionType < 0.50) {
        radiusNorm = Math.pow(radiusRandom, 0.55);
    } else if (distributionType < 0.75) {
        radiusNorm = Math.pow(radiusRandom, 0.7) * 0.5;
    } else if (distributionType < 0.90) {
        radiusNorm = Math.pow(radiusRandom, 0.5) * 0.7 + 0.1;
    } else {
        radiusNorm = Math.pow(radiusRandom, 0.4) * 0.6 + 0.35;
    }

    const radius = radiusNorm * GALAXY_PARAMS.diskRadius;

    const spiralAngle = baseAngle + Math.log(radius + 1) * GALAXY_PARAMS.armTightness * GALAXY_PARAMS.armCurvature;

    const armWidthVariation = 1 +
        0.2 * Math.sin(armIndex * 2.1 + radius * 0.05) +
        0.15 * Math.cos(armIndex * 1.7 + radius * 0.08) +
        0.12 * Math.sin(radius * 0.12 - armIndex);

    const outerFlare = 1 + (radius / GALAXY_PARAMS.diskRadius) * 0.4;
    const armOffset = (Math.random() - 0.5) * GALAXY_PARAMS.armSpread * Math.sqrt(radius) * outerFlare * armWidthVariation;

    const thicknessProfile = Math.exp(-radius / (GALAXY_PARAMS.diskRadius * 0.4));
    const thickness = GALAXY_PARAMS.thickDisk * thicknessProfile + GALAXY_PARAMS.diskThickness * (1 - thicknessProfile);

    const centerScatter = Math.max(0, 8 - radius * 0.5);
    const baseScatter = 3 + centerScatter + (radius / GALAXY_PARAMS.diskRadius) * 4;
    const scatterVariation = 1 +
        0.3 * Math.sin(radius * 0.08 + armIndex * 1.5) +
        0.2 * Math.cos(radius * 0.15 - armIndex * 0.8);
    const scatter = (Math.random() - 0.5) * baseScatter * scatterVariation;

    const baseAngularScatter = 0.15 * (radius / GALAXY_PARAMS.diskRadius);
    const angularVariation = 1 + 0.2 * Math.sin(radius * 0.06 + armIndex);
    const angularScatter = (Math.random() - 0.5) * baseAngularScatter * angularVariation;

    const armWaviness = 0.05 * Math.sin(radius * 0.04 + armIndex * 0.5) +
                        0.03 * Math.cos(radius * 0.07 - armIndex * 0.3);

    const interArmOffset = Math.random() < 0.25 ? (Math.random() - 0.5) * 18 : 0;

    let barX = 0, barZ = 0;
    if (radius < GALAXY_PARAMS.barLength * 0.4) {
        const barInfluence = 1 - (radius / (GALAXY_PARAMS.barLength * 0.4));
        const barAngle = 0.3;
        barX = (Math.random() - 0.5) * GALAXY_PARAMS.barWidth * 0.6 * barInfluence;
        barZ = (Math.random() - 0.5) * GALAXY_PARAMS.barWidth * 0.3 * barInfluence;

        const tempX = barX * Math.cos(barAngle) - barZ * Math.sin(barAngle);
        barZ = barX * Math.sin(barAngle) + barZ * Math.cos(barAngle);
        barX = tempX;
    }

    const effectiveRadius = radius + armOffset + scatter + interArmOffset;
    const finalAngle = spiralAngle + angularScatter + armWaviness;

    const x = Math.cos(finalAngle) * effectiveRadius + barX;
    const y = (Math.random() - 0.5) * thickness;
    const z = Math.sin(finalAngle) * effectiveRadius + barZ;

    let population = 'spiralArm';
    if (radius < GALAXY_PARAMS.coreRadius * 0.4) {
        population = 'core';
    } else if (radius < GALAXY_PARAMS.diskRadius * 0.3) {
        population = Math.random() < 0.3 ? 'thickDisk' : 'spiralArm';
    }

    return { x, y, z, population };
}

function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
}

function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
}

let _lastFcIdx = 0;

function rebuildGlowSystem(params) {
    if (!starSystem) return;

    if (communicativeGlowSystem) {
        starSystem.remove(communicativeGlowSystem);
        communicativeGlowSystem.geometry.dispose();
        communicativeGlowSystem = null;
    }

    if (!GALAXY_VISIBILITY.tech) return;

    const positions = starSystem.geometry.attributes.position.array;
    const fpFrac = params.fp;
    const neFrac = fpFrac * (params.ne / 10);
    const flFrac = neFrac * params.fl;
    const fiFrac = flFrac * params.fi;
    const fcFrac = fiFrac * params.fc;
    const fc = Math.min(STAR_COUNT, Math.max(0, Math.round(STAR_COUNT * fcFrac)));

    if (fc === 0) return;

    const glowPositions = [];
    for (let i = 0; i < fc; i++) {
        glowPositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
    }

    const glowGeometry = new THREE.BufferGeometry();
    glowGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(glowPositions), 3));

    const glowSprite = createGlowTexture();
    const glowMaterial = new THREE.PointsMaterial({
        size: 3.5,
        vertexColors: false,
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        map: glowSprite,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    communicativeGlowSystem = new THREE.Points(glowGeometry, glowMaterial);
    starSystem.add(communicativeGlowSystem);
}

function updateGalaxySimulation(params) {
    if (!starSystem) return;

    const colors = starSystem.geometry.attributes.color.array;

    const fpFrac = params.fp;
    const neFrac = fpFrac * (params.ne / 10);
    const flFrac = neFrac * params.fl;
    const fiFrac = flFrac * params.fi;
    const fcFrac = fiFrac * params.fc;

    const fc  = Math.min(STAR_COUNT, Math.max(0, Math.round(STAR_COUNT * fcFrac)));
    const fi  = Math.min(STAR_COUNT, Math.max(0, Math.round(STAR_COUNT * fiFrac)));
    const fl  = Math.min(STAR_COUNT, Math.max(0, Math.round(STAR_COUNT * flFrac)));
    const ne  = Math.min(STAR_COUNT, Math.max(0, Math.round(STAR_COUNT * neFrac)));
    const fp  = Math.min(STAR_COUNT, Math.max(0, Math.round(STAR_COUNT * fpFrac)));

    _lastFcIdx = fc;

    const blinkMult = communicativeBlinkState ? 1.0 : 0.3;
    const cT   = RGB_COLORS.tech;
    const techR = cT.r * blinkMult, techG = cT.g * blinkMult, techB = cT.b * blinkMult;
    const cI   = RGB_COLORS.intelligence;
    const cL   = RGB_COLORS.life;
    const cH   = RGB_COLORS.habitable;
    const cP   = RGB_COLORS.planets;
    const cTot = RGB_COLORS.total;

    if (GALAXY_VISIBILITY.tech) {
        for (let i = 0; i < fc; i++) { const i3=i*3; colors[i3]=techR; colors[i3+1]=techG; colors[i3+2]=techB; }
    } else {
        for (let i = 0; i < fc; i++) { const i3=i*3; colors[i3]=0; colors[i3+1]=0; colors[i3+2]=0; }
    }

    if (GALAXY_VISIBILITY.intelligence) {
        for (let i = fc; i < fi; i++) { const i3=i*3; colors[i3]=cI.r; colors[i3+1]=cI.g; colors[i3+2]=cI.b; }
    } else {
        for (let i = fc; i < fi; i++) { const i3=i*3; colors[i3]=0; colors[i3+1]=0; colors[i3+2]=0; }
    }

    if (GALAXY_VISIBILITY.life) {
        for (let i = fi; i < fl; i++) { const i3=i*3; colors[i3]=cL.r; colors[i3+1]=cL.g; colors[i3+2]=cL.b; }
    } else {
        for (let i = fi; i < fl; i++) { const i3=i*3; colors[i3]=0; colors[i3+1]=0; colors[i3+2]=0; }
    }

    if (GALAXY_VISIBILITY.habitable) {
        for (let i = fl; i < ne; i++) { const i3=i*3; colors[i3]=cH.r; colors[i3+1]=cH.g; colors[i3+2]=cH.b; }
    } else {
        for (let i = fl; i < ne; i++) { const i3=i*3; colors[i3]=0; colors[i3+1]=0; colors[i3+2]=0; }
    }

    if (GALAXY_VISIBILITY.planets) {
        for (let i = ne; i < fp; i++) { const i3=i*3; colors[i3]=cP.r; colors[i3+1]=cP.g; colors[i3+2]=cP.b; }
    } else {
        for (let i = ne; i < fp; i++) { const i3=i*3; colors[i3]=0; colors[i3+1]=0; colors[i3+2]=0; }
    }

    if (GALAXY_VISIBILITY.total) {
        for (let i = fp; i < STAR_COUNT; i++) { const i3=i*3; colors[i3]=cTot.r; colors[i3+1]=cTot.g; colors[i3+2]=cTot.b; }
    } else {
        for (let i = fp; i < STAR_COUNT; i++) { const i3=i*3; colors[i3]=0; colors[i3+1]=0; colors[i3+2]=0; }
    }

    starSystem.geometry.attributes.color.needsUpdate = true;
    rebuildGlowSystem(params);
    updateClusterVisibility(params);
}

function blinkTechStars() {
    if (!starSystem || !GALAXY_VISIBILITY.tech || _lastFcIdx === 0) return;
    const colors = starSystem.geometry.attributes.color.array;
    const cT = RGB_COLORS.tech;
    const blinkMult = communicativeBlinkState ? 1.0 : 0.3;
    const r = cT.r * blinkMult, g = cT.g * blinkMult, b = cT.b * blinkMult;
    for (let i = 0; i < _lastFcIdx; i++) { const i3 = i*3; colors[i3]=r; colors[i3+1]=g; colors[i3+2]=b; }
    starSystem.geometry.attributes.color.needsUpdate = true;

    if (communicativeGlowSystem) {
        const glowOpacity = communicativeBlinkState ? 0.6 : 0.15;
        communicativeGlowSystem.material.opacity = glowOpacity;
    }
}

function updateClusterVisibility(params) {
    if (!starSystem || !starSystem.children || starSystem.children.length === 0) return;

    const blinkMult = communicativeBlinkState ? 1.0 : 0.3;
    const cT   = RGB_COLORS.tech;
    const techR = cT.r * blinkMult, techG = cT.g * blinkMult, techB = cT.b * blinkMult;
    const cI   = RGB_COLORS.intelligence;
    const cL   = RGB_COLORS.life;
    const cH   = RGB_COLORS.habitable;
    const cP   = RGB_COLORS.planets;
    const cTot = RGB_COLORS.total;

    const vTech  = GALAXY_VISIBILITY.tech;
    const vIntel = GALAXY_VISIBILITY.intelligence;
    const vLife  = GALAXY_VISIBILITY.life;
    const vHabit = GALAXY_VISIBILITY.habitable;
    const vPlanets = GALAXY_VISIBILITY.planets;
    const vTotal = GALAXY_VISIBILITY.total;
    const anyVisible = vTech || vIntel || vLife || vHabit || vPlanets || vTotal;

    const fpFrac = params.fp;
    const neFrac = fpFrac * (params.ne / 10);
    const flFrac = neFrac * params.fl;
    const fiFrac = flFrac * params.fi;
    const fcFrac = fiFrac * params.fc;

    starSystem.children.forEach(child => {
        if (!child.isPoints) return;
        if (!child.geometry || !child.geometry.attributes || !child.geometry.attributes.color) return;

        const colors = child.geometry.attributes.color.array;
        const N = colors.length / 3;

        const fc = Math.min(N, Math.max(0, Math.round(N * fcFrac)));
        const fi = Math.min(N, Math.max(0, Math.round(N * fiFrac)));
        const fl = Math.min(N, Math.max(0, Math.round(N * flFrac)));
        const ne = Math.min(N, Math.max(0, Math.round(N * neFrac)));
        const fp = Math.min(N, Math.max(0, Math.round(N * fpFrac)));

        if (vTech)   { for (let i=0;  i<fc; i++) { const i3=i*3; colors[i3]=techR; colors[i3+1]=techG; colors[i3+2]=techB; } }
        else         { for (let i=0;  i<fc; i++) { const i3=i*3; colors[i3]=0;     colors[i3+1]=0;     colors[i3+2]=0;     } }

        if (vIntel)  { for (let i=fc; i<fi; i++) { const i3=i*3; colors[i3]=cI.r;  colors[i3+1]=cI.g;  colors[i3+2]=cI.b;  } }
        else         { for (let i=fc; i<fi; i++) { const i3=i*3; colors[i3]=0;     colors[i3+1]=0;     colors[i3+2]=0;     } }

        if (vLife)   { for (let i=fi; i<fl; i++) { const i3=i*3; colors[i3]=cL.r;  colors[i3+1]=cL.g;  colors[i3+2]=cL.b;  } }
        else         { for (let i=fi; i<fl; i++) { const i3=i*3; colors[i3]=0;     colors[i3+1]=0;     colors[i3+2]=0;     } }

        if (vHabit)  { for (let i=fl; i<ne; i++) { const i3=i*3; colors[i3]=cH.r;  colors[i3+1]=cH.g;  colors[i3+2]=cH.b;  } }
        else         { for (let i=fl; i<ne; i++) { const i3=i*3; colors[i3]=0;     colors[i3+1]=0;     colors[i3+2]=0;     } }

        if (vPlanets){ for (let i=ne; i<fp; i++) { const i3=i*3; colors[i3]=cP.r;  colors[i3+1]=cP.g;  colors[i3+2]=cP.b;  } }
        else         { for (let i=ne; i<fp; i++) { const i3=i*3; colors[i3]=0;     colors[i3+1]=0;     colors[i3+2]=0;     } }

        if (vTotal)  { for (let i=fp; i<N;  i++) { const i3=i*3; colors[i3]=cTot.r;colors[i3+1]=cTot.g;colors[i3+2]=cTot.b;} }
        else         { for (let i=fp; i<N;  i++) { const i3=i*3; colors[i3]=0;     colors[i3+1]=0;     colors[i3+2]=0;     } }

        child.geometry.attributes.color.needsUpdate = true;
        child.material.opacity = anyVisible ? 0.9 : 0.02;
    });
}

function onGalaxyResize() {
    const normalContainer = document.getElementById('galaxy-simulation-container');
    const fullscreenContainer = document.getElementById('galaxy-simulation-container-fullscreen');
    const overlay = document.getElementById('galaxy-fullscreen-overlay');

    const isFullscreen = overlay && overlay.classList.contains('active');
    const container = isFullscreen && fullscreenContainer ? fullscreenContainer : normalContainer;

    if (!container || container.clientHeight === 0 || container.clientWidth === 0) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    galaxyCamera.aspect = width / height;
    galaxyCamera.updateProjectionMatrix();
    galaxyRenderer.setSize(width, height);
}

function updateGalaxyRotation(value) {
    currentView.rotationSpeed = parseFloat(value);
    const formattedValue = parseFloat(value).toFixed(4);
    const displayEl = document.getElementById('galaxy-rotation-value');
    if (displayEl) displayEl.textContent = formattedValue;
    const fsDisplayEl = document.getElementById('fs-galaxy-rotation-value');
    if (fsDisplayEl) fsDisplayEl.textContent = formattedValue;
    const slider = document.getElementById('galaxy-rotation-speed');
    if (slider) updateSliderBackground(slider, 0, 0.01);
    const fsSlider = document.getElementById('fs-galaxy-rotation');
    if (fsSlider) updateSliderBackground(fsSlider, 0, 0.01);
}

function updateGalaxyTilt(value) {
    currentView.tilt = parseFloat(value);
    const displayEl = document.getElementById('galaxy-tilt-value');
    if (displayEl) displayEl.textContent = value + '°';
    const fsDisplayEl = document.getElementById('fs-galaxy-tilt-value');
    if (fsDisplayEl) fsDisplayEl.textContent = value + '°';
    const slider = document.getElementById('galaxy-tilt');
    if (slider) updateSliderBackground(slider, 0, 90);
    const fsSlider = document.getElementById('fs-galaxy-tilt');
    if (fsSlider) updateSliderBackground(fsSlider, 0, 90);

    const tiltRad = (value * Math.PI) / 180;
    const distance = currentView.zoom;

    galaxyCamera.position.y = Math.sin(tiltRad) * distance * 0.5;
    galaxyCamera.position.z = Math.cos(tiltRad) * distance;
    galaxyCamera.lookAt(0, 0, 0);
}

function updateGalaxyZoom(value) {
    currentView.zoom = parseFloat(value);
    const displayEl = document.getElementById('galaxy-zoom-value');
    if (displayEl) displayEl.textContent = value;
    const fsDisplayEl = document.getElementById('fs-galaxy-zoom-value');
    if (fsDisplayEl) fsDisplayEl.textContent = value;
    const slider = document.getElementById('galaxy-zoom');
    if (slider) updateSliderBackground(slider, 50, 400);
    const fsSlider = document.getElementById('fs-galaxy-zoom');
    if (fsSlider) updateSliderBackground(fsSlider, 50, 400);

    const tiltRad = (currentView.tilt * Math.PI) / 180;
    galaxyCamera.position.y = Math.sin(tiltRad) * currentView.zoom * 0.5;
    galaxyCamera.position.z = Math.cos(tiltRad) * currentView.zoom;
    galaxyCamera.lookAt(0, 0, 0);
}

function updateGalaxyStarSize(value) {
    currentView.starSize = parseFloat(value);
    const formattedValue = parseFloat(value).toFixed(1);
    const displayEl = document.getElementById('galaxy-star-size-value');
    if (displayEl) displayEl.textContent = formattedValue;
    const fsDisplayEl = document.getElementById('fs-galaxy-star-size-value');
    if (fsDisplayEl) fsDisplayEl.textContent = formattedValue;
    const slider = document.getElementById('galaxy-star-size');
    if (slider) updateSliderBackground(slider, 0.5, 3);
    const fsSlider = document.getElementById('fs-galaxy-star-size');
    if (fsSlider) updateSliderBackground(fsSlider, 0.5, 3);

    if (starSystem) {
        starSystem.material.size = currentView.starSize;
    }
}

function resetGalaxyView() {
    currentView = { ...DEFAULT_VIEW };

    const fsRotation = document.getElementById('fs-galaxy-rotation');
    const fsTilt = document.getElementById('fs-galaxy-tilt');
    const fsZoom = document.getElementById('fs-galaxy-zoom');
    const fsStarSize = document.getElementById('fs-galaxy-star-size');

    if (fsRotation) fsRotation.value = DEFAULT_VIEW.rotationSpeed;
    if (fsTilt) fsTilt.value = DEFAULT_VIEW.tilt;
    if (fsZoom) fsZoom.value = DEFAULT_VIEW.zoom;
    if (fsStarSize) fsStarSize.value = DEFAULT_VIEW.starSize;

    const fsRotationVal = document.getElementById('fs-galaxy-rotation-value');
    const fsTiltVal = document.getElementById('fs-galaxy-tilt-value');
    const fsZoomVal = document.getElementById('fs-galaxy-zoom-value');
    const fsStarSizeVal = document.getElementById('fs-galaxy-star-size-value');

    if (fsRotationVal) fsRotationVal.textContent = DEFAULT_VIEW.rotationSpeed;
    if (fsTiltVal) fsTiltVal.textContent = DEFAULT_VIEW.tilt + '°';
    if (fsZoomVal) fsZoomVal.textContent = DEFAULT_VIEW.zoom;
    if (fsStarSizeVal) fsStarSizeVal.textContent = DEFAULT_VIEW.starSize;

    const tiltRad = (DEFAULT_VIEW.tilt * Math.PI) / 180;
    galaxyCamera.position.y = Math.sin(tiltRad) * DEFAULT_VIEW.zoom * 0.5;
    galaxyCamera.position.z = Math.cos(tiltRad) * DEFAULT_VIEW.zoom;
    galaxyCamera.position.x = 0;
    galaxyCamera.lookAt(0, 0, 0);

    if (starSystem) {
        starSystem.material.size = DEFAULT_VIEW.starSize;
    }
}

let lastFrameTime = 0;

function animateGalaxyWithRotation() {
    requestAnimationFrame(animateGalaxyWithRotation);

    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    if (deltaTime < 8) {
        return;
    }

    if (starSystem) {
        starSystem.rotation.y += currentView.rotationSpeed * (deltaTime / 16.67);

        if (currentTime - lastBlinkTime > BLINK_INTERVAL) {
            communicativeBlinkState = !communicativeBlinkState;
            lastBlinkTime = currentTime;
            blinkTechStars();
        }
    }
    galaxyRenderer.render(galaxyScene, galaxyCamera);
}

function toggleGalaxyFullscreen() {
    if (!galaxyRenderer) {
        console.error('Galaxy renderer not initialized yet');
        return;
    }

    if (window.innerWidth <= 768) {
        showMobileFullscreenAlert();
        return;
    }

    const overlay = document.getElementById('galaxy-fullscreen-overlay');
    const section = document.querySelector('.galaxy-sim-section');
    const fullscreenBtn = document.querySelector('.fullscreen-btn-overlay');
    const normalContainer = document.getElementById('galaxy-simulation-container');
    const fullscreenContainer = document.getElementById('galaxy-simulation-container-fullscreen');

    if (!overlay || !normalContainer || !fullscreenContainer) return;

    const isEnteringFullscreen = !overlay.classList.contains('active');

    overlay.classList.toggle('active');

    if (overlay.classList.contains('active')) {
        section.classList.add('fullscreen');

        if (galaxyRenderer && galaxyRenderer.domElement) {
            const canvas = galaxyRenderer.domElement;
            fullscreenContainer.appendChild(canvas);
        }

        populateFullscreenParams();
        syncFullscreenValues();
        syncFullscreenVizControls();
        updateLegendUI();
        if (fullscreenBtn) {
            fullscreenBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
                <span data-i18n="fullscreen_exit_fullscreen">Exit Fullscreen</span>
            `;
            fullscreenBtn.setAttribute('aria-label', t('fullscreen_exit_fullscreen'));
            fullscreenBtn.setAttribute('title', t('fullscreen_exit_fullscreen'));
        }
        setTimeout(() => {
            onGalaxyResize();
            if (galaxyRenderer) {
                galaxyRenderer.render(galaxyScene, galaxyCamera);
            }
        }, 50);
    } else {
        section.classList.remove('fullscreen');

        if (galaxyRenderer && galaxyRenderer.domElement) {
            const canvas = galaxyRenderer.domElement;
            normalContainer.appendChild(canvas);
        }

        if (fullscreenBtn) {
            fullscreenBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h-3a2 2 0 0 0-2-2v-3"/></svg>
                <span data-i18n="galaxy_fullscreen_text">Open Fullscreen Simulation</span>
            `;
            fullscreenBtn.setAttribute('aria-label', t('galaxy_fullscreen_text'));
            fullscreenBtn.setAttribute('title', t('galaxy_fullscreen'));
        }

        setTimeout(() => {
            onGalaxyResize();
            if (galaxyRenderer) {
                galaxyRenderer.render(galaxyScene, galaxyCamera);
            }
        }, 50);
    }

    if (isEnteringFullscreen) {
        galaxyRendererFS = galaxyRenderer;
    }
}

function populateFullscreenParams() {
    const container = document.getElementById('fullscreen-params');
    if (!container) return;

    const presetsSection = document.createElement('div');
    presetsSection.className = 'fullscreen-presets-section';
    presetsSection.innerHTML = `
        <h4 class="presets-title" data-i18n="fullscreen_presets_title">${t('fullscreen_presets_title')}</h4>
        <div class="presets-legend" data-i18n="preset_legend">${t('preset_legend')}</div>
        <div class="fullscreen-presets-grid">
            <button class="preset-btn" data-action="fullscreen-preset" data-preset="optimistic" data-i18n="fullscreen_preset_optimistic">${t('fullscreen_preset_optimistic')}</button>
            <button class="preset-btn" data-action="fullscreen-preset" data-preset="sagan" data-i18n="fullscreen_preset_sagan">${t('fullscreen_preset_sagan')}</button>
            <button class="preset-btn" data-action="fullscreen-preset" data-preset="drake" data-i18n="fullscreen_preset_drake">${t('fullscreen_preset_drake')}</button>
            <button class="preset-btn" data-action="fullscreen-preset" data-preset="scientific" data-i18n="fullscreen_preset_scientific">${t('fullscreen_preset_scientific')}</button>
            <button class="preset-btn" data-action="fullscreen-preset" data-preset="rare_earth" data-i18n="fullscreen_preset_rare_earth">${t('fullscreen_preset_rare_earth')}</button>
            <button class="preset-btn" data-action="fullscreen-preset" data-preset="pessimistic" data-i18n="fullscreen_preset_pessimistic">${t('fullscreen_preset_pessimistic')}</button>
        </div>
    `;
    container.appendChild(presetsSection);

    const params = [
        { id: 'Rstar', label: t('labels.Rstar') },
        { id: 'fp', label: t('labels.fp'), varLabel: t('labels.fp_var') },
        { id: 'ne', label: t('labels.ne'), varLabel: t('labels.ne_var') },
        { id: 'fl', label: t('labels.fl'), varLabel: t('labels.fl_var') },
        { id: 'fi', label: t('labels.fi'), varLabel: t('labels.fi_var') },
        { id: 'fc', label: t('labels.fc'), varLabel: t('labels.fc_var') },
        { id: 'L', label: t('labels.L') }
    ];

    params.forEach(param => {
        const input = document.getElementById(param.id);
        if (!input) return;

        const valueDisplay = document.getElementById(param.id + '-value');
        const value = valueDisplay ? valueDisplay.textContent : input.value;

        const labelContent = param.varLabel
            ? `${param.label} <span class="param-var">${param.varLabel}</span>`
            : param.label;

        const item = document.createElement('div');
        item.className = 'fullscreen-param-item';
        item.innerHTML = `
            <label>
                ${labelContent}
                <span class="fullscreen-param-value" id="fs-${param.id}-value">${value}</span>
            </label>
            <input type="range" id="fs-${param.id}" min="${input.min}" max="${input.max}" step="${input.step}" value="${input.value}"
                   data-action="fs-param" data-param-id="${param.id}">
        `;
        container.appendChild(item);
    });
}

function applyPresetFromFullscreen(preset) {
    const originalBtn = document.querySelector(`.preset-btn[data-preset="${preset}"]`);
    if (originalBtn) {
        originalBtn.click();

        document.querySelectorAll('.fullscreen-presets-grid .preset-btn').forEach(btn => {
            btn.classList.remove('active-preset');
        });
        const activeFullscreenBtn = document.querySelector(`.fullscreen-presets-grid .preset-btn[data-preset="${preset}"]`);
        if (activeFullscreenBtn) {
            activeFullscreenBtn.classList.add('active-preset');
        }

        setTimeout(() => {
            syncFullscreenValues();
        }, 50);
    }
}

function updateParamFromFullscreen(paramId, value) {
    const originalInput = document.getElementById(paramId);
    const originalValue = document.getElementById(paramId + '-value');
    const fsValue = document.getElementById('fs-' + paramId + '-value');

    if (originalInput) {
        originalInput.value = value;
        originalInput.dispatchEvent(new Event('input'));
    }

    if (originalValue) {
        originalValue.textContent = value;
    }

    if (fsValue) {
        fsValue.textContent = value;
    }

    updateFullscreenN();
}

function syncFullscreenValues() {
    const params = ['Rstar', 'fp', 'ne', 'fl', 'fi', 'fc', 'L'];

    params.forEach(paramId => {
        const originalInput = document.getElementById(paramId);
        const originalValue = document.getElementById(paramId + '-value');
        const fsInput = document.getElementById('fs-' + paramId);
        const fsValue = document.getElementById('fs-' + paramId + '-value');

        if (originalInput && fsInput) {
            fsInput.value = originalInput.value;
        }

        if (originalValue && fsValue) {
            fsValue.textContent = originalValue.textContent;
        }
    });

    updateFullscreenN();
}

function updateFullscreenN() {
    const resultEl = document.getElementById('result');
    const fsResultEl = document.getElementById('fullscreen-n-value');
    const fsNumberEl = document.getElementById('fullscreen-n-number');

    if (resultEl && fsResultEl) {
        const nValue = resultEl.textContent;
        fsResultEl.textContent = nValue;
        if (fsNumberEl) {
            fsNumberEl.textContent = nValue;
        }
    }
}

function syncFullscreenVizControls() {
    const fsRotation = document.getElementById('fs-galaxy-rotation');
    const fsTilt = document.getElementById('fs-galaxy-tilt');
    const fsZoom = document.getElementById('fs-galaxy-zoom');
    const fsStarSize = document.getElementById('fs-galaxy-star-size');

    const fsRotationVal = document.getElementById('fs-galaxy-rotation-value');
    const fsTiltVal = document.getElementById('fs-galaxy-tilt-value');
    const fsZoomVal = document.getElementById('fs-galaxy-zoom-value');
    const fsStarSizeVal = document.getElementById('fs-galaxy-star-size-value');

    if (fsRotation) fsRotation.value = currentView.rotationSpeed;
    if (fsTilt) fsTilt.value = currentView.tilt;
    if (fsZoom) fsZoom.value = currentView.zoom;
    if (fsStarSize) fsStarSize.value = currentView.starSize;

    if (fsRotationVal) fsRotationVal.textContent = currentView.rotationSpeed;
    if (fsTiltVal) fsTiltVal.textContent = currentView.tilt + '°';
    if (fsZoomVal) fsZoomVal.textContent = currentView.zoom;
    if (fsStarSizeVal) fsStarSizeVal.textContent = currentView.starSize;
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        const section = document.querySelector('.galaxy-sim-section');
        if (section) {
            section.classList.remove('fullscreen');
        }
    }

    setTimeout(() => {
        onGalaxyResize();
    }, 100);
});

function toggleGalaxyCategory(category) {
    if (Object.hasOwn(GALAXY_VISIBILITY, category)) {
        GALAXY_VISIBILITY[category] = !GALAXY_VISIBILITY[category];

        updateLegendUI();

        const params = getCurrentDrakeParams();
        updateGalaxySimulation(params);
    }
}

function updateLegendUI() {
    const legends = [
        document.getElementById('galaxy-sim-legend'),
        document.getElementById('galaxy-sim-legend-fullscreen')
    ];

    const categoryMap = {
        'total': 0,
        'planets': 1,
        'habitable': 2,
        'life': 3,
        'intelligence': 4,
        'tech': 5
    };

    legends.forEach(legend => {
        if (!legend) return;

        const items = legend.querySelectorAll('.legend-item');
        const categories = ['total', 'planets', 'habitable', 'life', 'intelligence', 'tech'];

        items.forEach((item, index) => {
            const category = categories[index];
            if (GALAXY_VISIBILITY[category]) {
                item.classList.add('active');
                item.style.opacity = '1';
            } else {
                item.classList.remove('active');
                item.style.opacity = '0.4';
            }
        });
    });
}

function getCurrentDrakeParams() {
    const getParamValue = (paramId) => {
        const slider = document.getElementById(paramId);
        if (!slider) return 0;

        const value = parseFloat(slider.value);
        const logParams = ['fi', 'fl'];

        if (!logParams.includes(paramId)) return value;

        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        if (max / min < 100) return value;

        const position = (value - min) / (max - min);
        const logValue = min * Math.pow(max / min, position);
        return logValue;
    };

    return {
        Rstar: getParamValue('Rstar'),
        fp: getParamValue('fp'),
        ne: getParamValue('ne'),
        fl: getParamValue('fl'),
        fi: getParamValue('fi'),
        fc: getParamValue('fc'),
        L: getParamValue('L')
    };
}

function initGalaxyLegendHandlers() {
    const categories = ['total', 'planets', 'habitable', 'life', 'intelligence', 'tech'];

    document.addEventListener('click', (e) => {
        const item = e.target.closest('.legend-item');
        if (!item) return;

        const legend = item.closest('.galaxy-sim-legend');
        if (!legend) return;

        const items = Array.from(legend.querySelectorAll('.legend-item'));
        const index = items.indexOf(item);
        if (index === -1) return;

        const category = categories[index];
        toggleGalaxyCategory(category);
    });

    updateLegendUI();
}

function showMobileFullscreenAlert() {
    const alertMsg = currentLang === 'es'
        ? 'La vista en pantalla completa de la simulación solo está disponible en pantallas grandes.'
        : 'Fullscreen view is only available on large screens.';

    const existingAlert = document.querySelector('.mobile-fullscreen-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertEl = document.createElement('div');
    alertEl.className = 'mobile-fullscreen-alert';
    alertEl.innerHTML = `
        <div class="mobile-fullscreen-alert-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            <p>${alertMsg}</p>
        </div>
    `;

    document.body.appendChild(alertEl);

    setTimeout(() => {
        if (alertEl && alertEl.parentNode) {
            alertEl.classList.add('fade-out');
            setTimeout(() => alertEl.remove(), 300);
        }
    }, 3000);
}

export {
    initGalaxySimulation,
    updateGalaxySimulation,
    toggleGalaxyFullscreen,
    updateGalaxyRotation,
    updateGalaxyTilt,
    updateGalaxyZoom,
    updateGalaxyStarSize,
    resetGalaxyView,
    applyPresetFromFullscreen,
    updateParamFromFullscreen,
    syncFullscreenValues,
    populateFullscreenParams,
    initGalaxyLegendHandlers
};
