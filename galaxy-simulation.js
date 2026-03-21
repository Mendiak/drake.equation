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

    galaxyRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    galaxyRenderer.setSize(width, height);
    galaxyRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(galaxyRenderer.domElement);

    createStarField();
    animateGalaxy();
    
    // Initialize slider visual positions
    initGalaxySliders();

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

    // Use default Drake params to distribute cluster star colors proportionally
    // These will be updated in updateClusterStars when user changes sliders
    const defaultFp = 0.5;
    const defaultNe = 2;
    const defaultFl = 0.5;
    const defaultFi = 0.1;
    const defaultFc = 0.1;

    const fpThreshold = starCount * defaultFp;
    const neThreshold = fpThreshold * (defaultNe / 10);
    const flThreshold = neThreshold * defaultFl;
    const fiThreshold = flThreshold * defaultFi;
    const fcThreshold = fiThreshold * defaultFc;

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

function createStarField() {
    const mainGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);

    // Use default Drake params to initialize star colors
    // These will be updated when user changes sliders
    const defaultFp = 0.5;
    const defaultNe = 2;
    const defaultFl = 0.5;
    const defaultFi = 0.1;
    const defaultFc = 0.1;

    const fpThreshold = STAR_COUNT * defaultFp;
    const neThreshold = fpThreshold * (defaultNe / 10);
    const flThreshold = neThreshold * defaultFl;
    const fiThreshold = flThreshold * defaultFi;
    const fcThreshold = fiThreshold * defaultFc;

    for (let i = 0; i < STAR_COUNT; i++) {
        const starData = generateSpiralGalaxyPosition();

        positions[i * 3] = starData.x;
        positions[i * 3 + 1] = starData.y;
        positions[i * 3 + 2] = starData.z;

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

function updateGalaxySimulation(params) {
    if (!starSystem) return;

    const colors = starSystem.geometry.attributes.color.array;
    const positions = starSystem.geometry.attributes.position.array;

    // Calculate thresholds based on Drake Equation steps
    const fpThreshold = STAR_COUNT * params.fp;
    const neThreshold = fpThreshold * (params.ne / 10); // Normalizing ne (max 10)
    const flThreshold = neThreshold * params.fl;
    const fiThreshold = flThreshold * params.fi;
    const fcThreshold = fiThreshold * params.fc;

    for (let i = 0; i < STAR_COUNT; i++) {
        let colorHex;
        let category;

        if (i < fcThreshold) {
            colorHex = COLORS.tech;
            category = 'tech';
        } else if (i < fiThreshold) {
            colorHex = COLORS.intelligence;
            category = 'intelligence';
        } else if (i < flThreshold) {
            colorHex = COLORS.life;
            category = 'life';
        } else if (i < neThreshold) {
            colorHex = COLORS.habitable;
            category = 'habitable';
        } else if (i < fpThreshold) {
            colorHex = COLORS.planets;
            category = 'planets';
        } else {
            colorHex = COLORS.total;
            category = 'total';
        }

        // Check if this category is visible
        if (!GALAXY_VISIBILITY[category]) {
            // Hide by setting to BLACK - with AdditiveBlending, black is invisible
            colors[i * 3] = 0;
            colors[i * 3 + 1] = 0;
            colors[i * 3 + 2] = 0;
        } else {
            const color = new THREE.Color(colorHex);

            // Apply blinking effect for communicative civilizations (tech)
            if (category === 'tech' && !communicativeBlinkState) {
                // Dim the communicative stars during blink off phase
                colors[i * 3] = color.r * 0.3;
                colors[i * 3 + 1] = color.g * 0.3;
                colors[i * 3 + 2] = color.b * 0.3;
            } else {
                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;
            }
        }
    }

    starSystem.geometry.attributes.color.needsUpdate = true;

    // Also update cluster stars visibility
    updateClusterVisibility(params);
}

// Update visibility and colors of star clusters based on GALAXY_VISIBILITY and Drake params
function updateClusterVisibility(params) {
    if (!starSystem) return;

    // Check if any category is visible
    const anyVisible = Object.values(GALAXY_VISIBILITY).some(v => v === true);

    // Calculate thresholds for cluster stars
    const fpThreshold = 1 * params.fp;
    const neThreshold = fpThreshold * (params.ne / 10);
    const flThreshold = neThreshold * params.fl;
    const fiThreshold = flThreshold * params.fi;
    const fcThreshold = fiThreshold * params.fc;

    // Iterate through all cluster children of starSystem
    starSystem.children.forEach(child => {
        if (child.isPoints) {
            const colors = child.geometry.attributes.color.array;
            const starCount = colors.length / 3;

            // Update colors based on Drake Equation
            for (let i = 0; i < starCount; i++) {
                let colorHex;
                let category;

                if (i < fcThreshold * starCount) {
                    colorHex = COLORS.tech;
                    category = 'tech';
                } else if (i < fiThreshold * starCount) {
                    colorHex = COLORS.intelligence;
                    category = 'intelligence';
                } else if (i < flThreshold * starCount) {
                    colorHex = COLORS.life;
                    category = 'life';
                } else if (i < neThreshold * starCount) {
                    colorHex = COLORS.habitable;
                    category = 'habitable';
                } else if (i < fpThreshold * starCount) {
                    colorHex = COLORS.planets;
                    category = 'planets';
                } else {
                    colorHex = COLORS.total;
                    category = 'total';
                }

                // Check if this category is visible
                if (!GALAXY_VISIBILITY[category]) {
                    // Hide by setting to BLACK - with AdditiveBlending, black is invisible
                    colors[i * 3] = 0;
                    colors[i * 3 + 1] = 0;
                    colors[i * 3 + 2] = 0;
                } else {
                    const color = new THREE.Color(colorHex);

                    // Apply blinking effect for communicative civilizations (tech)
                    if (category === 'tech' && !communicativeBlinkState) {
                        colors[i * 3] = color.r * 0.3;
                        colors[i * 3 + 1] = color.g * 0.3;
                        colors[i * 3 + 2] = color.b * 0.3;
                    } else {
                        colors[i * 3] = color.r;
                        colors[i * 3 + 1] = color.g;
                        colors[i * 3 + 2] = color.b;
                    }
                }
            }

            child.geometry.attributes.color.needsUpdate = true;

            // Also set overall opacity based on visibility
            child.material.opacity = anyVisible ? 0.9 : 0.02;
        }
    });
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
    // Update slider visual position
    const slider = document.getElementById('galaxy-rotation-speed');
    if (slider) updateSliderBackground(slider, 0, 0.01);
}

function updateGalaxyTilt(value) {
    currentView.tilt = parseFloat(value);
    document.getElementById('galaxy-tilt-value').textContent = value + '°';
    // Update slider visual position
    const slider = document.getElementById('galaxy-tilt');
    if (slider) updateSliderBackground(slider, 0, 90);
    
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
    // Update slider visual position
    const slider = document.getElementById('galaxy-zoom');
    if (slider) updateSliderBackground(slider, 50, 400);
    
    const tiltRad = (currentView.tilt * Math.PI) / 180;
    galaxyCamera.position.y = Math.sin(tiltRad) * currentView.zoom * 0.5;
    galaxyCamera.position.z = Math.cos(tiltRad) * currentView.zoom;
    galaxyCamera.lookAt(0, 0, 0);
}

function updateGalaxyStarSize(value) {
    currentView.starSize = parseFloat(value);
    document.getElementById('galaxy-star-size-value').textContent = value;
    // Update slider visual position
    const slider = document.getElementById('galaxy-star-size');
    if (slider) updateSliderBackground(slider, 0.5, 3);
    
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

// Override animateGalaxy to use dynamic rotation speed and handle blinking
const originalAnimateGalaxy = animateGalaxy;
animateGalaxy = function() {
    requestAnimationFrame(animateGalaxy);
    
    if (starSystem) {
        starSystem.rotation.y += currentView.rotationSpeed;
        
        // Handle blinking for communicative civilizations
        const now = Date.now();
        if (now - lastBlinkTime > BLINK_INTERVAL) {
            communicativeBlinkState = !communicativeBlinkState;
            lastBlinkTime = now;
            
            // Only update colors if tech category is visible
            if (GALAXY_VISIBILITY.tech && starSystem) {
                const params = getCurrentDrakeParams();
                updateGalaxySimulation(params);
            }
        }
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

// Toggle visibility of a category in the galaxy simulation
function toggleGalaxyCategory(category) {
    if (GALAXY_VISIBILITY.hasOwnProperty(category)) {
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
    return {
        Rstar: parseFloat(document.getElementById('Rstar').value),
        fp: parseFloat(document.getElementById('fp').value),
        ne: parseFloat(document.getElementById('ne').value),
        fl: parseFloat(document.getElementById('fl').value),
        fi: parseFloat(document.getElementById('fi').value),
        fc: parseFloat(document.getElementById('fc').value),
        L: parseFloat(document.getElementById('L').value)
    };
}

// Initialize legend click handlers
function initGalaxyLegendHandlers() {
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
            item.style.cursor = 'pointer';
            item.style.transition = 'opacity 0.2s ease';

            item.addEventListener('click', () => {
                toggleGalaxyCategory(category);
            });
        });
    });
    
    // Initialize legend UI to reflect default visibility state
    updateLegendUI();
}

// Initialize legend handlers when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalaxyLegendHandlers);
} else {
    initGalaxyLegendHandlers();
}
