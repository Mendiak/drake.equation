import { t } from '../../i18n/i18n.js';
import {
    RGB_COLORS, GALAXY_VISIBILITY,
    DEFAULT_VIEW, starSystem, communicativeBlinkState,
    currentView, galaxyRenderer, galaxyScene, galaxyCamera,
    setGalaxyRendererFS, setCurrentView,
    fullscreenAutoHideTimer, fullscreenUIForced,
    setFullscreenUIVisible, setFullscreenAutoHideTimer, setFullscreenUIForced
} from './state.js';
import { updateSliderBackground, onGalaxyResize, applyCameraView } from './scene.js';
import { trapFocus } from '../../ui/a11y.js';
import { linearToLog } from '../../ui/slider-utils.js';

function paintRange(colors, start, end, rgb, visible) {
    const r = visible ? rgb.r : 0;
    const g = visible ? rgb.g : 0;
    const b = visible ? rgb.b : 0;
    for (let i = start; i < end; i++) {
        const i3 = i * 3;
        colors[i3] = r;
        colors[i3 + 1] = g;
        colors[i3 + 2] = b;
    }
}

/**
 * Paints the filled part of a range track. Wide ranges (L, fi, fl) are
 * positioned on a log scale so the fill matches how the slider feels.
 */
export function updateRangeFill(input) {
    if (!input) return;

    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const value = parseFloat(input.value);
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return;

    const ratio = max / min >= 100
        ? Math.log(Math.max(value, min) / min) / Math.log(max / min)
        : (value - min) / (max - min);

    const percentage = Math.min(100, Math.max(0, ratio * 100));
    input.style.setProperty('--slider-fill', `${percentage}%`);
}

/**
 * Mirrors the blinking communicative stars on the legend dot. The LED keeps
 * pulsing even when the sample has no communicative stars, so the legend still
 * communicates what the blinking white stars would mean.
 */
function updateTechLegendPulse() {
    const dimmed = !communicativeBlinkState;

    document.querySelectorAll('.dot-tech').forEach(dot => {
        dot.classList.toggle('dot-tech-blink-off', dimmed);
    });
}

export function updateGalaxySimulation(params) {
    if (!starSystem || !starSystem.geometry) return;

    const colorAttr = starSystem.geometry.getAttribute('aColor');
    const techAttr = starSystem.geometry.getAttribute('aTech');
    if (!colorAttr || !techAttr) return;

    const colors = colorAttr.array;
    const techFlags = techAttr.array;
    const total = colorAttr.count;

    const fpFrac = Math.min(1, params.fp);
    // ne is planets per system, so fp * ne is the average number of habitable
    // planets per star. Each stage is capped by the previous one so the painted
    // bands stay nested: a star cannot be "habitable" without first being a
    // star with planets.
    const neFrac = Math.min(fpFrac, params.fp * params.ne);
    const flFrac = Math.min(neFrac, neFrac * Math.min(1, params.fl));
    const fiFrac = Math.min(flFrac, flFrac * Math.min(1, params.fi));
    const fcFrac = Math.min(fiFrac, fiFrac * Math.min(1, params.fc));

    const clampIndex = value => Math.min(total, Math.max(0, Math.round(value)));

    const fc = clampIndex(total * fcFrac);
    const fi = clampIndex(total * fiFrac);
    const fl = clampIndex(total * flFrac);
    const ne = clampIndex(total * neFrac);
    const fp = clampIndex(total * fpFrac);

    paintRange(colors, 0, fc, RGB_COLORS.tech, GALAXY_VISIBILITY.tech);
    paintRange(colors, fc, fi, RGB_COLORS.intelligence, GALAXY_VISIBILITY.intelligence);
    paintRange(colors, fi, fl, RGB_COLORS.life, GALAXY_VISIBILITY.life);
    paintRange(colors, fl, ne, RGB_COLORS.habitable, GALAXY_VISIBILITY.habitable);
    paintRange(colors, ne, fp, RGB_COLORS.planets, GALAXY_VISIBILITY.planets);
    paintRange(colors, fp, total, RGB_COLORS.total, GALAXY_VISIBILITY.total);

    colorAttr.needsUpdate = true;

    for (let i = 0; i < total; i++) {
        techFlags[i] = i < fc ? 1 : 0;
    }
    techAttr.needsUpdate = true;

    const uniforms = starSystem.material && starSystem.material.uniforms;
    if (uniforms && uniforms.uBlink) {
        uniforms.uBlink.value = communicativeBlinkState ? 1 : 0.3;
    }

    updateTechLegendPulse();
}

