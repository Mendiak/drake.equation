const defaultValues = {
    Rstar: 1.5,
    fp: 0.5,
    ne: 2,
    fl: 0.1,
    fi: 0.01,
    fc: 0.1,
    L: 10000
};

const presets = {
    optimistic: {
        Rstar: 7,
        fp: 1,
        ne: 5,
        fl: 1,
        fi: 1,
        fc: 0.2,
        L: 1000000
    },
    scientific: {
        Rstar: 1.5,
        fp: 0.5,
        ne: 2,
        fl: 0.1,
        fi: 0.01,
        fc: 0.1,
        L: 10000
    },
    pessimistic: {
        Rstar: 1,
        fp: 0.2,
        ne: 0.1,
        fl: 0.01,
        fi: 0.001,
        fc: 0.01,
        L: 100
    }
};

const parameterDescriptions = {
    Rstar: 'the star formation rate (R*)',
    fp: 'the fraction of stars with planetary systems (f<sub>p</sub>)',
    ne: 'the number of planets per star system that can support life (n<sub>e</sub>)',
    fl: 'the fraction of those planets where life develops (f<sub>l</sub>)',
    fi: 'the fraction of planets with life where intelligent life evolves (f<sub>i</sub>)',
    fc: 'the fraction of civilizations that develop detectable technology (f<sub>c</sub>)',
    L: 'the duration of the detectable phase of the civilization (L)'
};

const tooltipData = {
    Rstar: {
        title: 'Star Formation Rate (R*)',
        description: 'The average rate at which new stars form in our galaxy per year.',
        current: 'Current estimates: 1.5-3 stars/year',
        scientific: 'Well-measured through infrared observations and stellar population studies. The Milky Way contains ~200-400 billion stars.',
        uncertainty: 'low',
        importance: 'This is the foundation of the equation and one of the best-known parameters.'
    },
    fp: {
        title: 'Fraction with Planets (f<sub>p</sub>)',
        description: 'What fraction of stars have planetary systems?',
        current: 'Current estimates: 0.5-1.0 (50-100%)',
        scientific: 'Kepler mission data suggests nearly all stars have planets. Over 5,000 exoplanets confirmed as of 2023.',
        uncertainty: 'low',
        importance: 'Revolutionary discovery: planets are the rule, not the exception!'
    },
    ne: {
        title: 'Habitable Planets per System (n<sub>e</sub>)',
        description: 'Average number of planets per star that could potentially support life.',
        current: 'Current estimates: 0.4-2.0',
        scientific: 'Based on planets in the "habitable zone" where liquid water could exist. Our solar system has 1-2 (Earth, possibly Mars).',
        uncertainty: 'medium',
        importance: 'Depends on the definition of "habitable" - liquid water? Earth-like atmosphere?'
    },
    fl: {
        title: 'Fraction Developing Life (f<sub>l</sub>)',
        description: 'On what fraction of suitable planets does life actually appear?',
        current: 'Unknown: 0.01-1.0',
        scientific: 'We only have one data point: Earth. Life appeared very quickly here (~500M years after formation), suggesting it might be common.',
        uncertainty: 'high',
        importance: 'The great unknown! Is life inevitable given the right conditions, or incredibly rare?'
    },
    fi: {
        title: 'Fraction Developing Intelligence (f<sub>i</sub>)',
        description: 'On what fraction of life-bearing planets does intelligent life emerge?',
        current: 'Unknown: 0.001-1.0',
        scientific: 'Earth had life for 3.5 billion years before intelligence. Took 99.9% of life\'s history to reach humans.',
        uncertainty: 'very high',
        importance: 'Is intelligence an inevitable outcome of evolution, or an unlikely accident?'
    },
    fc: {
        title: 'Fraction Developing Technology (f<sub>c</sub>)',
        description: 'What fraction of intelligent species develop detectable technology?',
        current: 'Unknown: 0.01-0.2',
        scientific: 'Humans developed radio ~100 years ago. Many intelligent species on Earth (dolphins, octopi) never developed technology.',
        uncertainty: 'very high',
        importance: 'Intelligence ≠ technology. Does technology naturally follow from intelligence?'
    },
    L: {
        title: 'Civilization Lifetime (L)',
        description: 'How long do technological civilizations broadcast detectable signals?',
        current: 'Unknown: 100-1,000,000 years',
        scientific: 'Humans have been broadcasting for ~100 years. Will we continue for 1,000? 1,000,000? Or self-destruct?',
        uncertainty: 'very high',
        importance: 'The most speculative parameter. Determines if civilizations overlap in time.'
    }
};

