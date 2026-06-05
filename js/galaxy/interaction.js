import * as THREE from 'three';
import { t, currentLang } from '../i18n.js';
import { defaultValues } from '../config.js';
import {
    RGB_COLORS, GALAXY_VISIBILITY,
    DEFAULT_VIEW, starSystem, communicativeGlowSystem,
    _lastFcIdx, communicativeBlinkState,
    currentView, galaxyCamera, galaxyRenderer, galaxyScene,
    setGalaxyRendererFS, setCommunicativeGlowSystem,
    setLastFcIdx, setCurrentView,
    fullscreenUIVisible, fullscreenAutoHideTimer, fullscreenUIForced,
    setFullscreenUIVisible, setFullscreenAutoHideTimer, setFullscreenUIForced
} from './state.js';
import { STAR_COUNT, createGlowTexture, updateSliderBackground, onGalaxyResize } from './scene.js';

function rebuildGlowSystem(params) {
    if (!starSystem) return;

    if (communicativeGlowSystem) {
        starSystem.remove(communicativeGlowSystem);
        communicativeGlowSystem.geometry.dispose();
        setCommunicativeGlowSystem(null);
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

    const glowSys = new THREE.Points(glowGeometry, glowMaterial);
    setCommunicativeGlowSystem(glowSys);
    starSystem.add(glowSys);
}

export function updateGalaxySimulation(params) {
    if (!starSystem) return;

    const colors = starSystem.geometry.attributes.color.array;
    const fpFrac = params.fp;
    const neFrac = fpFrac * (params.ne / 10);
    const flFrac = neFrac * params.fl;
    const fiFrac = flFrac * params.fi;
    const fcFrac = fiFrac * params.fc;

    const fc = Math.min(STAR_COUNT, Math.max(0, Math.round(STAR_COUNT * fcFrac)));
    const fi = Math.min(STAR_COUNT, Math.max(0, Math.round(STAR_COUNT * fiFrac)));
    const fl = Math.min(STAR_COUNT, Math.max(0, Math.round(STAR_COUNT * flFrac)));
    const ne = Math.min(STAR_COUNT, Math.max(0, Math.round(STAR_COUNT * neFrac)));
    const fp = Math.min(STAR_COUNT, Math.max(0, Math.round(STAR_COUNT * fpFrac)));

    setLastFcIdx(fc);

    const blinkMult = communicativeBlinkState ? 1.0 : 0.3;
    const cT = RGB_COLORS.tech;
    const techR = cT.r * blinkMult, techG = cT.g * blinkMult, techB = cT.b * blinkMult;
    const cI = RGB_COLORS.intelligence;
    const cL = RGB_COLORS.life;
    const cH = RGB_COLORS.habitable;
    const cP = RGB_COLORS.planets;
    const cTot = RGB_COLORS.total;

    if (GALAXY_VISIBILITY.tech) {
        for (let i = 0; i < fc; i++) { const i3 = i * 3; colors[i3] = techR; colors[i3 + 1] = techG; colors[i3 + 2] = techB; }
    } else {
        for (let i = 0; i < fc; i++) { const i3 = i * 3; colors[i3] = 0; colors[i3 + 1] = 0; colors[i3 + 2] = 0; }
    }

    if (GALAXY_VISIBILITY.intelligence) {
        for (let i = fc; i < fi; i++) { const i3 = i * 3; colors[i3] = cI.r; colors[i3 + 1] = cI.g; colors[i3 + 2] = cI.b; }
    } else {
        for (let i = fc; i < fi; i++) { const i3 = i * 3; colors[i3] = 0; colors[i3 + 1] = 0; colors[i3 + 2] = 0; }
    }

    if (GALAXY_VISIBILITY.life) {
        for (let i = fi; i < fl; i++) { const i3 = i * 3; colors[i3] = cL.r; colors[i3 + 1] = cL.g; colors[i3 + 2] = cL.b; }
    } else {
        for (let i = fi; i < fl; i++) { const i3 = i * 3; colors[i3] = 0; colors[i3 + 1] = 0; colors[i3 + 2] = 0; }
    }

    if (GALAXY_VISIBILITY.habitable) {
        for (let i = fl; i < ne; i++) { const i3 = i * 3; colors[i3] = cH.r; colors[i3 + 1] = cH.g; colors[i3 + 2] = cH.b; }
    } else {
        for (let i = fl; i < ne; i++) { const i3 = i * 3; colors[i3] = 0; colors[i3 + 1] = 0; colors[i3 + 2] = 0; }
    }

    if (GALAXY_VISIBILITY.planets) {
        for (let i = ne; i < fp; i++) { const i3 = i * 3; colors[i3] = cP.r; colors[i3 + 1] = cP.g; colors[i3 + 2] = cP.b; }
    } else {
        for (let i = ne; i < fp; i++) { const i3 = i * 3; colors[i3] = 0; colors[i3 + 1] = 0; colors[i3 + 2] = 0; }
    }

    if (GALAXY_VISIBILITY.total) {
        for (let i = fp; i < STAR_COUNT; i++) { const i3 = i * 3; colors[i3] = cTot.r; colors[i3 + 1] = cTot.g; colors[i3 + 2] = cTot.b; }
    } else {
        for (let i = fp; i < STAR_COUNT; i++) { const i3 = i * 3; colors[i3] = 0; colors[i3 + 1] = 0; colors[i3 + 2] = 0; }
    }

    starSystem.geometry.attributes.color.needsUpdate = true;
    rebuildGlowSystem(params);
    updateClusterVisibility(params);
}

export function blinkTechStars() {
    if (!starSystem || !GALAXY_VISIBILITY.tech || _lastFcIdx === 0) return;
    const colors = starSystem.geometry.attributes.color.array;
    const cT = RGB_COLORS.tech;
    const blinkMult = communicativeBlinkState ? 1.0 : 0.3;
    const r = cT.r * blinkMult, g = cT.g * blinkMult, b = cT.b * blinkMult;
    for (let i = 0; i < _lastFcIdx; i++) { const i3 = i * 3; colors[i3] = r; colors[i3 + 1] = g; colors[i3 + 2] = b; }
    starSystem.geometry.attributes.color.needsUpdate = true;

    if (communicativeGlowSystem) {
        communicativeGlowSystem.material.opacity = communicativeBlinkState ? 0.6 : 0.15;
    }
}

function updateClusterVisibility(params) {
    if (!starSystem || !starSystem.children || starSystem.children.length === 0) return;

    const blinkMult = communicativeBlinkState ? 1.0 : 0.3;
    const cT = RGB_COLORS.tech;
    const techR = cT.r * blinkMult, techG = cT.g * blinkMult, techB = cT.b * blinkMult;
    const cI = RGB_COLORS.intelligence;
    const cL = RGB_COLORS.life;
    const cH = RGB_COLORS.habitable;
    const cP = RGB_COLORS.planets;
    const cTot = RGB_COLORS.total;

    const vTech = GALAXY_VISIBILITY.tech;
    const vIntel = GALAXY_VISIBILITY.intelligence;
    const vLife = GALAXY_VISIBILITY.life;
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

        if (vTech) { for (let i = 0; i < fc; i++) { const i3 = i * 3; colors[i3] = techR; colors[i3 + 1] = techG; colors[i3 + 2] = techB; } }
        else { for (let i = 0; i < fc; i++) { const i3 = i * 3; colors[i3] = 0; colors[i3 + 1] = 0; colors[i3 + 2] = 0; } }

        if (vIntel) { for (let i = fc; i < fi; i++) { const i3 = i * 3; colors[i3] = cI.r; colors[i3 + 1] = cI.g; colors[i3 + 2] = cI.b; } }
        else { for (let i = fc; i < fi; i++) { const i3 = i * 3; colors[i3] = 0; colors[i3 + 1] = 0; colors[i3 + 2] = 0; } }

        if (vLife) { for (let i = fi; i < fl; i++) { const i3 = i * 3; colors[i3] = cL.r; colors[i3 + 1] = cL.g; colors[i3 + 2] = cL.b; } }
        else { for (let i = fi; i < fl; i++) { const i3 = i * 3; colors[i3] = 0; colors[i3 + 1] = 0; colors[i3 + 2] = 0; } }

        if (vHabit) { for (let i = fl; i < ne; i++) { const i3 = i * 3; colors[i3] = cH.r; colors[i3 + 1] = cH.g; colors[i3 + 2] = cH.b; } }
        else { for (let i = fl; i < ne; i++) { const i3 = i * 3; colors[i3] = 0; colors[i3 + 1] = 0; colors[i3 + 2] = 0; } }

        if (vPlanets) { for (let i = ne; i < fp; i++) { const i3 = i * 3; colors[i3] = cP.r; colors[i3 + 1] = cP.g; colors[i3 + 2] = cP.b; } }
        else { for (let i = ne; i < fp; i++) { const i3 = i * 3; colors[i3] = 0; colors[i3 + 1] = 0; colors[i3 + 2] = 0; } }

        if (vTotal) { for (let i = fp; i < N; i++) { const i3 = i * 3; colors[i3] = cTot.r; colors[i3 + 1] = cTot.g; colors[i3 + 2] = cTot.b; } }
        else { for (let i = fp; i < N; i++) { const i3 = i * 3; colors[i3] = 0; colors[i3 + 1] = 0; colors[i3 + 2] = 0; } }

        child.geometry.attributes.color.needsUpdate = true;
        child.material.opacity = anyVisible ? 0.9 : 0.02;
    });
}

