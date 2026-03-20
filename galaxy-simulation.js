// Galactic Simulation using Three.js
// Visualizes the Drake Equation steps across a simulated Milky Way-like spiral galaxy

let galaxyScene, galaxyCamera, galaxyRenderer, starSystem, galaxyControls;
let galaxyRendererFS; // Separate renderer for fullscreen
const STAR_COUNT = 80000; // Increased star count for denser, more realistic galaxy

// Default view settings
const DEFAULT_VIEW = {
    rotationSpeed: 0.001,
    tilt: 45,
    zoom: 200,
    starSize: 1.2
};

let currentView = { ...DEFAULT_VIEW };

// Colors for each stage following minimalist aesthetic
const COLORS = {
    total: 0xffffff,      // White: Total stars
    planets: 0xf39c12,    // Orange: With planets
    habitable: 0x3498db,  // Blue: Habitable
    life: 0x2ecc71,       // Green: With life
    intelligence: 0x9b59b6, // Purple: Intelligent
    tech: 0xe74c3c        // Red: Communicative (N)
};

// Milky Way-like barred spiral galaxy parameters - Enhanced spiral effect with natural randomness
const GALAXY_PARAMS = {
    spiralArms: 4,              // Number of spiral arms (Milky Way has 4 major arms)
    armTightness: 0.45,         // Logarithmic spiral tightness (higher = more open/winding arms)
    diskRadius: 120,            // Radius of the galactic disk (light years scale)
    coreRadius: 18,             // Radius of the galactic core/bulge
    barLength: 30,              // Length of central bar (Milky Way has ~27k ly bar)
    barWidth: 8,                // Width of central bar (narrower = more defined)
    diskThickness: 6,           // Thin disk thickness at edge (thinner = more realistic)
    thickDisk: 18,              // Thick disk component
    coreThickness: 25,          // Thickness at core/bulge
    armSpread: 8,               // Spread of stars within arms (balanced for defined but natural arms)
    armDensity: 0.78,           // Fraction of stars in arms (higher = more stars in spiral arms)
    rotationSpeed: 0.0006,      // Rotation speed
    randomScatter: 0.15,        // Random scatter factor for natural appearance
    armCurvature: 3.5           // Spiral arm curvature multiplier (higher = more curved)
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

    galaxyRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    galaxyRenderer.setSize(width, height);
    galaxyRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(galaxyRenderer.domElement);

    createStarField();
    animateGalaxy();

    window.addEventListener('resize', onGalaxyResize);
}

function createStarField() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
        const starData = generateSpiralGalaxyPosition();
        
        positions[i * 3] = starData.x;
        positions[i * 3 + 1] = starData.y;
        positions[i * 3 + 2] = starData.z;

        // Stellar population colors based on location (realistic Milky Way)
        const starColor = getStellarPopulationColor(starData.population);
        colors[i * 3] = starColor.r;
        colors[i * 3 + 1] = starColor.g;
        colors[i * 3 + 2] = starColor.b;

        // Vary star sizes for more natural look
        sizes[i] = Math.random() * 1.5 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create circular sprite texture for stars
    const sprite = createStarTexture();

    const material = new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
        map: sprite,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    starSystem = new THREE.Points(geometry, material);
    galaxyScene.add(starSystem);
}

// Stellar population colors - realistic Milky Way star types
function getStellarPopulationColor(population) {
    const color = new THREE.Color();
    
    switch(population) {
        case 'core':
            // Old population II stars - yellowish/red
            color.setHSL(0.1 + Math.random() * 0.05, 0.6, 0.7 + Math.random() * 0.2);
            break;
        case 'bar':
            // Mixed population in bar - yellow/white
            color.setHSL(0.12 + Math.random() * 0.08, 0.4, 0.75 + Math.random() * 0.15);
            break;
        case 'thickDisk':
            // Older disk stars - yellowish
            color.setHSL(0.13 + Math.random() * 0.07, 0.5, 0.7 + Math.random() * 0.15);
            break;
        case 'spiralArm':
            // Young population I stars - blue/white (active star formation)
            color.setHSL(0.55 + Math.random() * 0.15, 0.7, 0.8 + Math.random() * 0.2);
            break;
        default:
            // Scattered disk - white/yellow mix
            color.setHSL(0.1 + Math.random() * 0.15, 0.3, 0.75 + Math.random() * 0.2);
    }
    
    return color;
}