const uncertaintyLevels = {
    low: { color: '#10b981', label: 'Well Known' },
    medium: { color: '#f59e0b', label: 'Moderate Uncertainty' },
    high: { color: '#ef4444', label: 'Highly Speculative' },
    'very high': { color: '#dc2626', label: 'Extremely Speculative' }
};

const MOBILE_BREAKPOINT = 768;

function formatResult(n) {
    if (n === 0) return "0";
    // Use exponential for very large or very small numbers
    if (n > 10000 || n < 0.01) {
        return n.toExponential(2);
    }
    return n.toFixed(2);
}

function updateValueAndRecalculate(paramId) {
    const input = document.getElementById(paramId);
    const display = document.getElementById(paramId + '-value');
    
    if (input.type === 'range') {
        // For L, use a more readable format
        if (paramId === 'L') {
            display.textContent = Number(input.value).toLocaleString();
        } else {
            display.textContent = input.value;
        }
        validateAndCalculate(paramId);
    } else { // For number inputs, just update the display
        display.textContent = input.value;
    }
}

function getParameterValues() {
    const values = {};
    for (const paramId in defaultValues) {
        values[paramId] = parseFloat(document.getElementById(paramId).value);
    }
    return values;
}

function calculateN(params) {
    return params.Rstar * params.fp * params.ne * params.fl * params.fi * params.fc * params.L;
}

function validateAndCalculate(changedParameter) {
    const currentValues = getParameterValues();
    const N = calculateN(currentValues);

    const formattedN = formatResult(N);

    // Update the result on the page and in the browser tab title
    document.getElementById('result').innerText = formattedN;
    document.title = `N = ${formattedN} | Drake Equation`;

    // Update result interpretation
    interpretResult(N);

    // Determine which parameter's effect to show on the chart
    const parameterToChart = changedParameter || 'Rstar'; // Default to Rstar if no specific param changed

    // Update chart for the last changed parameter
    updateChart(parameterToChart, currentValues);
}

function interpretResult(N) {
    const interpretationEl = document.getElementById('result-interpretation');
    if (!interpretationEl) return;

    let interpretation = '';
    
    if (N < 0.001) {
        interpretation = '🚫 Extremely unlikely: We might be alone in the galaxy, or civilizations are incredibly rare.';
    } else if (N < 1) {
        interpretation = '🌌 Very rare: Advanced civilizations exist, but they are extremely sparse across the galaxy.';
    } else if (N < 10) {
        interpretation = '🔭 Rare: A handful of civilizations might exist, but contact would be very difficult.';
    } else if (N < 100) {
        interpretation = '✨ Moderate: Dozens of civilizations could exist, making contact theoretically possible.';
    } else if (N < 1000) {
        interpretation = '🌟 Common: Hundreds of civilizations likely exist. The Fermi Paradox becomes more puzzling!';
    } else if (N < 10000) {
        interpretation = '🚀 Very common: Thousands of civilizations! Where is everybody?';
    } else {
        interpretation = '🌌👽 Abundant: The galaxy should be teeming with life. The Great Silence is deeply mysterious.';
    }
    
    interpretationEl.innerHTML = interpretation;
    
    // Update Fermi Paradox section
    updateFermiParadox(N);
}

function updateFermiParadox(N) {
    const fermiDynamic = document.getElementById('fermi-dynamic');
    if (!fermiDynamic) return;
    
    let fermiText = '';
    
    if (N < 1) {
        fermiText = '<strong>With N < 1:</strong> The paradox is less pronounced. If civilizations are this rare, we might genuinely be alone or one of very few. The "Great Filter" might be behind us - perhaps the emergence of life or intelligence is the incredibly rare step.';
    } else if (N < 100) {
        fermiText = '<strong>With N ≈ ' + Math.round(N) + ':</strong> The paradox begins to emerge. If dozens of civilizations exist, why haven\'t we detected any? Perhaps they\'re too far away, or we\'re looking in the wrong way, or they choose not to communicate.';
    } else if (N < 10000) {
        fermiText = '<strong>With N ≈ ' + Math.round(N) + ':</strong> The paradox is significant! With hundreds or thousands of civilizations, we should have seen <em>something</em>. This strongly suggests either: (1) civilizations don\'t last long, (2) they don\'t broadcast, or (3) we\'re missing something fundamental about how to detect them.';
    } else {
        fermiText = '<strong>With N ≈ ' + formatResult(N) + ':</strong> The paradox is at its most extreme! The galaxy should be teeming with civilizations. The complete silence is deeply puzzling. This suggests the "Great Filter" might be ahead of us - perhaps all advanced civilizations inevitably self-destruct, or they transcend physical existence in ways we can\'t detect.';
    }
    
    fermiDynamic.innerHTML = fermiText;
}

