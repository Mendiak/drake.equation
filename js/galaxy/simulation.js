import * as THREE from 'three';
import {
    currentView, galaxyScene, galaxyCamera, galaxyRenderer,
    starSystem, lastFrameTime, lastBlinkTime,
    communicativeBlinkState, BLINK_INTERVAL,
    setGalaxyScene, setGalaxyCamera, setGalaxyRenderer,
    setLastFrameTime, setLastBlinkTime, setCommunicativeBlinkState
} from './state.js';
import {
    createStarTexture, createGlowTexture,
    createStarField, createStarClusters, onGalaxyResize
} from './scene.js';
import {
    updateGalaxySimulation,
    updateLegendUI, getCurrentDrakeParams, initGalaxyLegendHandlers,
    updateGalaxyRotation, updateGalaxyTilt, updateGalaxyZoom,
    updateGalaxyStarSize, resetGalaxyView, toggleGalaxyFullscreen,
    populateFullscreenParams, applyPresetFromFullscreen,
    updateParamFromFullscreen, syncFullscreenValues,
    handleFullscreenKeydown, isGalaxyFullscreen,
    blinkTechStars
} from './interaction.js';

function initGalaxySimulation() {
    const container = document.getElementById('galaxy-simulation-container');
    if (!container || container.clientHeight === 0 || container.clientWidth === 0) {
        setTimeout(initGalaxySimulation, 100);
        return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    setGalaxyScene(scene);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1500);
    camera.position.z = 200;
    camera.position.y = 80;
    camera.position.x = 0;
    camera.lookAt(0, 0, 0);
    setGalaxyCamera(camera);

    try {
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        setGalaxyRenderer(renderer);
    } catch (error) {
        console.warn('WebGL not supported:', error);
        container.innerHTML = '<div class="webgl-error" style="display:flex;align-items:center;justify-content:center;height:100%;text-align:center;padding:20px;color:#fff;">' +
            '<div><strong>WebGL not available</strong><br>' +
            'The galaxy simulation requires WebGL. Please ensure your browser supports WebGL and hardware acceleration is enabled.</div></div>';
        return;
    }

    const sprite = createStarTexture();
    const glowSprite = createGlowTexture();
    createStarField(sprite, glowSprite);
    createStarClusters(sprite);

    animateGalaxyWithRotation();

    const params = getCurrentDrakeParams();
    updateGalaxySimulation(params);

    const fullscreenBtn = document.querySelector('.fullscreen-btn-overlay');
    if (fullscreenBtn) {
        fullscreenBtn.disabled = false;
        fullscreenBtn.style.opacity = '0.7';
        fullscreenBtn.style.cursor = 'pointer';
    }

    updateLegendUI();

    window.addEventListener('resize', onGalaxyResize);
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            const section = document.querySelector('.galaxy-sim-section');
            if (section) section.classList.remove('fullscreen');
        }
        setTimeout(() => onGalaxyResize(), 100);
    });
}

function animateGalaxyWithRotation() {
    requestAnimationFrame(animateGalaxyWithRotation);

    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;
    setLastFrameTime(currentTime);

    if (deltaTime < 8) return;

    if (starSystem) {
        starSystem.rotation.y += currentView.rotationSpeed * (deltaTime / 16.67);

        if (currentTime - lastBlinkTime > BLINK_INTERVAL) {
            setCommunicativeBlinkState(!communicativeBlinkState);
            setLastBlinkTime(currentTime);
            blinkTechStars();
        }
    }
    galaxyRenderer.render(galaxyScene, galaxyCamera);
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