function generateSpiralGalaxyPosition() {
    const rand = Math.random();

    // Determine stellar population: core/bulge, bar, thin disk, thick disk, or spiral arms
    const inCore = rand < 0.10;        // 10% in central bulge
    const inBar = rand < 0.18;         // 8% in central bar (Milky Way is barred!)
    const inThickDisk = rand < 0.28;   // 10% in thick disk (older stars)
    const inSpiralArm = rand < 0.75;   // 47% in spiral arms (density wave)
    // Remaining 25% are scattered disk stars (more for natural look)

    if (inCore) {
        // Dense spherical bulge with older stellar population
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 0.5) * GALAXY_PARAMS.coreRadius;
        const verticalSpread = Math.random() * GALAXY_PARAMS.coreThickness;

        return {
            x: Math.cos(angle) * radius,
            y: (Math.random() - 0.5) * verticalSpread,
            z: Math.sin(angle) * radius,
            population: 'core'
        };
    }

    if (inBar) {
        // Central bar structure (Milky Way has a ~27k light-year bar)
        const barX = (Math.random() - 0.5) * GALAXY_PARAMS.barLength;
        const barZ = (Math.random() - 0.5) * GALAXY_PARAMS.barWidth;
        const barY = (Math.random() - 0.5) * GALAXY_PARAMS.coreThickness * 0.5;

        // Rotate bar slightly for realism
        const barAngle = 0.3; // ~17 degree tilt
        const x = barX * Math.cos(barAngle) - barZ * Math.sin(barAngle);
        const z = barX * Math.sin(barAngle) + barZ * Math.cos(barAngle);

        return { x, y: barY, z, population: 'bar' };
    }

    if (inThickDisk) {
        // Thick disk - older stellar population, larger vertical dispersion
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 0.6) * GALAXY_PARAMS.diskRadius * 0.7;
        const thickness = GALAXY_PARAMS.thickDisk * (1 - radius / GALAXY_PARAMS.diskRadius * 0.4);

        return {
            x: Math.cos(angle) * radius,
            y: (Math.random() - 0.5) * thickness,
            z: Math.sin(angle) * radius,
            population: 'thickDisk'
        };
    }

    // Thin disk with logarithmic spiral arms
    const armIndex = Math.floor(Math.random() * GALAXY_PARAMS.spiralArms);
    const baseAngle = (armIndex / GALAXY_PARAMS.spiralArms) * Math.PI * 2;

    // IRREGULAR radius distribution - not uniform, with clumps and gaps
    // Mix different distribution methods for natural variation
    const radiusRandom = Math.random();
    let radiusNorm;
    
    // 60% follow main distribution, 25% pushed inward, 15% pushed outward (stragglers)
    const distributionType = Math.random();
    if (distributionType < 0.60) {
        // Main spiral arm population
        radiusNorm = Math.pow(radiusRandom, 0.65);
    } else if (distributionType < 0.85) {
        // Inner concentration (creates density variations)
        radiusNorm = Math.pow(radiusRandom, 0.8) * 0.7;
    } else {
        // Outer stragglers (stars beyond main arm structure)
        radiusNorm = Math.pow(radiusRandom, 0.5) * 0.9 + 0.1;
    }
    
    const radius = radiusNorm * GALAXY_PARAMS.diskRadius;

    // LOGARITHMIC SPIRAL: angle increases logarithmically with radius
    // This creates the characteristic spiral arm shape
    const spiralAngle = baseAngle + Math.log(radius + 1) * GALAXY_PARAMS.armTightness * GALAXY_PARAMS.armCurvature;

    // IRREGULAR arm width - varies along the spiral for natural appearance
    // Add Perlin-like noise using multiple sine waves
    const armWidthVariation = 1 + 
        0.3 * Math.sin(armIndex * 2.1 + radius * 0.05) + 
        0.2 * Math.cos(armIndex * 1.7 + radius * 0.08) +
        0.15 * Math.sin(radius * 0.12 - armIndex);
    
    // Density wave: stars cluster near the arm centerline
    // Increase spread toward outer edges for natural flare
    const outerFlare = 1 + (radius / GALAXY_PARAMS.diskRadius) * 0.6;
    const armOffset = (Math.random() - 0.5) * GALAXY_PARAMS.armSpread * Math.sqrt(radius) * outerFlare * armWidthVariation;

    // Thickness: thin disk gets thinner toward edges
    const thicknessFactor = Math.max(0.4, 1 - (radius / GALAXY_PARAMS.diskRadius) * 0.5);
    const thickness = GALAXY_PARAMS.diskThickness * thicknessFactor;

    // IRREGULAR scatter - not uniform, creates clumpy appearance
    const baseScatter = 4 + (radius / GALAXY_PARAMS.diskRadius) * 6;
    // Add variation to scatter using pseudo-noise
    const scatterVariation = 1 + 
        0.4 * Math.sin(radius * 0.08 + armIndex * 1.5) +
        0.3 * Math.cos(radius * 0.15 - armIndex * 0.8);
    const scatter = (Math.random() - 0.5) * baseScatter * scatterVariation;
    
    // Angular scatter for softer arm edges (increases toward outer regions)
    // Add irregularity to make arm edges wavy
    const baseAngularScatter = 0.2 * (radius / GALAXY_PARAMS.diskRadius);
    const angularVariation = 1 + 0.3 * Math.sin(radius * 0.06 + armIndex);
    const angularScatter = (Math.random() - 0.5) * baseAngularScatter * angularVariation;
    
    // IRREGULAR spiral arm angle - add waviness to the arm structure itself
    const armWaviness = 0.08 * Math.sin(radius * 0.04 + armIndex * 0.5) +
                        0.05 * Math.cos(radius * 0.07 - armIndex * 0.3);
    
    // Small chance for stars to be significantly off the main arm (inter-arm stars)
    const interArmOffset = Math.random() < 0.15 ? (Math.random() - 0.5) * 25 : 0;

    const effectiveRadius = radius + armOffset + scatter + interArmOffset;
    const finalAngle = spiralAngle + angularScatter + armWaviness;
    
    const x = Math.cos(finalAngle) * effectiveRadius;
    const y = (Math.random() - 0.5) * thickness;
    const z = Math.sin(finalAngle) * effectiveRadius;

    return { x, y, z, population: 'spiralArm' };
}