function showTooltip(paramId) {
    const modal = document.getElementById('tooltip-modal');
    const data = tooltipData[paramId];
    
    if (!data || !modal) return;
    
    // Populate tooltip content
    document.getElementById('tooltip-title').innerHTML = data.title;
    document.getElementById('tooltip-description').textContent = data.description;
    document.getElementById('tooltip-current').textContent = data.current;
    document.getElementById('tooltip-scientific').textContent = data.scientific;
    document.getElementById('tooltip-importance').textContent = data.importance;
    
    // Set uncertainty badge
    const uncertaintyEl = document.getElementById('tooltip-uncertainty');
    const uncertaintyInfo = uncertaintyLevels[data.uncertainty];
    uncertaintyEl.className = 'tooltip-uncertainty ' + data.uncertainty.replace(' ', '-');
    uncertaintyEl.textContent = '📊 Confidence Level: ' + uncertaintyInfo.label;
    
    // Show modal
    modal.style.display = 'flex';
}

function hideTooltip() {
    const modal = document.getElementById('tooltip-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function resetForm() {
    applyPreset(defaultValues);
    validateAndCalculate('Rstar');
}

function applyPreset(values) {
    for (const paramId in values) {
        const slider = document.getElementById(paramId);
        const display = document.getElementById(paramId + '-value');
        const value = values[paramId];

        if (slider && display) {
            slider.value = value;
            if (paramId === 'L') {
                display.textContent = Number(value).toLocaleString();
            } else {
                display.textContent = value;
            }
        }
    }
}

let drakeChart;

function generateShareLink() {
    const params = new URLSearchParams();
    for (const paramId in defaultValues) {
        const value = document.getElementById(paramId).value;
        params.append(paramId, value);
    }
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
        const shareButton = document.getElementById('share-btn');
        const originalContent = shareButton.innerHTML;
        shareButton.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
        shareButton.style.background = '#28a745'; // Success color
        
        setTimeout(() => {
            shareButton.innerHTML = originalContent;
            shareButton.style.background = ''; // Revert to original color
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy link: ', err);
        alert('Failed to copy link.');
    });
}

function applyUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams.entries()) {
        if (defaultValues.hasOwnProperty(key)) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) defaultValues[key] = numValue;
        }
    }
}

const backgroundPlugin = {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart, args, options) => {
        const {ctx} = chart;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = options.color || '#fff';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
};

function initChart() {
    Chart.defaults.font.family = '"Space Mono", monospace';

    const ctx = document.getElementById('drakeChart').getContext('2d');
    drakeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'N (Number of civilizations)',
                data: [],
                borderColor: 'rgb(6, 182, 212)',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            animation: {
                duration: 800, // Duration in milliseconds for a smooth transition
                easing: 'easeInOutCubic' // A smooth easing function
            },
            responsive: true,
            plugins: {
                customCanvasBackgroundColor: {
                    color: 'transparent',
                },
                legend: {
                    labels: {
                        color: 'rgba(248, 250, 252, 0.9)',
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                }
            },
            scales: {
                x: { 
                    title: {
                        display: true,
                        text: 'Parameter Value',
                        color: 'rgba(248, 250, 252, 0.9)',
                        font: {
                            size: 13,
                            weight: '600'
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.2)'
                    },
                    ticks: {
                        color: 'rgba(248, 250, 252, 0.8)',
                        callback: function(value, index, values) {
                            const label = this.getLabelForValue(value);
                            return Number(label).toFixed(2);
                        }
                    }
                },
                y: {
                    type: 'logarithmic',
                    title: {
                        display: true,
                        text: 'N',
                        color: 'rgba(248, 250, 252, 0.9)',
                        font: {
                            size: 13,
                            weight: '600'
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.2)'
                    },
                    ticks: {
                        color: 'rgba(248, 250, 252, 0.8)',
                        callback: function(value, index, values) {
                            return Number(value).toFixed(2);
                        }
                    }
                }
            }
        },
        plugins: [backgroundPlugin]
    });

    const scaleToggle = document.getElementById('scale-toggle');
    scaleToggle.addEventListener('change', () => {
        const isLog = scaleToggle.checked;
        drakeChart.options.scales.y.type = isLog ? 'logarithmic' : 'linear';
        drakeChart.update();
    });

    const downloadBtn = document.getElementById('download-chart-btn');
    downloadBtn.addEventListener('click', () => {
        // Temporarily set background to white for download
        drakeChart.options.plugins.customCanvasBackgroundColor.color = 'white';
        drakeChart.update('none'); // Re-render with no animation

        const link = document.createElement('a');
        link.href = drakeChart.toBase64Image();
        link.download = 'drake-equation-chart.png';
        link.click();

        // Revert background to transparent for on-screen display
        drakeChart.options.plugins.customCanvasBackgroundColor.color = 'transparent';
        drakeChart.update('none'); // Re-render with no animation
    });

    const shareBtn = document.getElementById('share-btn');
    shareBtn.addEventListener('click', generateShareLink);
}


