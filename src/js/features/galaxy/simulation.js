import * as THREE from 'three';
import {
    currentView, galaxyScene, galaxyCamera, galaxyRenderer,
    starSystem, lastFrameTime, lastBlinkTime,
    communicativeBlinkState, BLINK_INTERVAL, renderScale,
    setGalaxyScene, setGalaxyCamera, setGalaxyRenderer, setRenderScale,
    setLastFrameTime, setLastBlinkTime, setCommunicativeBlinkState
} from './state.js';
import { createStarField, onGalaxyResize } from './scene.js';
import {
    updateGalaxySimulation,
    updateLegendUI, getCurrentDrakeParams, initGalaxyLegendHandlers,
    updateGalaxyRotation, updateGalaxyTilt, updateGalaxyZoom,
    updateGalaxyStarSize, resetGalaxyView, toggleGalaxyFullscreen,
    populateFullscreenParams, applyPresetFromFullscreen,
    updateParamFromFullscreen, syncFullscreenValues,
    handleFullscreenKeydown, isGalaxyFullscreen,
    blinkTechStars, initGalaxyPointerControls, isGalaxyDragging
} from './interaction.js';

const motionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

let loopRunning = false;
let sectionVisible = false;
let fullscreenActive = false;
let twinkleTime = 0;

let perfFrames = 0;
let perfElapsed = 0;
let perfDowngrades = 0;

function syncGalaxyLoop() {
    const shouldRun = (sectionVisible || fullscreenActive) && !document.hidden;

    if (shouldRun && !loopRunning) {
        loopRunning = true;
        setLastFrameTime(performance.now());
        requestAnimationFrame(animateGalaxy);
    } else if (!shouldRun) {
        loopRunning = false;
    }
}

function observeVisibility() {
    const section = document.querySelector('.galaxy-sim-section');
    if (section && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => { sectionVisible = entry.isIntersecting; });
            syncGalaxyLoop();
        }, { rootMargin: '120px' });
        observer.observe(section);
    } else {
        sectionVisible = true;
        syncGalaxyLoop();
    }

    document.addEventListener('visibilitychange', syncGalaxyLoop);
    document.addEventListener('galaxy:fullscreen', event => {
        fullscreenActive = Boolean(event.detail && event.detail.active);
        syncGalaxyLoop();
    });
}

/**
 * Drops the render resolution when frames are consistently slow. Stars are
 * soft points, so a lower resolution is far less noticeable than fewer stars.
 */
function trackPerformance(rawDelta) {
    perfElapsed += rawDelta;
    perfFrames += 1;

    if (perfFrames < 90) return;

    const averageDelta = perfElapsed / perfFrames;
    if (averageDelta > 28 && renderScale > 0.66 && perfDowngrades < 2) {
        setRenderScale(Math.max(0.66, renderScale * 0.8));
        perfDowngrades += 1;
        onGalaxyResize();
    }

    perfFrames = 0;
    perfElapsed = 0;
}

function animateGalaxy() {
    if (!loopRunning) return;
    requestAnimationFrame(animateGalaxy);

    const now = performance.now();
    const rawDelta = now - lastFrameTime;
    setLastFrameTime(now);

    // Ignore the gap left by tab switches or by a paused loop.
    if (rawDelta > 200) return;

    trackPerformance(rawDelta);

    const reduceMotion = motionQuery ? motionQuery.matches : false;

    // Animation cost cap: ~120 fps normally, ~20 fps for reduced motion.
    if (reduceMotion ? rawDelta < 50 : rawDelta < 8) return;

    const delta = Math.max(8, rawDelta);

    if (starSystem) {
        if (!reduceMotion) {
            // Keep the disk still under the cursor while the user drags it.
            if (!isGalaxyDragging()) {
                starSystem.rotation.y += currentView.rotationSpeed * (delta / 16.67);
            }

            twinkleTime += delta * 0.001;
            const uniforms = starSystem.material && starSystem.material.uniforms;
            if (uniforms && uniforms.uTime) uniforms.uTime.value = twinkleTime;

            if (now - lastBlinkTime > BLINK_INTERVAL) {
                setCommunicativeBlinkState(!communicativeBlinkState);
                setLastBlinkTime(now);
                blinkTechStars();
            }
        }
    }

    galaxyRenderer.render(galaxyScene, galaxyCamera);
}

function initGalaxySimulation(attempt = 0) {
    const container = document.getElementById('galaxy-simulation-container');
    if (!container || container.clientHeight === 0 || container.clientWidth === 0) {
        if (attempt < 100) setTimeout(() => initGalaxySimulation(attempt + 1), 100);
        return;
    }

    const scene = new THREE.Scene();
    setGalaxyScene(scene);

    const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        2000
    );
    camera.position.set(0, 120, 200);
    camera.lookAt(0, 0, 0);
    setGalaxyCamera(camera);

    try {
        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance'
        });
        container.appendChild(renderer.domElement);
        setGalaxyRenderer(renderer);
        initGalaxyPointerControls(renderer.domElement);
    } catch (error) {
        console.warn('WebGL not supported:', error);
        container.innerHTML = '<div class="webgl-error" style="display:flex;align-items:center;justify-content:center;height:100%;text-align:center;padding:20px;color:#fff;">' +
            '<div><strong>WebGL not available</strong><br>' +
            'The galaxy simulation requires WebGL. Please ensure your browser supports WebGL and hardware acceleration is enabled.</div></div>';
        return;
    }

    createStarField();
    onGalaxyResize();

    const params = getCurrentDrakeParams();
    updateGalaxySimulation(params);

    const fullscreenBtn = document.querySelector('.fullscreen-btn-overlay');
    if (fullscreenBtn) {
        fullscreenBtn.disabled = false;
        fullscreenBtn.style.opacity = '1';
        fullscreenBtn.style.cursor = 'pointer';
        if (window.innerWidth <= 768) {
            fullscreenBtn.setAttribute('aria-disabled', 'true');
        } else {
            fullscreenBtn.removeAttribute('aria-disabled');
        }
    }

    updateLegendUI();
    observeVisibility();

    window.addEventListener('resize', onGalaxyResize);
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            const section = document.querySelector('.galaxy-sim-section');
            if (section) section.classList.remove('fullscreen');
        }
        setTimeout(() => onGalaxyResize(), 100);
    });
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
    initGalaxyLegendHandlers,
    handleFullscreenKeydown,
    isGalaxyFullscreen
};