function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Create radial gradient for soft circular star
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

function updateGalaxySimulation(params) {
    if (!starSystem) return;

    const colors = starSystem.geometry.attributes.color.array;
    
    // Calculate thresholds based on Drake Equation steps
    const fpThreshold = STAR_COUNT * params.fp;
    const neThreshold = fpThreshold * (params.ne / 10); // Normalizing ne (max 10)
    const flThreshold = neThreshold * params.fl;
    const fiThreshold = flThreshold * params.fi;
    const fcThreshold = fiThreshold * params.fc;

    for (let i = 0; i < STAR_COUNT; i++) {
        let colorHex = COLORS.total;

        if (i < fcThreshold) colorHex = COLORS.tech;
        else if (i < fiThreshold) colorHex = COLORS.intelligence;
        else if (i < flThreshold) colorHex = COLORS.life;
        else if (i < neThreshold) colorHex = COLORS.habitable;
        else if (i < fpThreshold) colorHex = COLORS.planets;

        const color = new THREE.Color(colorHex);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    starSystem.geometry.attributes.color.needsUpdate = true;
}

function animateGalaxy() {
    requestAnimationFrame(animateGalaxy);
    if (starSystem) {
        starSystem.rotation.y += 0.001;
    }
    galaxyRenderer.render(galaxyScene, galaxyCamera);
}

function onGalaxyResize() {
    const normalContainer = document.getElementById('galaxy-simulation-container');
    const fullscreenContainer = document.getElementById('galaxy-simulation-container-fullscreen');
    const overlay = document.getElementById('galaxy-fullscreen-overlay');
    
    // Determine which container to use based on fullscreen state
    const isFullscreen = overlay && overlay.classList.contains('active');
    const container = isFullscreen && fullscreenContainer ? fullscreenContainer : normalContainer;
    
    if (!container || container.clientHeight === 0 || container.clientWidth === 0) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;

    galaxyCamera.aspect = width / height;
    galaxyCamera.updateProjectionMatrix();
    galaxyRenderer.setSize(width, height);
}

// Control functions for galaxy visualization
function updateGalaxyRotation(value) {
    currentView.rotationSpeed = parseFloat(value);
    document.getElementById('galaxy-rotation-value').textContent = value;
}

function updateGalaxyTilt(value) {
    currentView.tilt = parseFloat(value);
    document.getElementById('galaxy-tilt-value').textContent = value + '°';
    
    // Convert tilt to camera position
    const tiltRad = (value * Math.PI) / 180;
    const distance = currentView.zoom;
    
    galaxyCamera.position.y = Math.sin(tiltRad) * distance * 0.5;
    galaxyCamera.position.z = Math.cos(tiltRad) * distance;
    galaxyCamera.lookAt(0, 0, 0);
}

function updateGalaxyZoom(value) {
    currentView.zoom = parseFloat(value);
    document.getElementById('galaxy-zoom-value').textContent = value;
    
    const tiltRad = (currentView.tilt * Math.PI) / 180;
    galaxyCamera.position.y = Math.sin(tiltRad) * currentView.zoom * 0.5;
    galaxyCamera.position.z = Math.cos(tiltRad) * currentView.zoom;
    galaxyCamera.lookAt(0, 0, 0);
}

function updateGalaxyStarSize(value) {
    currentView.starSize = parseFloat(value);
    document.getElementById('galaxy-star-size-value').textContent = value;
    
    if (starSystem) {
        starSystem.material.size = currentView.starSize;
    }
}

function resetGalaxyView() {
    currentView = { ...DEFAULT_VIEW };
    
    // Reset sliders
    document.getElementById('galaxy-rotation-speed').value = DEFAULT_VIEW.rotationSpeed;
    document.getElementById('galaxy-tilt').value = DEFAULT_VIEW.tilt;
    document.getElementById('galaxy-zoom').value = DEFAULT_VIEW.zoom;
    document.getElementById('galaxy-star-size').value = DEFAULT_VIEW.starSize;
    
    // Update display values
    document.getElementById('galaxy-rotation-value').textContent = DEFAULT_VIEW.rotationSpeed;
    document.getElementById('galaxy-tilt-value').textContent = DEFAULT_VIEW.tilt + '°';
    document.getElementById('galaxy-zoom-value').textContent = DEFAULT_VIEW.zoom;
    document.getElementById('galaxy-star-size-value').textContent = DEFAULT_VIEW.starSize;
    
    // Reset camera position
    const tiltRad = (DEFAULT_VIEW.tilt * Math.PI) / 180;
    galaxyCamera.position.y = Math.sin(tiltRad) * DEFAULT_VIEW.zoom * 0.5;
    galaxyCamera.position.z = Math.cos(tiltRad) * DEFAULT_VIEW.zoom;
    galaxyCamera.position.x = 0;
    galaxyCamera.lookAt(0, 0, 0);
    
    // Reset star size
    if (starSystem) {
        starSystem.material.size = DEFAULT_VIEW.starSize;
    }
}

// Override animateGalaxy to use dynamic rotation speed
const originalAnimateGalaxy = animateGalaxy;
animateGalaxy = function() {
    requestAnimationFrame(animateGalaxy);
    if (starSystem) {
        starSystem.rotation.y += currentView.rotationSpeed;
    }
    galaxyRenderer.render(galaxyScene, galaxyCamera);
};

// Fullscreen functionality
function toggleGalaxyFullscreen() {
    const overlay = document.getElementById('galaxy-fullscreen-overlay');
    const section = document.querySelector('.galaxy-sim-section');
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    const icon = fullscreenBtn ? fullscreenBtn.querySelector('i') : null;
    const normalContainer = document.getElementById('galaxy-simulation-container');
    const fullscreenContainer = document.getElementById('galaxy-simulation-container-fullscreen');

    if (!overlay || !normalContainer || !fullscreenContainer) return;

    // Toggle active class on overlay
    overlay.classList.toggle('active');

    if (overlay.classList.contains('active')) {
        // Entering fullscreen
        section.classList.add('fullscreen');
        
        // Move canvas to fullscreen container
        const canvas = galaxyRenderer.domElement;
        fullscreenContainer.appendChild(canvas);
        
        populateFullscreenParams();
        syncFullscreenValues();
        syncFullscreenVizControls();
        if (icon) {
            icon.classList.remove('bi-arrows-fullscreen');
            icon.classList.add('bi-fullscreen-exit');
        }
        // Force resize after overlay is visible
        setTimeout(() => {
            onGalaxyResize();
        }, 100);
    } else {
        // Exiting fullscreen
        section.classList.remove('fullscreen');
        
        // Move canvas back to normal container
        const canvas = galaxyRenderer.domElement;
        normalContainer.appendChild(canvas);
        
        if (icon) {
            icon.classList.remove('bi-fullscreen-exit');
            icon.classList.add('bi-arrows-fullscreen');
        }
    }
}

// Populate fullscreen sidebar with Drake equation parameters
function populateFullscreenParams() {
    const container = document.getElementById('fullscreen-params');
    if (!container) return;
    
    // Add presets section
    const presetsSection = document.createElement('div');
    presetsSection.className = 'fullscreen-presets-section';
    presetsSection.innerHTML = `
        <h4 class="presets-title">Presets</h4>
        <div class="presets-legend">Optimistic ← → Pessimistic</div>
        <div class="fullscreen-presets-grid">
            <button class="preset-btn" onclick="applyPresetFromFullscreen('optimistic')">Optimistic</button>
            <button class="preset-btn" onclick="applyPresetFromFullscreen('sagan')">Sagan</button>
            <button class="preset-btn" onclick="applyPresetFromFullscreen('drake')">Drake</button>
            <button class="preset-btn" onclick="applyPresetFromFullscreen('scientific')">Modern</button>
            <button class="preset-btn" onclick="applyPresetFromFullscreen('rare_earth')">Rare Earth</button>
            <button class="preset-btn" onclick="applyPresetFromFullscreen('pessimistic')">Pessimistic</button>
        </div>
    `;
    container.appendChild(presetsSection);
    
    const params = [
        { id: 'Rstar', label: 'Star formation rate (R*)' },
        { id: 'fp', label: 'Fraction with planets (f<sub>p</sub>)' },
        { id: 'ne', label: 'Habitable planets (n<sub>e</sub>)' },
        { id: 'fl', label: 'Fraction with life (f<sub>l</sub>)' },
        { id: 'fi', label: 'Fraction with intelligence (f<sub>i</sub>)' },
        { id: 'fc', label: 'Fraction with technology (f<sub>c</sub>)' },
        { id: 'L', label: 'Civilization lifetime (L)' }
    ];
    
    params.forEach(param => {
        const input = document.getElementById(param.id);
        if (!input) return;
        
        const valueDisplay = document.getElementById(param.id + '-value');
        const value = valueDisplay ? valueDisplay.textContent : input.value;
        
        const item = document.createElement('div');
        item.className = 'fullscreen-param-item';
        item.innerHTML = `
            <label>${param.label}</label>
            <input type="range" id="fs-${param.id}" min="${input.min}" max="${input.max}" step="${input.step}" value="${input.value}" 
                   oninput="updateParamFromFullscreen('${param.id}', this.value)">
            <span class="fullscreen-param-value" id="fs-${param.id}-value">${value}</span>
        `;
        container.appendChild(item);
    });
}

// Apply preset from fullscreen
function applyPresetFromFullscreen(preset) {
    // Find and click the original preset button
    const originalBtn = document.querySelector(`.preset-btn[data-preset="${preset}"]`);
    if (originalBtn) {
        originalBtn.click();
        // Update fullscreen values after preset is applied
        setTimeout(() => {
            syncFullscreenValues();
        }, 50);
    }
}

// Update parameter from fullscreen sidebar
function updateParamFromFullscreen(paramId, value) {
    const originalInput = document.getElementById(paramId);
    const originalValue = document.getElementById(paramId + '-value');
    const fsValue = document.getElementById('fs-' + paramId + '-value');
    
    if (originalInput) {
        originalInput.value = value;
        // Trigger the input event to recalculate
        originalInput.dispatchEvent(new Event('input'));
    }
    
    if (originalValue) {
        originalValue.textContent = value;
    }
    
    if (fsValue) {
        fsValue.textContent = value;
    }
    
    // Update fullscreen N value
    updateFullscreenN();
}

// Sync fullscreen values with main form
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

// Update fullscreen N value
function updateFullscreenN() {
    const resultEl = document.getElementById('result');
    const fsResultEl = document.getElementById('fullscreen-n-value');
    
    if (resultEl && fsResultEl) {
        fsResultEl.textContent = resultEl.textContent;
    }
}

// Sync viz controls in fullscreen
function syncFullscreenVizControls() {
    const mappings = [
        { original: 'galaxy-rotation-speed', fs: 'fs-galaxy-rotation', display: 'fs-galaxy-rotation-value' },
        { original: 'galaxy-tilt', fs: 'fs-galaxy-tilt', display: 'fs-galaxy-tilt-value' },
        { original: 'galaxy-zoom', fs: 'fs-galaxy-zoom', display: 'fs-galaxy-zoom-value' },
        { original: 'galaxy-star-size', fs: 'fs-galaxy-star-size', display: 'fs-galaxy-star-size-value' }
    ];
    
    mappings.forEach(map => {
        const originalInput = document.getElementById(map.original);
        const fsInput = document.getElementById(map.fs);
        const originalDisplay = document.getElementById(map.original.replace('-speed', '') + '-value') || 
                               document.getElementById(map.original + '-value');
        const fsDisplay = document.getElementById(map.display);
        
        if (originalInput && fsInput) {
            fsInput.value = originalInput.value;
        }
        
        if (originalDisplay && fsDisplay) {
            fsDisplay.textContent = originalDisplay.textContent;
        }
    });
}

// Listen for fullscreen change events
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        const section = document.querySelector('.galaxy-sim-section');
        if (section) {
            section.classList.remove('fullscreen');
        }
        const fullscreenBtn = document.querySelector('.fullscreen-btn');
        if (fullscreenBtn) {
            const icon = fullscreenBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('bi-fullscreen-exit');
                icon.classList.add('bi-arrows-fullscreen');
            }
        }
    }
    
    setTimeout(() => {
        onGalaxyResize();
    }, 100);
});