export function blinkTechStars() {
    if (!starSystem || !starSystem.material) return;
    const uniforms = starSystem.material.uniforms;
    if (!uniforms || !uniforms.uBlink) return;
    uniforms.uBlink.value = communicativeBlinkState ? 1 : 0.3;
    updateTechLegendPulse();
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
                item.style.opacity = '0.6';
            }
            item.setAttribute('aria-pressed', String(Boolean(GALAXY_VISIBILITY[category])));
        });
    });

    updateTechLegendPulse();
}

export function getCurrentDrakeParams() {
    // Single conversion path shared with the calculator (slider-utils). The
    // galaxy used to apply an extra logarithmic transform to fl and fi, which
    // made the painted bands disagree with N by up to two orders of magnitude.
    const ids = ['Rstar', 'fp', 'ne', 'fl', 'fi', 'fc', 'L'];
    const params = {};

    for (const id of ids) {
        const slider = document.getElementById(id);
        params[id] = slider ? linearToLog(parseFloat(slider.value), id) : 0;
    }

    return params;
}

export function initGalaxyLegendHandlers() {
    const categories = ['total', 'planets', 'habitable', 'life', 'intelligence', 'tech'];

    const findLegendItem = target => {
        const item = target.closest('.legend-item');
        if (!item) return null;
        const legend = item.closest('.galaxy-sim-legend, #galaxy-sim-legend-fullscreen');
        if (!legend) return null;
        const items = Array.from(legend.querySelectorAll('.legend-item'));
        const index = items.indexOf(item);
        return index === -1 ? null : { item, index };
    };

    document.addEventListener('click', (e) => {
        const found = findLegendItem(e.target);
        if (!found) return;
        toggleGalaxyCategory(categories[found.index]);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const found = findLegendItem(e.target);
        if (!found) return;
        e.preventDefault();
        toggleGalaxyCategory(categories[found.index]);
    });

    document.querySelectorAll('.galaxy-sim-legend .legend-item, #galaxy-sim-legend-fullscreen .legend-item')
        .forEach(item => {
            item.setAttribute('role', 'button');
            item.tabIndex = 0;
        });

    updateLegendUI();
}

export function showMobileFullscreenAlert() {
    const alertMsg = t('mobile_fullscreen_unavailable');

    const existingAlert = document.querySelector('.mobile-fullscreen-alert');
    if (existingAlert) existingAlert.remove();

    const alertEl = document.createElement('div');
    alertEl.className = 'mobile-fullscreen-alert';
    alertEl.setAttribute('role', 'status');
    alertEl.setAttribute('aria-live', 'polite');
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

const AUTO_HIDE_DELAY = 4500;
const AUTO_HIDE_MOVE_THROTTLE = 400;

let _lastAutoHideReset = 0;
let _lastFocusedElement = null;
let _previousBodyOverflow = '';

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

    if (e.key === 'Tab') {
        trapFocus(overlay, e);
        return;
    }

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
        if (!el) return;
        el.value = value;
        updateSliderBackground(el, 0, 90);
    });

    applyCameraView();
}

export function updateGalaxyZoom(value) {
    setCurrentView({ ...currentView, zoom: parseFloat(value) });
    ['galaxy-zoom-value', 'fs-galaxy-zoom-value'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
    ['galaxy-zoom', 'fs-galaxy-zoom'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = value;
        updateSliderBackground(el, 50, 400);
    });

    applyCameraView();
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

    if (starSystem && starSystem.material && starSystem.material.uniforms) {
        starSystem.material.uniforms.uSizeScale.value = currentView.starSize;
    }
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
        if (!el) continue;
        el.value = DEFAULT_VIEW[key];
        const min = parseFloat(el.min);
        const max = parseFloat(el.max);
        updateSliderBackground(el, min, max);
    }

    const labels = {
        rotation: DEFAULT_VIEW.rotationSpeed.toFixed(4),
        tilt: `${DEFAULT_VIEW.tilt}°`,
        zoom: String(DEFAULT_VIEW.zoom),
        'star-size': DEFAULT_VIEW.starSize.toFixed(1)
    };
    for (const [id, text] of Object.entries(labels)) {
        const valEl = document.getElementById(`fs-galaxy-${id}-value`);
        if (valEl) valEl.textContent = text;
    }

    // Undo any spin accumulated by dragging.
    if (starSystem) starSystem.rotation.y = 0;

    applyCameraView();

    if (starSystem && starSystem.material && starSystem.material.uniforms) {
        starSystem.material.uniforms.uSizeScale.value = DEFAULT_VIEW.starSize;
    }
}