function updateChart(parameter, currentValues) {
    const values = [];
    const results = [];
    
    const baseValue = currentValues[parameter];
    
    // Generate 50 points for the chart
    for (let i = 0; i < 50; i++) {
        const variedValue = baseValue * (i / 25); // This will create a range from 0 to 2 times the current value
        values.push(variedValue);
        
        // Create a copy of the parameters and change the one we're varying
        const chartPointParams = { ...currentValues };
        chartPointParams[parameter] = variedValue;
        
        const N = calculateN(chartPointParams);
        results.push(N);
    }
    
    drakeChart.data.labels = values;
    drakeChart.data.datasets[0].data = results;
    drakeChart.options.scales.x.title.text = parameterDescriptions[parameter];
    
    const isLog = document.getElementById('scale-toggle').checked;
    drakeChart.options.scales.y.type = isLog ? 'logarithmic' : 'linear';
    drakeChart.update();

    // Update the dynamic explanation text
    const explanationElement = document.getElementById('chart-explanation');
    if (explanationElement) {
        const description = parameterDescriptions[parameter] || 'el parámetro seleccionado';
        explanationElement.innerHTML = `El gráfico ilustra cómo cambia el resultado N al variar ${description}, uno de los parámetros clave de la Ecuación de Drake.`;
    }
}

function setupFormForScreenSize() {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const formInputs = ['Rstar', 'fp', 'ne', 'fl', 'fi', 'fc', 'L'];

    formInputs.forEach(id => {
        const input = document.getElementById(id);
        if (isMobile) {
            input.type = 'number';
            input.style.width = '100%';
            input.setAttribute('step', 'any'); // Allow any decimal for number inputs
            // Update display on input, but don't recalculate
            input.oninput = () => updateValueAndRecalculate(id);
        } else {
            input.type = 'range';
            input.style.width = '100%';
            input.setAttribute('step', defaultValues[id] > 1 ? '1' : '0.01'); // Restore original step for range
            if (id === 'Rstar' || id === 'ne') input.setAttribute('step', '0.1');
            if (id === 'L') input.setAttribute('step', '1000');
            // Recalculate in real-time for sliders
            input.oninput = () => updateValueAndRecalculate(id);
        }
    });

    // Toggle recalculate button visibility via CSS class for clarity if needed, but CSS handles it
}


// Call initChart when the page loads
window.onload = function() {
    applyUrlParameters(); // Check for and apply URL parameters first
    initChart();
    setupFormForScreenSize(); // Set up the form based on initial screen size
    resetForm(); // Load default values and perform initial calculation and chart generation

    // Add preset button listeners
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const presetName = this.getAttribute('data-preset');
            if (presets[presetName]) {
                applyPreset(presets[presetName]);
                validateAndCalculate('Rstar');
                
                // Visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }
        });
    });

    // Add tooltip event listeners
    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            const paramId = this.getAttribute('data-param');
            showTooltip(paramId);
        });
    });

    // Close tooltip on close button click
    const tooltipClose = document.querySelector('.tooltip-close');
    if (tooltipClose) {
        tooltipClose.addEventListener('click', hideTooltip);
    }

    // Close tooltip on background click
    const tooltipModal = document.getElementById('tooltip-modal');
    if (tooltipModal) {
        tooltipModal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideTooltip();
            }
        });
    }

    // Close tooltip on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideTooltip();
        }
    });

    // Add a listener to adjust the form when the window is resized
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            setupFormForScreenSize();
        }, 250); // Debounce to avoid excessive calls
    });
};