// Override update functions to sync fullscreen values
const originalUpdateGalaxyRotation = updateGalaxyRotation;
updateGalaxyRotation = function(value) {
    originalUpdateGalaxyRotation(value);
    const fsDisplay = document.getElementById('fs-galaxy-rotation-value');
    if (fsDisplay) fsDisplay.textContent = value;
    const fsInput = document.getElementById('fs-galaxy-rotation');
    if (fsInput) fsInput.value = value;
};

const originalUpdateGalaxyTilt = updateGalaxyTilt;
updateGalaxyTilt = function(value) {
    originalUpdateGalaxyTilt(value);
    const fsDisplay = document.getElementById('fs-galaxy-tilt-value');
    if (fsDisplay) fsDisplay.textContent = value + '°';
    const fsInput = document.getElementById('fs-galaxy-tilt');
    if (fsInput) fsInput.value = value;
};

const originalUpdateGalaxyZoom = updateGalaxyZoom;
updateGalaxyZoom = function(value) {
    originalUpdateGalaxyZoom(value);
    const fsDisplay = document.getElementById('fs-galaxy-zoom-value');
    if (fsDisplay) fsDisplay.textContent = value;
    const fsInput = document.getElementById('fs-galaxy-zoom');
    if (fsInput) fsInput.value = value;
};

const originalUpdateGalaxyStarSize = updateGalaxyStarSize;
updateGalaxyStarSize = function(value) {
    originalUpdateGalaxyStarSize(value);
    const fsDisplay = document.getElementById('fs-galaxy-star-size-value');
    if (fsDisplay) fsDisplay.textContent = value;
    const fsInput = document.getElementById('fs-galaxy-star-size');
    if (fsInput) fsInput.value = value;
};