const DRAG_ROTATION_PER_PIXEL = 0.006;
const DRAG_TILT_PER_PIXEL = 0.22;
const MIN_ZOOM = 50;
const MAX_ZOOM = 400;
const ZOOM_STEP = 5;

let _dragPointer = null;
let _isDraggingGalaxy = false;

function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

/** Pauses the automatic spin while the user is dragging the galaxy. */
export function isGalaxyDragging() {
    return _isDraggingGalaxy;
}

/**
 * Mouse/pen direct manipulation: horizontal drag spins the disk, vertical
 * drag changes the tilt, and the wheel zooms while in fullscreen. Wheel is
 * deliberately fullscreen-only so it never hijacks page scrolling.
 */
export function initGalaxyPointerControls(canvas) {
    if (!canvas || canvas.dataset.pointerControls === 'ready') return;
    canvas.dataset.pointerControls = 'ready';

    const endDrag = (event) => {
        if (!_dragPointer) return;
        if (event && event.pointerId !== _dragPointer.id) return;

        try {
            if (event && typeof canvas.hasPointerCapture === 'function' &&
                canvas.hasPointerCapture(event.pointerId)) {
                canvas.releasePointerCapture(event.pointerId);
            }
        } catch {
            // Pointer capture can already be gone (e.g. pointercancel).
        }
        _dragPointer = null;
        _isDraggingGalaxy = false;
        canvas.classList.remove('is-dragging');
    };

    canvas.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 || event.pointerType === 'touch') return;

        _dragPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
        _isDraggingGalaxy = true;
        canvas.classList.add('is-dragging');
        try {
            if (typeof canvas.setPointerCapture === 'function') {
                canvas.setPointerCapture(event.pointerId);
            }
        } catch {
            // Synthetic or already-released pointer: dragging still works.
        }
    });

    canvas.addEventListener('pointermove', (event) => {
        if (!_dragPointer || event.pointerId !== _dragPointer.id) return;

        const dx = event.clientX - _dragPointer.x;
        const dy = event.clientY - _dragPointer.y;
        _dragPointer.x = event.clientX;
        _dragPointer.y = event.clientY;

        if (starSystem && dx !== 0) {
            starSystem.rotation.y += dx * DRAG_ROTATION_PER_PIXEL;
        }
        if (dy !== 0) {
            const nextTilt = clampNumber(
                Math.round(currentView.tilt + dy * DRAG_TILT_PER_PIXEL),
                0,
                90
            );
            if (nextTilt !== currentView.tilt) updateGalaxyTilt(nextTilt);
        }
    });

    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('lostpointercapture', () => {
        _dragPointer = null;
        _isDraggingGalaxy = false;
        canvas.classList.remove('is-dragging');
    });

    canvas.addEventListener('wheel', (event) => {
        if (!isGalaxyFullscreen()) return;

        event.preventDefault();

        // Normalise line/page deltas so trackpads and mice feel similar.
        const delta = event.deltaMode === 1
            ? event.deltaY * 16
            : event.deltaMode === 2 ? event.deltaY * 100 : event.deltaY;
        if (delta === 0) return;

        const amount = clampNumber(Math.abs(delta) * 0.08, 1.5, 25);
        const nextZoom = clampNumber(
            Math.round((currentView.zoom - Math.sign(delta) * amount) / ZOOM_STEP) * ZOOM_STEP,
            MIN_ZOOM,
            MAX_ZOOM
        );
        if (nextZoom !== currentView.zoom) updateGalaxyZoom(nextZoom);
    }, { passive: false });
}

let _fullscreenMousemoveHandler = null;
let _fullscreenTouchHandler = null;
let _fullscreenFocusinHandler = null;

/** True when the event target sits on one of the floating control panels. */
function isOverFullscreenPanel(target) {
    return Boolean(target && typeof target.closest === 'function' &&
        target.closest('.fullscreen-sidebar, .fullscreen-right-panel'));
}

