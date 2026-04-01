/* exported galaxyControls, galaxyRendererFS, initGalaxySimulation, getStellarPopulationColor, updateGalaxyRotation, updateGalaxyTilt, updateGalaxyZoom, updateGalaxyStarSize, resetGalaxyView, toggleGalaxyFullscreen, applyPresetFromFullscreen, updateParamFromFullscreen, categoryMap */
/* global currentLang */
// Galactic Simulation using Three.js
// Visualizes the Drake Equation steps across a simulated Milky Way-like spiral galaxy

let galaxyScene, galaxyCamera, galaxyRenderer, starSystem, galaxyControls;
let galaxyRendererFS; // Separate renderer for fullscreen

// Configurable quality settings - can be adjusted based on device performance
const QUALITY_SETTINGS = {
    high: { starCount: 50000, globularClusters: 10, openClusters: 12 },
    medium: { starCount: 30000, globularClusters: 6, openClusters: 8 },
    low: { starCount: 15000, globularClusters: 3, openClusters: 4 }
};

// Auto-detect performance tier based on device capabilities
function detectPerformanceTier() {
    // Simple heuristic: check device memory and hardware concurrency
    const hasHighEndDevice = navigator.deviceMemory && navigator.deviceMemory >= 8;
    const hasManyCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 8;
    
    if (hasHighEndDevice && hasManyCores) return 'high';
    if (navigator.deviceMemory && navigator.deviceMemory <= 4) return 'low';
    return 'medium'; // Default to medium
}

const CURRENT_QUALITY = QUALITY_SETTINGS[detectPerformanceTier()];
const STAR_COUNT = CURRENT_QUALITY.starCount;

// Default view settings
const DEFAULT_VIEW = {
    rotationSpeed: 0.001,
    tilt: 45,
    zoom: 200,
    starSize: 1.2
};

let currentView = { ...DEFAULT_VIEW };

// Colors for each stage following improved color scheme
// Based on user feedback: better distinction between categories
const COLORS = {
    total: 0x8B4545,      // Dim red: Total stars (less prominent)
    planets: 0xf39c12,    // Orange: With planets
    habitable: 0x3498db,  // Blue: Habitable
    life: 0x2ecc71,       // Green: With life
    intelligence: 0x9b59b6, // Purple: Intelligent life
    tech: 0xffffff        // Bright white: Communicative (most visible)
};

// PRE-COMPUTED COLORS for high performance (Zero-allocation inside loops)
const RGB_COLORS = {};
(function precomputeColors() {
    const tempColor = new THREE.Color();
    for (const key in COLORS) {
        tempColor.setHex(COLORS[key]);
        RGB_COLORS[key] = { r: tempColor.r, g: tempColor.g, b: tempColor.b };
    }
})();

// Visibility state for each category - defaults to only showing top 3 interesting categories
const GALAXY_VISIBILITY = {
    total: false,         // Hidden by default (noise)
    planets: false,       // Hidden by default (noise)
    habitable: false,     // Hidden by default (noise)
    life: true,           // Visible by default (interesting)
    intelligence: true,   // Visible by default (interesting)
    tech: true            // Visible by default (most interesting)
};

// Blinking state for communicative civilizations
let communicativeBlinkState = true;
let lastBlinkTime = 0;
const BLINK_INTERVAL = 1000; // milliseconds

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
    armCurvature: 3.5,          // Spiral arm curvature multiplier (higher = more curved)
    // Star cluster parameters
    globularClusters: 12,       // Number of globular clusters (Milky Way has ~150, we use fewer for performance)
    openClusters: 18,           // Number of open clusters in spiral arms
    clusterStarsMin: 80,        // Minimum stars per cluster
    clusterStarsMax: 250        // Maximum stars per cluster
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

    // Check for WebGL support before creating renderer
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

    // Apply current Drake params to the galaxy simulation
    const params = getCurrentDrakeParams();
    updateGalaxySimulation(params);

    // Enable fullscreen button now that galaxy is initialized
    const fullscreenBtn = document.querySelector('.fullscreen-btn-overlay');
    if (fullscreenBtn) {
        fullscreenBtn.disabled = false;
        fullscreenBtn.style.opacity = '0.7';
        fullscreenBtn.style.cursor = 'pointer';
    }

    // Initialize slider visual positions
    initGalaxySliders();

    // Update legend UI to reflect default visibility state
    updateLegendUI();

    window.addEventListener('resize', onGalaxyResize);
}