export function toggleGalaxyCategory(category) {
    if (Object.hasOwn(GALAXY_VISIBILITY, category)) {
        GALAXY_VISIBILITY[category] = !GALAXY_VISIBILITY[category];
        updateLegendUI();
        const params = getCurrentDrakeParams();
        updateGalaxySimulation(params);
    }
}

export function updateLegendUI() {
    const legends = [
        document.getElementById('galaxy-sim-legend'),
        document.getElementById('galaxy-sim-legend-fullscreen')
    ];
    const categories = ['total', 'planets', 'habitable', 'life', 'intelligence', 'tech'];

    legends.forEach(legend => {
        if (!legend) return;
        const items = legend.querySelectorAll('.legend-item');
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

export function getCurrentDrakeParams() {
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
        return min * Math.pow(max / min, position);
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

export function initGalaxyLegendHandlers() {
    const categories = ['total', 'planets', 'habitable', 'life', 'intelligence', 'tech'];

    document.addEventListener('click', (e) => {
        const item = e.target.closest('.legend-item');
        if (!item) return;
        const legend = item.closest('.galaxy-sim-legend, #galaxy-sim-legend-fullscreen');
        if (!legend) return;
        const items = Array.from(legend.querySelectorAll('.legend-item'));
        const index = items.indexOf(item);
        if (index === -1) return;
        toggleGalaxyCategory(categories[index]);
    });

    updateLegendUI();
}

export function showMobileFullscreenAlert() {
    const alertMsg = currentLang === 'es'
        ? 'La vista en pantalla completa de la simulación solo está disponible en pantallas grandes.'
        : 'Fullscreen view is only available on large screens.';

    const existingAlert = document.querySelector('.mobile-fullscreen-alert');
    if (existingAlert) existingAlert.remove();

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

const AUTO_HIDE_DELAY = 3000;

function showFullscreenUI(overlay) {
    if (!overlay) overlay = document.getElementById('galaxy-fullscreen-overlay');
    if (!overlay) return;
    overlay.classList.remove('ui-hidden');
    overlay.classList.remove('ui-hidden-all');
    setFullscreenUIVisible(true);
}

function hideFullscreenUI(overlay, hideAll) {
    if (!overlay) overlay = document.getElementById('galaxy-fullscreen-overlay');
    if (!overlay) return;
    if (hideAll) {
        overlay.classList.add('ui-hidden-all');
        overlay.classList.remove('ui-hidden');
    } else {
        overlay.classList.add('ui-hidden');
        overlay.classList.remove('ui-hidden-all');
    }
    setFullscreenUIVisible(false);
}

function startAutoHideTimer(overlay) {
    stopAutoHideTimer();
    showFullscreenUI(overlay);
    const timer = setTimeout(() => {
        hideFullscreenUI(overlay, false);
    }, AUTO_HIDE_DELAY);
    setFullscreenAutoHideTimer(timer);
}

function stopAutoHideTimer() {
    if (fullscreenAutoHideTimer) {
        clearTimeout(fullscreenAutoHideTimer);
        setFullscreenAutoHideTimer(null);
    }
}

function resetAutoHideTimer(overlay) {
    if (!overlay) overlay = document.getElementById('galaxy-fullscreen-overlay');
    if (!overlay) return;
    if (overlay.classList.contains('active')) {
        showFullscreenUI(overlay);
        startAutoHideTimer(overlay);
    }
}

export function isGalaxyFullscreen() {
    const overlay = document.getElementById('galaxy-fullscreen-overlay');
    return overlay && overlay.classList.contains('active');
}

export function handleFullscreenKeydown(e) {
    const overlay = document.getElementById('galaxy-fullscreen-overlay');
    if (!overlay) return;

    if (e.key === 'f' || e.key === 'F' || e.key === 'Escape') {
        if (e.key === 'Escape' && !overlay.classList.contains('active')) return;
        e.preventDefault();
        toggleGalaxyFullscreen();
        return;
    }

    if (!overlay.classList.contains('active')) return;

    if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        const isAllHidden = overlay.classList.contains('ui-hidden-all');
        if (isAllHidden) {
            showFullscreenUI(overlay);
            setFullscreenUIForced(false);
            startAutoHideTimer(overlay);
        } else {
            hideFullscreenUI(overlay, true);
            setFullscreenUIForced(true);
            stopAutoHideTimer();
        }
        return;
    }

    if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetGalaxyView();
        resetAutoHideTimer(overlay);
    }
}

export function updateGalaxyRotation(value) {
    setCurrentView({ ...currentView, rotationSpeed: parseFloat(value) });
    const formattedValue = parseFloat(value).toFixed(4);
    ['galaxy-rotation-value', 'fs-galaxy-rotation-value'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = formattedValue;
    });
    ['galaxy-rotation-speed', 'fs-galaxy-rotation'].forEach(id => {
        const el = document.getElementById(id);
        if (el) updateSliderBackground(el, 0, 0.01);
    });
}

export function updateGalaxyTilt(value) {
    setCurrentView({ ...currentView, tilt: parseFloat(value) });
    ['galaxy-tilt-value', 'fs-galaxy-tilt-value'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = value + '°';
    });
    ['galaxy-tilt', 'fs-galaxy-tilt'].forEach(id => {
        const el = document.getElementById(id);
        if (el) updateSliderBackground(el, 0, 90);
    });

    const tiltRad = (value * Math.PI) / 180;
    galaxyCamera.position.y = Math.sin(tiltRad) * currentView.zoom * 0.5;
    galaxyCamera.position.z = Math.cos(tiltRad) * currentView.zoom;
    galaxyCamera.lookAt(0, 0, 0);
}

export function updateGalaxyZoom(value) {
    setCurrentView({ ...currentView, zoom: parseFloat(value) });
    ['galaxy-zoom-value', 'fs-galaxy-zoom-value'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
    ['galaxy-zoom', 'fs-galaxy-zoom'].forEach(id => {
        const el = document.getElementById(id);
        if (el) updateSliderBackground(el, 50, 400);
    });

    const tiltRad = (currentView.tilt * Math.PI) / 180;
    galaxyCamera.position.y = Math.sin(tiltRad) * currentView.zoom * 0.5;
    galaxyCamera.position.z = Math.cos(tiltRad) * currentView.zoom;
    galaxyCamera.lookAt(0, 0, 0);
}

export function updateGalaxyStarSize(value) {
    setCurrentView({ ...currentView, starSize: parseFloat(value) });
    const formattedValue = parseFloat(value).toFixed(1);
    ['galaxy-star-size-value', 'fs-galaxy-star-size-value'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = formattedValue;
    });
    ['galaxy-star-size', 'fs-galaxy-star-size'].forEach(id => {
        const el = document.getElementById(id);
        if (el) updateSliderBackground(el, 0.5, 3);
    });

    if (starSystem) starSystem.material.size = currentView.starSize;
}

export function resetGalaxyView() {
    setCurrentView({ ...DEFAULT_VIEW });

    const mappings = {
        'fs-galaxy-rotation': 'rotationSpeed',
        'fs-galaxy-tilt': 'tilt',
        'fs-galaxy-zoom': 'zoom',
        'fs-galaxy-star-size': 'starSize'
    };

    for (const [id, key] of Object.entries(mappings)) {
        const el = document.getElementById(id);
        if (el) el.value = DEFAULT_VIEW[key];
    }

    for (const id of ['rotation', 'tilt', 'zoom', 'star-size']) {
        const valEl = document.getElementById(`fs-galaxy-${id}-value`);
        if (valEl) valEl.textContent = id === 'tilt' ? `${DEFAULT_VIEW.tilt}°` : DEFAULT_VIEW[String(id === 'star-size' ? 'starSize' : id)];
    }

    const tiltRad = (DEFAULT_VIEW.tilt * Math.PI) / 180;
    galaxyCamera.position.y = Math.sin(tiltRad) * DEFAULT_VIEW.zoom * 0.5;
    galaxyCamera.position.z = Math.cos(tiltRad) * DEFAULT_VIEW.zoom;
    galaxyCamera.position.x = 0;
    galaxyCamera.lookAt(0, 0, 0);

    if (starSystem) starSystem.material.size = DEFAULT_VIEW.starSize;
}

let _fullscreenMousemoveHandler = null;
let _fullscreenTouchHandler = null;

export function toggleGalaxyFullscreen() {
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

    if (isEnteringFullscreen) {
        overlay.classList.add('active');
        section.classList.add('fullscreen');
        setFullscreenUIForced(false);
        showFullscreenUI(overlay);

        if (galaxyRenderer && galaxyRenderer.domElement) {
            fullscreenContainer.appendChild(galaxyRenderer.domElement);
        }
        populateFullscreenParams();
        syncFullscreenValues();
        syncFullscreenVizControls();
        updateLegendUI();
        setGalaxyRendererFS(galaxyRenderer);

        if (fullscreenBtn) {
            fullscreenBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
                <span data-i18n="fullscreen_exit_fullscreen">Exit Fullscreen</span>
            `;
            fullscreenBtn.setAttribute('aria-label', t('fullscreen_exit_fullscreen'));
            fullscreenBtn.setAttribute('title', t('fullscreen_exit_fullscreen'));
        }

        _fullscreenMousemoveHandler = () => {
            if (fullscreenUIForced) return;
            resetAutoHideTimer(overlay);
        };
        _fullscreenTouchHandler = () => {
            if (fullscreenUIForced) return;
            resetAutoHideTimer(overlay);
        };
        document.addEventListener('mousemove', _fullscreenMousemoveHandler);
        document.addEventListener('touchstart', _fullscreenTouchHandler);

        startAutoHideTimer(overlay);

        setTimeout(() => {
            onGalaxyResize();
            if (galaxyRenderer) galaxyRenderer.render(galaxyScene, galaxyCamera);
        }, 50);
    } else {
        overlay.classList.remove('active');
        section.classList.remove('fullscreen');
        overlay.classList.remove('ui-hidden');
        overlay.classList.remove('ui-hidden-all');
        setFullscreenUIForced(false);
        stopAutoHideTimer();

        if (galaxyRenderer && galaxyRenderer.domElement) {
            normalContainer.appendChild(galaxyRenderer.domElement);
        }

        if (_fullscreenMousemoveHandler) {
            document.removeEventListener('mousemove', _fullscreenMousemoveHandler);
            _fullscreenMousemoveHandler = null;
        }
        if (_fullscreenTouchHandler) {
            document.removeEventListener('touchstart', _fullscreenTouchHandler);
            _fullscreenTouchHandler = null;
        }

        if (fullscreenBtn) {
            fullscreenBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                <span data-i18n="galaxy_fullscreen_text">Open Fullscreen Simulation</span>
            `;
            fullscreenBtn.setAttribute('aria-label', t('galaxy_fullscreen_text'));
            fullscreenBtn.setAttribute('title', t('galaxy_fullscreen'));
        }
        setTimeout(() => {
            onGalaxyResize();
            if (galaxyRenderer) galaxyRenderer.render(galaxyScene, galaxyCamera);
        }, 50);
    }
}

export function populateFullscreenParams() {
    const container = document.getElementById('fullscreen-params');
    if (!container) return;

    container.innerHTML = '';

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
            <label>${labelContent}<span class="fullscreen-param-value" id="fs-${param.id}-value">${value}</span></label>
            <input type="range" id="fs-${param.id}" min="${input.min}" max="${input.max}" step="${input.step}" value="${input.value}" data-action="fs-param" data-param-id="${param.id}">
        `;
        container.appendChild(item);
    });
}

export function applyPresetFromFullscreen(preset) {
    const originalBtn = document.querySelector(`.preset-btn[data-preset="${preset}"]`);
    if (originalBtn) {
        originalBtn.click();
        document.querySelectorAll('.fullscreen-presets-grid .preset-btn').forEach(btn => btn.classList.remove('active-preset'));
        const activeFullscreenBtn = document.querySelector(`.fullscreen-presets-grid .preset-btn[data-preset="${preset}"]`);
        if (activeFullscreenBtn) activeFullscreenBtn.classList.add('active-preset');
        setTimeout(() => syncFullscreenValues(), 50);
    }
}

export function updateParamFromFullscreen(paramId, value) {
    const originalInput = document.getElementById(paramId);
    const originalValue = document.getElementById(paramId + '-value');
    const fsValue = document.getElementById('fs-' + paramId + '-value');

    if (originalInput) {
        originalInput.value = value;
        originalInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (originalValue) originalValue.textContent = value;
    if (fsValue) fsValue.textContent = value;
    updateFullscreenN();
}

export function syncFullscreenValues() {
    const params = ['Rstar', 'fp', 'ne', 'fl', 'fi', 'fc', 'L'];
    params.forEach(paramId => {
        const originalInput = document.getElementById(paramId);
        const originalValue = document.getElementById(paramId + '-value');
        const fsInput = document.getElementById('fs-' + paramId);
        const fsValue = document.getElementById('fs-' + paramId + '-value');

        if (originalInput && fsInput) fsInput.value = originalInput.value;
        if (originalValue && fsValue) fsValue.textContent = originalValue.textContent;
    });
    updateFullscreenN();
}

export function updateFullscreenN() {
    const resultEl = document.getElementById('result');
    const fsResultEl = document.getElementById('fullscreen-n-value');
    const fsNumberEl = document.getElementById('fullscreen-n-number');

    if (resultEl && fsResultEl) {
        const nValue = resultEl.textContent;
        fsResultEl.textContent = nValue;
        if (fsNumberEl) fsNumberEl.textContent = nValue;
    }
}

export function syncFullscreenVizControls() {
    const keys = [
        { el: 'fs-galaxy-rotation', key: 'rotationSpeed', suffix: 'rotation' },
        { el: 'fs-galaxy-tilt', key: 'tilt', suffix: 'tilt' },
        { el: 'fs-galaxy-zoom', key: 'zoom', suffix: 'zoom' },
        { el: 'fs-galaxy-star-size', key: 'starSize', suffix: 'star-size' }
    ];
    keys.forEach(({ el: elId, key, suffix }) => {
        const el = document.getElementById(elId);
        const valEl = document.getElementById(`fs-galaxy-${suffix}-value`);
        if (el) el.value = currentView[key];
        if (valEl) valEl.textContent = suffix === 'tilt' ? currentView[key] + '°' : currentView[key];
    });
}