export function toggleGalaxyFullscreen() {
    if (window.innerWidth <= 768) {
        const trigger = document.querySelector('.fullscreen-btn-overlay');
        if (trigger) trigger.setAttribute('aria-disabled', 'true');
        showMobileFullscreenAlert();
        return;
    }

    if (!galaxyRenderer) {
        console.error('Galaxy renderer not initialized yet');
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
        _lastFocusedElement = document.activeElement;
        _previousBodyOverflow = document.body.style.overflow;

        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        section.classList.add('fullscreen');
        setFullscreenUIForced(false);
        showFullscreenUI(overlay);

        if (galaxyRenderer && galaxyRenderer.domElement) {
            fullscreenContainer.appendChild(galaxyRenderer.domElement);
        }
        document.dispatchEvent(new CustomEvent('galaxy:fullscreen', { detail: { active: true } }));
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

        _fullscreenMousemoveHandler = (event) => {
            if (fullscreenUIForced) return;

            // Keep the panels open while the pointer rests on them.
            if (isOverFullscreenPanel(event.target)) {
                showFullscreenUI(overlay);
                stopAutoHideTimer();
                return;
            }

            const uiHidden = overlay.classList.contains('ui-hidden') ||
                overlay.classList.contains('ui-hidden-all');
            if (uiHidden) {
                showFullscreenUI(overlay);
                startAutoHideTimer(overlay);
                return;
            }

            // Throttle: mousemove fires dozens of times per second.
            const now = performance.now();
            if (now - _lastAutoHideReset < AUTO_HIDE_MOVE_THROTTLE) return;
            _lastAutoHideReset = now;
            startAutoHideTimer(overlay);
        };
        _fullscreenTouchHandler = () => {
            if (fullscreenUIForced) return;
            resetAutoHideTimer(overlay);
        };
        _fullscreenFocusinHandler = (event) => {
            if (fullscreenUIForced) return;
            if (event.target === overlay) return;
            if (event.target && typeof event.target.closest === 'function' &&
                event.target.closest('#galaxy-fullscreen-overlay')) {
                showFullscreenUI(overlay);
                stopAutoHideTimer();
            }
        };
        document.addEventListener('mousemove', _fullscreenMousemoveHandler);
        document.addEventListener('touchstart', _fullscreenTouchHandler);
        document.addEventListener('focusin', _fullscreenFocusinHandler);

        startAutoHideTimer(overlay);
        overlay.focus({ preventScroll: true });

        setTimeout(() => {
            onGalaxyResize();
            if (galaxyRenderer) galaxyRenderer.render(galaxyScene, galaxyCamera);
        }, 50);
    } else {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.classList.remove('ui-hidden');
        overlay.classList.remove('ui-hidden-all');
        section.classList.remove('fullscreen');
        document.body.style.overflow = _previousBodyOverflow;
        _previousBodyOverflow = '';
        setFullscreenUIForced(false);
        stopAutoHideTimer();

        if (galaxyRenderer && galaxyRenderer.domElement) {
            normalContainer.appendChild(galaxyRenderer.domElement);
        }
        document.dispatchEvent(new CustomEvent('galaxy:fullscreen', { detail: { active: false } }));

        if (_fullscreenMousemoveHandler) {
            document.removeEventListener('mousemove', _fullscreenMousemoveHandler);
            _fullscreenMousemoveHandler = null;
        }
        if (_fullscreenTouchHandler) {
            document.removeEventListener('touchstart', _fullscreenTouchHandler);
            _fullscreenTouchHandler = null;
        }
        if (_fullscreenFocusinHandler) {
            document.removeEventListener('focusin', _fullscreenFocusinHandler);
            _fullscreenFocusinHandler = null;
        }

        const focusTarget = _lastFocusedElement instanceof HTMLElement &&
            _lastFocusedElement !== document.body &&
            document.contains(_lastFocusedElement)
            ? _lastFocusedElement
            : fullscreenBtn;
        if (focusTarget) focusTarget.focus({ preventScroll: true });
        _lastFocusedElement = null;

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

    // Mirror the preset already chosen in the main form.
    const activeMainPreset = document.querySelector('.parameters-panel .preset-btn.active-preset');
    if (activeMainPreset) {
        const presetName = activeMainPreset.getAttribute('data-preset');
        const activeFullscreenBtn = presetsSection.querySelector(`.preset-btn[data-preset="${presetName}"]`);
        if (activeFullscreenBtn) activeFullscreenBtn.classList.add('active-preset');
    }

    const params = ['Rstar', 'fp', 'ne', 'fl', 'fi', 'fc', 'L'];

    params.forEach(paramId => {
        const input = document.getElementById(paramId);
        if (!input) return;

        // Reuse the main form label so both panels always show identical text.
        const mainLabel = document.querySelector(`#drake-form label[for="${paramId}"]`);
        const labelContent = mainLabel ? mainLabel.innerHTML : t(`labels.${paramId}`);
        const valueDisplay = document.getElementById(paramId + '-value');
        const value = valueDisplay ? valueDisplay.textContent : input.value;

        const item = document.createElement('div');
        item.className = 'fullscreen-param-item';
        item.innerHTML = `
            <label for="fs-${paramId}">${labelContent}<span class="fullscreen-param-value" id="fs-${paramId}-value">${value}</span></label>
            <input type="range" id="fs-${paramId}" min="${input.min}" max="${input.max}" step="${input.step}" value="${input.value}" data-action="fs-param" data-param-id="${paramId}">
        `;
        container.appendChild(item);
        updateRangeFill(item.querySelector('input[type="range"]'));
    });
}

export function applyPresetFromFullscreen(preset) {
    const originalBtn = document.querySelector(`.parameters-panel .preset-btn[data-preset="${preset}"]`);
    if (!originalBtn) return;

    originalBtn.click();
    document.querySelectorAll('.fullscreen-presets-grid .preset-btn').forEach(btn => btn.classList.remove('active-preset'));
    const activeFullscreenBtn = document.querySelector(`.fullscreen-presets-grid .preset-btn[data-preset="${preset}"]`);
    if (activeFullscreenBtn) activeFullscreenBtn.classList.add('active-preset');
}

export function updateParamFromFullscreen(paramId, value) {
    const originalInput = document.getElementById(paramId);
    const originalValue = document.getElementById(paramId + '-value');
    const fsInput = document.getElementById('fs-' + paramId);
    const fsValue = document.getElementById('fs-' + paramId + '-value');

    if (originalInput) {
        originalInput.value = value;
        originalInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // The main form formats the value (log scale, thousands separators).
    if (originalValue && fsValue) fsValue.textContent = originalValue.textContent;
    if (fsInput) updateRangeFill(fsInput);

    document.querySelectorAll('.fullscreen-presets-grid .preset-btn').forEach(btn => btn.classList.remove('active-preset'));
    document.querySelectorAll('.parameters-panel .preset-btn').forEach(btn => btn.classList.remove('active-preset'));

    updateFullscreenN();
}

// Keep the fullscreen sliders in step once the main form finishes a preset.
document.addEventListener('drake:preset-applied', () => {
    if (!isGalaxyFullscreen()) return;
    syncFullscreenValues();
    syncFullscreenVizControls();
});

export function syncFullscreenValues() {
    const params = ['Rstar', 'fp', 'ne', 'fl', 'fi', 'fc', 'L'];
    params.forEach(paramId => {
        const originalInput = document.getElementById(paramId);
        const originalValue = document.getElementById(paramId + '-value');
        const fsInput = document.getElementById('fs-' + paramId);
        const fsValue = document.getElementById('fs-' + paramId + '-value');

        if (originalInput && fsInput) fsInput.value = originalInput.value;
        if (originalValue && fsValue) fsValue.textContent = originalValue.textContent;
        if (fsInput) updateRangeFill(fsInput);
    });
    updateFullscreenN();
}

export function updateFullscreenN() {
    const resultEl = document.getElementById('result');
    const fsResultEl = document.getElementById('fullscreen-n-value');

    if (resultEl && fsResultEl) {
        fsResultEl.textContent = resultEl.textContent;
    }
}

export function syncFullscreenVizControls() {
    const keys = [
        { el: 'fs-galaxy-rotation', key: 'rotationSpeed', suffix: 'rotation' },
        { el: 'fs-galaxy-tilt', key: 'tilt', suffix: 'tilt' },
        { el: 'fs-galaxy-zoom', key: 'zoom', suffix: 'zoom' },
        { el: 'fs-galaxy-star-size', key: 'starSize', suffix: 'star-size' }
    ];
    const format = {
        rotation: value => parseFloat(value).toFixed(4),
        tilt: value => `${value}°`,
        zoom: value => String(value),
        'star-size': value => parseFloat(value).toFixed(1)
    };

    keys.forEach(({ el: elId, key, suffix }) => {
        const el = document.getElementById(elId);
        const valEl = document.getElementById(`fs-galaxy-${suffix}-value`);
        if (el) {
            el.value = currentView[key];
            updateSliderBackground(el, parseFloat(el.min), parseFloat(el.max));
        }
        if (valEl) valEl.textContent = format[suffix](currentView[key]);
    });
}