// Initialize galaxy control sliders with correct visual positions
function initGalaxySliders() {
    const sliders = [
        { id: 'galaxy-rotation-speed', min: 0, max: 0.01 },
        { id: 'galaxy-tilt', min: 0, max: 90 },
        { id: 'galaxy-zoom', min: 50, max: 400 },
        { id: 'galaxy-star-size', min: 0.5, max: 3 }
    ];
    
    sliders.forEach(slider => {
        const input = document.getElementById(slider.id);
        if (input) {
            updateSliderBackground(input, slider.min, slider.max);
        }
    });
}

// Update slider background gradient to show current value position
function updateSliderBackground(input, min, max) {
    const value = parseFloat(input.value);
    const percentage = ((value - min) / (max - min)) * 100;
    input.style.background = `linear-gradient(to right, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.5) ${percentage}%, rgba(255, 255, 255, 0.2) ${percentage}%, rgba(255, 255, 255, 0.2) 100%)`;
}

// Generate globular cluster position - distributed in galactic halo but closer to disk
function generateGlobularClusterPosition() {
    // Globular clusters in a flattened spheroid, mostly within the galactic halo
    const distance = 20 + Math.random() * 50; // 20-70 light years from center (closer)
    const theta = Math.random() * Math.PI * 2; // Horizontal angle
    
    // Flattened distribution - more concentrated near the disk plane
    const phi = Math.acos(2 * Math.random() - 1);
    const verticalFactor = 0.4; // Flatten the sphere (0 = flat disk, 1 = full sphere)
    
    const x = distance * Math.sin(phi) * Math.cos(theta);
    const y = distance * Math.cos(phi) * verticalFactor; // Flattened vertical spread
    const z = distance * Math.sin(phi) * Math.sin(theta);
    
    return { x, y, z };
}

// Generate open cluster position - in spiral arms (star formation regions)
function generateOpenClusterPosition() {
    const armIndex = Math.floor(Math.random() * GALAXY_PARAMS.spiralArms);
    const baseAngle = (armIndex / GALAXY_PARAMS.spiralArms) * Math.PI * 2;
    
    // Open clusters are in spiral arms, mostly in outer regions
    const radius = 35 + Math.random() * (GALAXY_PARAMS.diskRadius - 45);
    
    // Logarithmic spiral position
    const spiralAngle = baseAngle + Math.log(radius + 1) * GALAXY_PARAMS.armTightness * GALAXY_PARAMS.armCurvature;
    
    // Some spread within the arm
    const armOffset = (Math.random() - 0.5) * 6;
    const angleOffset = (Math.random() - 0.5) * 0.15;
    
    const effectiveRadius = radius + armOffset;
    const finalAngle = spiralAngle + angleOffset;
    
    const x = Math.cos(finalAngle) * effectiveRadius;
    const y = (Math.random() - 0.5) * 4; // Thin distribution in disk plane
    const z = Math.sin(finalAngle) * effectiveRadius;
    
    return { x, y, z };
}

// Generate stars within a cluster (soft, realistic distribution)
// Now uses Drake Equation color distribution instead of stellar population colors
function generateClusterStars(centerX, centerY, centerZ, starCount, clusterType) {
    const positions = [];
    const colors = [];
    const sizes = [];

    // Use default Drake params from config.js to distribute cluster star colors proportionally
    // These will be updated in updateClusterStars when user changes sliders
    const fpThreshold = starCount * defaultValues.fp;
    const neThreshold = fpThreshold * (defaultValues.ne / 10);
    const flThreshold = neThreshold * defaultValues.fl;
    const fiThreshold = flThreshold * defaultValues.fi;
    const fcThreshold = fiThreshold * defaultValues.fc;

    for (let i = 0; i < starCount; i++) {
        // Use Plummer-like distribution for soft, realistic cluster core
        const u = Math.random();
        const rScale = clusterType === 'globular' ? 8 : 5;
        const r = rScale * Math.pow(u, 1/3) / Math.pow(1 - u, 1/3);
        const clampedR = Math.min(r, clusterType === 'globular' ? 20 : 12);

        // Spherical distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        const x = centerX + clampedR * Math.sin(phi) * Math.cos(theta);
        const y = centerY + clampedR * Math.cos(phi);
        const z = centerZ + clampedR * Math.sin(phi) * Math.sin(theta);

        positions.push(x, y, z);

        // Assign Drake color based on star index (proportional distribution)
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

        // Size variation - brighter stars in cluster
        sizes.push(0.8 + Math.random() * 1.8);
    }

    return { positions, colors, sizes };
}

