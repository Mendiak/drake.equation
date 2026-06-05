import * as THREE from 'three';
import { defaultValues } from '../config.js';
import {
    QUALITY_SETTINGS, GALAXY_PARAMS, COLORS,
    galaxyScene, galaxyCamera, galaxyRenderer, starSystem,
    setStarSystem, setGalaxyScene, setGalaxyCamera, setGalaxyRenderer
} from './state.js';

let _cachedQuality = null;

function detectPerformanceTier() {
    const hasHighEndDevice = navigator.deviceMemory && navigator.deviceMemory >= 8;
    const hasManyCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 8;
    if (hasHighEndDevice && hasManyCores) return 'high';
    if (navigator.deviceMemory && navigator.deviceMemory <= 4) return 'low';
    return 'medium';
}

const CURRENT_QUALITY = QUALITY_SETTINGS[detectPerformanceTier()];
export const STAR_COUNT = CURRENT_QUALITY.starCount;

export function updateSliderBackground(input, min, max) {
    const value = parseFloat(input.value);
    const percentage = ((value - min) / (max - min)) * 100;
    input.style.setProperty('--slider-fill', `${percentage}%`);
}

export function initGalaxySliders() {
}

export function generateGlobularClusterPosition() {
    const distance = 20 + Math.random() * 50;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const verticalFactor = 0.4;
    return {
        x: distance * Math.sin(phi) * Math.cos(theta),
        y: distance * Math.cos(phi) * verticalFactor,
        z: distance * Math.sin(phi) * Math.sin(theta)
    };
}

export function generateOpenClusterPosition() {
    const armIndex = Math.floor(Math.random() * GALAXY_PARAMS.spiralArms);
    const baseAngle = (armIndex / GALAXY_PARAMS.spiralArms) * Math.PI * 2;
    const radius = 35 + Math.random() * (GALAXY_PARAMS.diskRadius - 45);
    const spiralAngle = baseAngle + Math.log(radius + 1) * GALAXY_PARAMS.armTightness * GALAXY_PARAMS.armCurvature;
    const armOffset = (Math.random() - 0.5) * 6;
    const angleOffset = (Math.random() - 0.5) * 0.15;
    const effectiveRadius = radius + armOffset;
    const finalAngle = spiralAngle + angleOffset;
    return {
        x: Math.cos(finalAngle) * effectiveRadius,
        y: (Math.random() - 0.5) * 4,
        z: Math.sin(finalAngle) * effectiveRadius
    };
}

export function generateClusterStars(centerX, centerY, centerZ, starCount, clusterType) {
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
        const r = rScale * Math.pow(u, 1 / 3) / Math.pow(1 - u, 1 / 3);
        const clampedR = Math.min(r, clusterType === 'globular' ? 20 : 12);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = centerX + clampedR * Math.sin(phi) * Math.cos(theta);
        const y = centerY + clampedR * Math.cos(phi);
        const z = centerZ + clampedR * Math.sin(phi) * Math.sin(theta);
        positions.push(x, y, z);

        let colorHex;
        if (i < fcThreshold) colorHex = COLORS.tech;
        else if (i < fiThreshold) colorHex = COLORS.intelligence;
        else if (i < flThreshold) colorHex = COLORS.life;
        else if (i < neThreshold) colorHex = COLORS.habitable;
        else if (i < fpThreshold) colorHex = COLORS.planets;
        else colorHex = COLORS.total;

        const color = new THREE.Color(colorHex);
        colors.push(color.r, color.g, color.b);
        sizes.push(0.8 + Math.random() * 1.8);
    }
    return { positions, colors, sizes };
}

function getStellarPopulationColor(population) {
    const color = new THREE.Color();
    switch (population) {
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

export function generateSpiralGalaxyPosition() {
    const armIndex = Math.floor(Math.random() * GALAXY_PARAMS.spiralArms);
    const baseAngle = (armIndex / GALAXY_PARAMS.spiralArms) * Math.PI * 2;
    const radiusRandom = Math.random();
    let radiusNorm;
    const distributionType = Math.random();

    if (distributionType < 0.50) radiusNorm = Math.pow(radiusRandom, 0.55);
    else if (distributionType < 0.75) radiusNorm = Math.pow(radiusRandom, 0.7) * 0.5;
    else if (distributionType < 0.90) radiusNorm = Math.pow(radiusRandom, 0.5) * 0.7 + 0.1;
    else radiusNorm = Math.pow(radiusRandom, 0.4) * 0.6 + 0.35;

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
    if (radius < GALAXY_PARAMS.coreRadius * 0.4) population = 'core';
    else if (radius < GALAXY_PARAMS.diskRadius * 0.3) population = Math.random() < 0.3 ? 'thickDisk' : 'spiralArm';

    return { x, y, z, population };
}

export function createStarTexture() {
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

export function createGlowTexture() {
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

export function createStarField(sprite, glowSprite) {
    const mainGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    const glowPositions = [];

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
        } else if (i < fiThreshold) colorHex = COLORS.intelligence;
        else if (i < flThreshold) colorHex = COLORS.life;
        else if (i < neThreshold) colorHex = COLORS.habitable;
        else if (i < fpThreshold) colorHex = COLORS.planets;
        else colorHex = COLORS.total;

        const color = new THREE.Color(colorHex);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        sizes[i] = Math.random() * 1.5 + 0.5;
    }

    mainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    mainGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    mainGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

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

    const system = new THREE.Points(mainGeometry, mainMaterial);
    galaxyScene.add(system);
    setStarSystem(system);

    if (glowPositions.length > 0) {
        const glowGeom = new THREE.BufferGeometry();
        glowGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(glowPositions), 3));
        const glowMat = new THREE.PointsMaterial({
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
        const glowSys = new THREE.Points(glowGeom, glowMat);
        system.add(glowSys);
    }

    return system;
}

export function createStarClusters(sprite) {
    for (let i = 0; i < GALAXY_PARAMS.globularClusters; i++) {
        const clusterPos = generateGlobularClusterPosition();
        const count = Math.floor(
            GALAXY_PARAMS.clusterStarsMin +
            Math.random() * (GALAXY_PARAMS.clusterStarsMax - GALAXY_PARAMS.clusterStarsMin)
        );
        const clusterData = generateClusterStars(clusterPos.x, clusterPos.y, clusterPos.z, count, 'globular');
        addClusterMesh(clusterData, sprite, 1.0);
    }

    for (let i = 0; i < GALAXY_PARAMS.openClusters; i++) {
        const clusterPos = generateOpenClusterPosition();
        const count = Math.floor(
            GALAXY_PARAMS.clusterStarsMin * 0.4 +
            Math.random() * (GALAXY_PARAMS.clusterStarsMax * 0.6 - GALAXY_PARAMS.clusterStarsMin * 0.4)
        );
        const clusterData = generateClusterStars(clusterPos.x, clusterPos.y, clusterPos.z, count, 'open');
        addClusterMesh(clusterData, sprite, 1.1);
    }
}

function addClusterMesh(clusterData, sprite, size) {
    if (!starSystem) return;

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
        size: size,
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

export function onGalaxyResize() {
    if (!galaxyCamera || !galaxyRenderer) return;
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