// Global reference for communicative stars glow system
let communicativeGlowSystem = null;

function createStarField() {
    const mainGeometry = new THREE.BufferGeometry();
    const glowGeometry = new THREE.BufferGeometry(); // Separate geometry for glowing communicative stars
    
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    
    // Arrays for glow particles (only communicative stars)
    const glowPositions = [];
    const glowIndices = [];

    // Use default Drake params from config.js to initialize star colors
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

        // Assign Drake color based on star index (proportional distribution)
        let colorHex;
        if (i < fcThreshold) {
            colorHex = COLORS.tech;
            // Store position for glow effect
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

        // Vary star sizes for more natural look
        sizes[i] = Math.random() * 1.5 + 0.5;
    }

    mainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    mainGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    mainGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create circular sprite texture for stars
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

    // Create glow system for communicative stars
    if (glowPositions.length > 0) {
        const glowGeometry = new THREE.BufferGeometry();
        glowGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(glowPositions), 3));
        
        const glowMaterial = new THREE.PointsMaterial({
            size: 3.5, // Larger than normal stars
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

    // Create star clusters as children of starSystem so they rotate with the galaxy
    createStarClusters(sprite);
}

// Create globular and open clusters
function createStarClusters(sprite) {
    // Create globular clusters (flattened halo distribution)
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
        
        // Convert HSL to RGB for colors
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
        starSystem.add(cluster); // Add as child of starSystem to rotate with galaxy
    }
    
    // Create open clusters (in spiral arms)
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
        
        // Convert HSL to RGB for colors
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
        starSystem.add(cluster); // Add as child of starSystem to rotate with galaxy
    }
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
    // Use a unified approach with continuous distributions
    // No hard thresholds - all components blend naturally
    
    // Primary distribution: spiral disk (majority of stars)
    const armIndex = Math.floor(Math.random() * GALAXY_PARAMS.spiralArms);
    const baseAngle = (armIndex / GALAXY_PARAMS.spiralArms) * Math.PI * 2;
    
    // Natural radius distribution with exponential falloff toward center
    const radiusRandom = Math.random();
    let radiusNorm;
    
    // Mixed distribution: concentration toward center but with smooth gradient
    const distributionType = Math.random();
    if (distributionType < 0.50) {
        // Main disk population
        radiusNorm = Math.pow(radiusRandom, 0.55);
    } else if (distributionType < 0.75) {
        // Inner concentration (creates denser center without sharp boundary)
        radiusNorm = Math.pow(radiusRandom, 0.7) * 0.5;
    } else if (distributionType < 0.90) {
        // Mid-disk with some spread
        radiusNorm = Math.pow(radiusRandom, 0.5) * 0.7 + 0.1;
    } else {
        // Outer stragglers
        radiusNorm = Math.pow(radiusRandom, 0.4) * 0.6 + 0.35;
    }
    
    const radius = radiusNorm * GALAXY_PARAMS.diskRadius;
    
    // LOGARITHMIC SPIRAL
    const spiralAngle = baseAngle + Math.log(radius + 1) * GALAXY_PARAMS.armTightness * GALAXY_PARAMS.armCurvature;
    
    // Natural arm width variation with noise
    const armWidthVariation = 1 +
        0.2 * Math.sin(armIndex * 2.1 + radius * 0.05) +
        0.15 * Math.cos(armIndex * 1.7 + radius * 0.08) +
        0.12 * Math.sin(radius * 0.12 - armIndex);
    
    // Density wave with outer flare
    const outerFlare = 1 + (radius / GALAXY_PARAMS.diskRadius) * 0.4;
    const armOffset = (Math.random() - 0.5) * GALAXY_PARAMS.armSpread * Math.sqrt(radius) * outerFlare * armWidthVariation;
    
    // Thickness: thick in center, thin at edges (natural galactic profile)
    // Use exponential falloff for smooth transition
    const thicknessProfile = Math.exp(-radius / (GALAXY_PARAMS.diskRadius * 0.4));
    const thickness = GALAXY_PARAMS.thickDisk * thicknessProfile + GALAXY_PARAMS.diskThickness * (1 - thicknessProfile);
    
    // Natural scatter with variation - MORE scatter in center for fuzzy bulge
    const centerScatter = Math.max(0, 8 - radius * 0.5); // More scatter near center
    const baseScatter = 3 + centerScatter + (radius / GALAXY_PARAMS.diskRadius) * 4;
    const scatterVariation = 1 +
        0.3 * Math.sin(radius * 0.08 + armIndex * 1.5) +
        0.2 * Math.cos(radius * 0.15 - armIndex * 0.8);
    const scatter = (Math.random() - 0.5) * baseScatter * scatterVariation;
    
    // Angular scatter for softer edges
    const baseAngularScatter = 0.15 * (radius / GALAXY_PARAMS.diskRadius);
    const angularVariation = 1 + 0.2 * Math.sin(radius * 0.06 + armIndex);
    const angularScatter = (Math.random() - 0.5) * baseAngularScatter * angularVariation;
    
    // Spiral arm waviness
    const armWaviness = 0.05 * Math.sin(radius * 0.04 + armIndex * 0.5) +
                        0.03 * Math.cos(radius * 0.07 - armIndex * 0.3);
    
    // Inter-arm stars (significant population between arms for natural look)
    const interArmOffset = Math.random() < 0.25 ? (Math.random() - 0.5) * 18 : 0;
    
    // Central bar influence - VERY subtle, only affects inner region
    // Instead of a separate bar population, subtly modify inner stars
    let barX = 0, barZ = 0;
    if (radius < GALAXY_PARAMS.barLength * 0.4) {
        // Subtle bar influence in center - just a slight elongation
        const barInfluence = 1 - (radius / (GALAXY_PARAMS.barLength * 0.4));
        const barAngle = 0.3;
        barX = (Math.random() - 0.5) * GALAXY_PARAMS.barWidth * 0.6 * barInfluence;
        barZ = (Math.random() - 0.5) * GALAXY_PARAMS.barWidth * 0.3 * barInfluence;
        
        // Rotate bar effect
        const tempX = barX * Math.cos(barAngle) - barZ * Math.sin(barAngle);
        barZ = barX * Math.sin(barAngle) + barZ * Math.cos(barAngle);
        barX = tempX;
    }
    
    const effectiveRadius = radius + armOffset + scatter + interArmOffset;
    const finalAngle = spiralAngle + angularScatter + armWaviness;
    
    const x = Math.cos(finalAngle) * effectiveRadius + barX;
    const y = (Math.random() - 0.5) * thickness;
    const z = Math.sin(finalAngle) * effectiveRadius + barZ;
    
    // Determine population based on radius and position (for coloring)
    // This is just for visual color, not for structure
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

// Create a larger, more pronounced glow texture for communicative stars
function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Create a larger, more diffuse glow for communicative stars
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

// Stores last thresholds so blink-only updates can skip a full repaint
let _lastFcIdx = 0;

// Rebuild the glow system for communicative stars based on current params
function rebuildGlowSystem(params) {
    if (!starSystem) return;
    
    // Remove old glow system
    if (communicativeGlowSystem) {
        starSystem.remove(communicativeGlowSystem);
        communicativeGlowSystem.geometry.dispose();
        communicativeGlowSystem = null;
    }
    
    // Only create glow if tech is visible and there are communicative stars
    if (!GALAXY_VISIBILITY.tech) return;
    
    const positions = starSystem.geometry.attributes.position.array;
    const fpFrac = params.fp;
    const neFrac = fpFrac * (params.ne / 10);
    const flFrac = neFrac * params.fl;
    const fiFrac = flFrac * params.fi;
    const fcFrac = fiFrac * params.fc;
    const fc = Math.min(STAR_COUNT, Math.max(0, Math.round(STAR_COUNT * fcFrac)));
    
    if (fc === 0) return;
    
    // Collect positions of communicative stars
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

    // Strict proportional thresholds — scientifically honest.
    // Each segment covers exactly its fraction of STAR_COUNT.
    // If a fraction rounds to 0, that category shows no stars (intentional).
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

    // Flat segment loops — no branching inside each loop
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

// Lightweight blink: only touch the tech segment (0.._lastFcIdx)
// Called by the animation loop every BLINK_INTERVAL — avoids full repaint
function blinkTechStars() {
    if (!starSystem || !GALAXY_VISIBILITY.tech || _lastFcIdx === 0) return;
    const colors = starSystem.geometry.attributes.color.array;
    const cT = RGB_COLORS.tech;
    const blinkMult = communicativeBlinkState ? 1.0 : 0.3;
    const r = cT.r * blinkMult, g = cT.g * blinkMult, b = cT.b * blinkMult;
    for (let i = 0; i < _lastFcIdx; i++) { const i3 = i*3; colors[i3]=r; colors[i3+1]=g; colors[i3+2]=b; }
    starSystem.geometry.attributes.color.needsUpdate = true;
    
    // Also blink the glow system
    if (communicativeGlowSystem) {
        const glowOpacity = communicativeBlinkState ? 0.6 : 0.15;
        communicativeGlowSystem.material.opacity = glowOpacity;
    }
}

// Update visibility and colors of star clusters based on GALAXY_VISIBILITY and Drake params
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

    // Proportional fractions — same as updateGalaxySimulation
    const fpFrac = params.fp;
    const neFrac = fpFrac * (params.ne / 10);
    const flFrac = neFrac * params.fl;
    const fiFrac = flFrac * params.fi;
    const fcFrac = fiFrac * params.fc;

    starSystem.children.forEach(child => {
        if (!child.isPoints) return;
        if (!child.geometry || !child.geometry.attributes || !child.geometry.attributes.color) return;

        const colors = child.geometry.attributes.color.array;
        const N = colors.length / 3;   // star count for this cluster

        // Compute integer thresholds once per cluster
        const fc = Math.min(N, Math.max(0, Math.round(N * fcFrac)));
        const fi = Math.min(N, Math.max(0, Math.round(N * fiFrac)));
        const fl = Math.min(N, Math.max(0, Math.round(N * flFrac)));
        const ne = Math.min(N, Math.max(0, Math.round(N * neFrac)));
        const fp = Math.min(N, Math.max(0, Math.round(N * fpFrac)));

        // Flat segment loops — zero branching inside each loop
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
    // Update display values for both normal and fullscreen views
    const displayEl = document.getElementById('galaxy-rotation-value');
    if (displayEl) displayEl.textContent = value;
    const fsDisplayEl = document.getElementById('fs-galaxy-rotation-value');
    if (fsDisplayEl) fsDisplayEl.textContent = value;
    // Update slider visual position
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
    // Update slider visual position
    const slider = document.getElementById('galaxy-tilt');
    if (slider) updateSliderBackground(slider, 0, 90);
    const fsSlider = document.getElementById('fs-galaxy-tilt');
    if (fsSlider) updateSliderBackground(fsSlider, 0, 90);

    // Convert tilt to camera position
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
    // Update slider visual position
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
    const displayEl = document.getElementById('galaxy-star-size-value');
    if (displayEl) displayEl.textContent = value;
    const fsDisplayEl = document.getElementById('fs-galaxy-star-size-value');
    if (fsDisplayEl) fsDisplayEl.textContent = value;
    // Update slider visual position
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

    // Reset sliders (fullscreen view)
    const fsRotation = document.getElementById('fs-galaxy-rotation');
    const fsTilt = document.getElementById('fs-galaxy-tilt');
    const fsZoom = document.getElementById('fs-galaxy-zoom');
    const fsStarSize = document.getElementById('fs-galaxy-star-size');
    
    if (fsRotation) fsRotation.value = DEFAULT_VIEW.rotationSpeed;
    if (fsTilt) fsTilt.value = DEFAULT_VIEW.tilt;
    if (fsZoom) fsZoom.value = DEFAULT_VIEW.zoom;
    if (fsStarSize) fsStarSize.value = DEFAULT_VIEW.starSize;

    // Update display values (fullscreen view)
    const fsRotationVal = document.getElementById('fs-galaxy-rotation-value');
    const fsTiltVal = document.getElementById('fs-galaxy-tilt-value');
    const fsZoomVal = document.getElementById('fs-galaxy-zoom-value');
    const fsStarSizeVal = document.getElementById('fs-galaxy-star-size-value');
    
    if (fsRotationVal) fsRotationVal.textContent = DEFAULT_VIEW.rotationSpeed;
    if (fsTiltVal) fsTiltVal.textContent = DEFAULT_VIEW.tilt + '°';
    if (fsZoomVal) fsZoomVal.textContent = DEFAULT_VIEW.zoom;
    if (fsStarSizeVal) fsStarSizeVal.textContent = DEFAULT_VIEW.starSize;

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

// Override animateGalaxy to use dynamic rotation speed and handle blinking
// Optimized with delta time to avoid unnecessary calculations
let lastFrameTime = 0;

function animateGalaxyWithRotation() {
    requestAnimationFrame(animateGalaxyWithRotation);

    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    // Only update if enough time has passed (avoid sub-frame updates)
    if (deltaTime < 8) { // Cap at ~120 FPS
        return;
    }

    if (starSystem) {
        // Use delta time for smooth rotation regardless of frame rate
        starSystem.rotation.y += currentView.rotationSpeed * (deltaTime / 16.67);

        // Handle blinking for communicative civilizations
        if (currentTime - lastBlinkTime > BLINK_INTERVAL) {
            communicativeBlinkState = !communicativeBlinkState;
            lastBlinkTime = currentTime;
            // Use lightweight blink function — only updates the tech segment (fraction of stars)
            blinkTechStars();
        }
    }
    galaxyRenderer.render(galaxyScene, galaxyCamera);
}

// Fullscreen functionality
function toggleGalaxyFullscreen() {
    // Check if galaxy is initialized
    if (!galaxyRenderer) {
        console.error('Galaxy renderer not initialized yet');
        return;
    }

    // Check if device is mobile (screen width <= 768px)
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

    // Toggle active class on overlay
    overlay.classList.toggle('active');

    if (overlay.classList.contains('active')) {
        // Entering fullscreen
        section.classList.add('fullscreen');

        // Move canvas to fullscreen container
        if (galaxyRenderer && galaxyRenderer.domElement) {
            const canvas = galaxyRenderer.domElement;
            fullscreenContainer.appendChild(canvas);
        }

        populateFullscreenParams();
        syncFullscreenValues();
        syncFullscreenVizControls();
        updateLegendUI();
        // Update button icon to minimize (Lucide SVG)
        if (fullscreenBtn) {
            fullscreenBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
                <span data-i18n="fullscreen_exit_fullscreen">Exit Fullscreen</span>
            `;
        }
        // Force resize after overlay is visible
        setTimeout(() => {
            onGalaxyResize();
            // Force re-render
            if (galaxyRenderer) {
                galaxyRenderer.render(galaxyScene, galaxyCamera);
            }
        }, 50);
    } else {
        // Exiting fullscreen
        section.classList.remove('fullscreen');

        // Move canvas back to normal container
        if (galaxyRenderer && galaxyRenderer.domElement) {
            const canvas = galaxyRenderer.domElement;
            normalContainer.appendChild(canvas);
        }

        // Update button icon to maximize (Lucide SVG)
        if (fullscreenBtn) {
            fullscreenBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                <span data-i18n="galaxy_fullscreen_text">Open Fullscreen Simulation</span>
            `;
        }

        // Force resize when exiting fullscreen
        setTimeout(() => {
            onGalaxyResize();
            // Force re-render
            if (galaxyRenderer) {
                galaxyRenderer.render(galaxyScene, galaxyCamera);
            }
        }, 50);
    }
    
    // Update galaxy renderer to use correct container
    if (isEnteringFullscreen) {
        galaxyRendererFS = galaxyRenderer;
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
        <h4 class="presets-title" data-i18n="fullscreen_presets_title">${t('fullscreen_presets_title')}</h4>
        <div class="presets-legend" data-i18n="preset_legend">${t('preset_legend')}</div>
        <div class="fullscreen-presets-grid">
            <button class="preset-btn" onclick="applyPresetFromFullscreen('optimistic')" data-i18n="fullscreen_preset_optimistic">${t('fullscreen_preset_optimistic')}</button>
            <button class="preset-btn" onclick="applyPresetFromFullscreen('sagan')" data-i18n="fullscreen_preset_sagan">${t('fullscreen_preset_sagan')}</button>
            <button class="preset-btn" onclick="applyPresetFromFullscreen('drake')" data-i18n="fullscreen_preset_drake">${t('fullscreen_preset_drake')}</button>
            <button class="preset-btn" onclick="applyPresetFromFullscreen('scientific')" data-i18n="fullscreen_preset_scientific">${t('fullscreen_preset_scientific')}</button>
            <button class="preset-btn" onclick="applyPresetFromFullscreen('rare_earth')" data-i18n="fullscreen_preset_rare_earth">${t('fullscreen_preset_rare_earth')}</button>
            <button class="preset-btn" onclick="applyPresetFromFullscreen('pessimistic')" data-i18n="fullscreen_preset_pessimistic">${t('fullscreen_preset_pessimistic')}</button>
        </div>
    `;
    container.appendChild(presetsSection);

    const params = [
        { id: 'Rstar', label: t('labels.Rstar') },
        { id: 'fp', label: t('labels.fp') },
        { id: 'ne', label: t('labels.ne') },
        { id: 'fl', label: t('labels.fl') },
        { id: 'fi', label: t('labels.fi') },
        { id: 'fc', label: t('labels.fc') },
        { id: 'L', label: t('labels.L') }
    ];

    params.forEach(param => {
        const input = document.getElementById(param.id);
        if (!input) return;

        const valueDisplay = document.getElementById(param.id + '-value');
        const value = valueDisplay ? valueDisplay.textContent : input.value;

        const item = document.createElement('div');
        item.className = 'fullscreen-param-item';
        item.innerHTML = `
            <label>
                ${param.label}
                <span class="fullscreen-param-value" id="fs-${param.id}-value">${value}</span>
            </label>
            <input type="range" id="fs-${param.id}" min="${input.min}" max="${input.max}" step="${input.step}" value="${input.value}"
                   oninput="updateParamFromFullscreen('${param.id}', this.value)">
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
        
        // Update active-preset class in fullscreen buttons
        document.querySelectorAll('.fullscreen-presets-grid .preset-btn').forEach(btn => {
            btn.classList.remove('active-preset');
        });
        const activeFullscreenBtn = document.querySelector(`.fullscreen-presets-grid .preset-btn[onclick*="${preset}"]`);
        if (activeFullscreenBtn) {
            activeFullscreenBtn.classList.add('active-preset');
        }
        
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
    const fsNumberEl = document.getElementById('fullscreen-n-number');

    if (resultEl && fsResultEl) {
        const nValue = resultEl.textContent;
        fsResultEl.textContent = nValue;
        if (fsNumberEl) {
            fsNumberEl.textContent = nValue;
        }
    }
}

// Sync fullscreen viz controls with current view settings
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

// Listen for fullscreen change events
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

// Fullscreen synchronization is now handled within the original update functions

// Toggle visibility of a category in the galaxy simulation
function toggleGalaxyCategory(category) {
    if (Object.hasOwn(GALAXY_VISIBILITY, category)) {
        GALAXY_VISIBILITY[category] = !GALAXY_VISIBILITY[category];
        
        // Update legend UI to reflect the new state
        updateLegendUI();
        
        // Re-render the galaxy with updated visibility
        const params = getCurrentDrakeParams();
        updateGalaxySimulation(params);
    }
}

// Update legend UI to show active/inactive state
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

// Get current Drake equation parameters
function getCurrentDrakeParams() {
    // For fi and fl, we need to convert from linear slider position to log value
    const getParamValue = (paramId) => {
        const slider = document.getElementById(paramId);
        if (!slider) return 0;
        
        const value = parseFloat(slider.value);
        const logParams = ['fi', 'fl'];
        
        if (!logParams.includes(paramId)) return value;
        
        // Convert from linear slider position to log value
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

// Initialize legend click handlers
function initGalaxyLegendHandlers() {
    const categories = ['total', 'planets', 'habitable', 'life', 'intelligence', 'tech'];

    // Use event delegation at document level for maximum reliability
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

    // Initialize legend UI to reflect default visibility state
    updateLegendUI();
}

// Show alert when mobile users try to access fullscreen
function showMobileFullscreenAlert() {
    // Use hardcoded translations to avoid dependency on t() function
    const alertMsg = currentLang === 'es' 
        ? 'La vista en pantalla completa de la simulación solo está disponible en pantallas grandes.'
        : 'Fullscreen view is only available on large screens.';
    
    // Remove existing alert if any
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
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (alertEl && alertEl.parentNode) {
            alertEl.classList.add('fade-out');
            setTimeout(() => alertEl.remove(), 300);
        }
    }, 3000);
}

// Initialize legend handlers when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalaxyLegendHandlers);
} else {
    initGalaxyLegendHandlers();
}
