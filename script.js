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
        description: 'The average number of stars formed in the Milky Way each year.',
        current: '1.5 – 3.0 stars/year',
        scientific: 'Measured via infrared observations of gas clouds. While the galaxy is billions of years old, it still produces "nurseries" where gravity collapses gas into new suns.',
        uncertainty: 'low',
        importance: 'This is the foundational "engine" of the galaxy. No stars means no planets, and no life.'
    },
    fp: {
        title: 'Fraction with Planets (f<sub>p</sub>)',
        description: 'The percentage of stars that possess planetary systems.',
        current: '0.8 – 1.0 (80% to 100%)',
        scientific: 'Recent exoplanet missions (Kepler, TESS) have revolutionized this. We now believe almost every star has at least one planet.',
        uncertainty: 'low',
        importance: 'A decade ago, we didn\'t know if planets were rare. Now we know they are the rule, not the exception.'
    },
    ne: {
        title: 'Habitable Planets (n<sub>e</sub>)',
        description: 'Number of Earth-like planets per system capable of supporting life.',
        current: '0.1 – 2.0',
        scientific: 'Focuses on the "Goldilocks Zone" where liquid water can exist. It considers rocky planets with stable orbits around stable stars.',
        uncertainty: 'medium',
        importance: 'Just because a planet exists doesn\'t mean it\'s habitable. It needs the right size, composition, and distance from its sun.'
    },
    fl: {
        title: 'Fraction Developing Life (f<sub>l</sub>)',
        description: 'The probability that life emerges on a habitable planet.',
        current: 'Speculative: 0.01 – 1.0',
        scientific: 'We only have one data point: Earth. Life appeared here almost as soon as the planet cooled, suggesting it might be an inevitable chemical process.',
        uncertainty: 'high',
        importance: 'This is a major "Biological Filter." If life is hard to start, the universe is a beautiful but dead wilderness.'
    },
    fi: {
        title: 'Intelligence (f<sub>i</sub>)',
        description: 'The probability that life evolves to become intelligent.',
        current: 'Unknown: 0.001 – 1.0',
        scientific: 'Earth had life for 3 billion years before intelligence. Evolution favors survival, not necessarily "thinking." Intelligence may be a rare evolutionary accident.',
        uncertainty: 'very high',
        importance: 'Even if the galaxy is full of "bacteria" or "dinosaurs," they won\'t build telescopes.'
    },
    fc: {
        title: 'Technology (f<sub>c</sub>)',
        description: 'Fraction of intelligent species that develop detectable technology.',
        current: 'Unknown: 0.1 – 0.2',
        scientific: 'Species could be intelligent (like dolphins) but lack the tools, environment, or resources to build radio communication.',
        uncertainty: 'very high',
        importance: 'This is what makes a civilization visible. Without "technosignatures," we will never find them.'
    },
    L: {
        title: 'Civilization Lifetime (L)',
        description: 'The number of years a technological species remains detectable.',
        current: 'Highly Speculative: 100 – 1,000,000 years',
        scientific: 'Do civilizations destroy themselves via climate change, war, or AI? Or do they survive for millions of years?',
        uncertainty: 'very high',
        importance: 'The most critical factor. If civilizations only last 1,000 years, they likely never exist at the same time as their neighbors.'
    }
};

const uncertaintyLevels = {
    low: { color: '#000000', label: 'Well Known' },
    medium: { color: '#666666', label: 'Moderate Uncertainty' },
    high: { color: '#999999', label: 'Highly Speculative' },
    'very high': { color: '#cccccc', label: 'Extremely Speculative' }
};

const MOBILE_BREAKPOINT = 768;

function formatResult(n) {
    if (n === 0) return "0";
    if (n > 10000 || n < 0.01) {
        return n.toExponential(2);
    }
    return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function getScenario(params) {
    const biologicalSuccess = params.fl * params.fi;
    const technologicalSuccess = params.fc;
    const longevity = params.L;

    if (longevity < 500) return {
        name: "The Shooting Star Scenario",
        desc: "Civilizations emerge frequently but vanish almost instantly. The galaxy is a graveyard of short-lived societies."
    };
    if (biologicalSuccess < 0.0001) return {
        name: "The Rare Earth Scenario",
        desc: "The universe is habitable, but the jump from chemistry to biology or intelligence is an incredibly rare miracle."
    };
    if (technologicalSuccess < 0.05) return {
        name: "The Silent Wilderness",
        desc: "The galaxy is teeming with life and intelligence, but they remain 'primitive' or choose to live without detectable technology."
    };
    if (longevity > 100000) return {
        name: "The Galactic Club",
        desc: "Civilizations survive for eons. The galaxy should be highly organized and filled with ancient, immortal societies."
    };
    return {
        name: "The Balanced Cosmos",
        desc: "A moderate universe where civilizations are spaced out both in distance and time."
    };
}

function updateValueAndRecalculate(paramId) {
    const input = document.getElementById(paramId);
    const display = document.getElementById(paramId + '-value');
    
    if (paramId === 'L') {
        display.textContent = Number(input.value).toLocaleString();
    } else {
        display.textContent = input.value;
    }
    
    validateAndCalculate(paramId);
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

    document.getElementById('result').innerText = formattedN;
    document.title = `N = ${formattedN} | Drake Equation`;

    interpretResult(N);

    const parameterToChart = changedParameter || 'Rstar';
    updateChart(parameterToChart, currentValues);
}

function interpretResult(N) {
    const interpretationEl = document.getElementById('result-interpretation');
    const currentValues = getParameterValues();
    const scenario = getScenario(currentValues);
    
    if (!interpretationEl) return;

    let interpretation = `<strong>${scenario.name}</strong><p>${scenario.desc}</p>`;
    
    if (N < 1) {
        interpretation += '<div class="filter-insight"><strong>Filter Insight:</strong> We are likely alone. The "Great Filter" is likely behind us (life or intelligence is the hard part).</div>';
    } else if (N < 100) {
        interpretation += '<div class="filter-insight"><strong>Filter Insight:</strong> Civilizations are rarities. The vast distances between them make contact a near-impossible dream.</div>';
    } else {
        interpretation += `<div class="filter-insight"><strong>Filter Insight:</strong> With ${formatResult(N)} civilizations, the Great Filter may be ahead of us. If they are common but we see nothing, they might all face a common cause of extinction.</div>`;
    }
    
    interpretationEl.innerHTML = interpretation;
    updateFermiParadox(N);
}

function updateFermiParadox(N) {
    const fermiDynamic = document.getElementById('fermi-dynamic');
    if (!fermiDynamic) return;
    
    let fermiText = '';
    
    if (N < 1) {
        fermiText = '<strong>With N < 1:</strong> The paradox is weak. If civilizations are this rare, we might genuinely be alone or the first to emerge.';
    } else if (N < 100) {
        fermiText = '<strong>With N ≈ ' + Math.round(N) + ':</strong> The paradox begins to emerge. Why haven\'t we detected any signals?';
    } else if (N < 10000) {
        fermiText = '<strong>With N ≈ ' + Math.round(N) + ':</strong> The paradox is significant! With thousands of civilizations, we should have seen something.';
    } else {
        fermiText = '<strong>With N ≈ ' + formatResult(N) + ':</strong> The paradox is at its most extreme! The galaxy should be teeming with life.';
    }
    
    fermiDynamic.innerHTML = fermiText;
}

function showTooltip(paramId) {
    const modal = document.getElementById('tooltip-modal');
    const data = tooltipData[paramId];
    
    if (!data || !modal) return;
    
    document.getElementById('tooltip-title').innerHTML = data.title;
    document.getElementById('tooltip-description').textContent = data.description;
    document.getElementById('tooltip-current').textContent = data.current;
    document.getElementById('tooltip-scientific').textContent = data.scientific;
    document.getElementById('tooltip-importance').textContent = data.importance;
    
    const uncertaintyEl = document.getElementById('tooltip-uncertainty');
    const uncertaintyInfo = uncertaintyLevels[data.uncertainty];
    uncertaintyEl.className = 'tooltip-uncertainty ' + data.uncertainty.replace(' ', '-');
    uncertaintyEl.textContent = 'Confidence Level: ' + uncertaintyInfo.label;
    
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
        shareButton.innerHTML = 'Copied!';
        shareButton.style.background = '#000000';
        shareButton.style.color = '#ffffff';
        
        setTimeout(() => {
            shareButton.innerHTML = originalContent;
            shareButton.style.background = '';
            shareButton.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy link: ', err);
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
    Chart.defaults.font.family = 'system-ui, -apple-system, sans-serif';

    const ctx = document.getElementById('drakeChart').getContext('2d');
    drakeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'N (Civilizations)',
                data: [],
                borderColor: '#000000',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderWidth: 1.5,
                tension: 0,
                fill: true,
                pointRadius: 0,
                pointHitRadius: 10
            }]
        },
        options: {
            animation: {
                duration: 400
            },
            responsive: true,
            plugins: {
                customCanvasBackgroundColor: {
                    color: '#ffffff',
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: { 
                    title: {
                        display: true,
                        text: 'Parameter Value',
                        color: '#1a1a1a',
                        font: { size: 11, weight: '600' }
                    },
                    grid: { color: '#eeeeee' },
                    ticks: {
                        color: '#666666',
                        font: { size: 10 },
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
                        color: '#1a1a1a',
                        font: { size: 11, weight: '600' }
                    },
                    grid: { color: '#eeeeee' },
                    ticks: {
                        color: '#666666',
                        font: { size: 10 },
                        callback: function(value, index, values) {
                            if (value >= 1) return Math.round(value).toLocaleString();
                            return value.toFixed(2);
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
        drakeChart.options.plugins.customCanvasBackgroundColor.color = 'white';
        drakeChart.update('none');
        const link = document.createElement('a');
        link.href = drakeChart.toBase64Image();
        link.download = 'drake-equation-chart.png';
        link.click();
        drakeChart.options.plugins.customCanvasBackgroundColor.color = 'transparent';
        drakeChart.update('none');
    });

    const shareBtn = document.getElementById('share-btn');
    shareBtn.addEventListener('click', generateShareLink);
}

function updateChart(parameter, currentValues) {
    const values = [];
    const results = [];
    const baseValue = currentValues[parameter];
    
    for (let i = 0; i < 50; i++) {
        const variedValue = baseValue * (i / 25);
        values.push(variedValue);
        const chartPointParams = { ...currentValues };
        chartPointParams[parameter] = variedValue;
        results.push(calculateN(chartPointParams));
    }
    
    drakeChart.data.labels = values;
    drakeChart.data.datasets[0].data = results;
    drakeChart.options.scales.x.title.text = parameterDescriptions[parameter];
    drakeChart.update();

    const explanationElement = document.getElementById('chart-explanation');
    if (explanationElement) {
        const description = parameterDescriptions[parameter] || 'the selected parameter';
        explanationElement.innerHTML = `Varying ${description} while keeping others constant shows how sensitive the total estimate N is to this specific factor.`;
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
            input.setAttribute('step', 'any');
            input.oninput = () => updateValueAndRecalculate(id);
        } else {
            input.type = 'range';
            input.style.width = '100%';
            input.setAttribute('step', defaultValues[id] > 1 ? '1' : '0.01');
            if (id === 'Rstar' || id === 'ne') input.setAttribute('step', '0.1');
            if (id === 'L') input.setAttribute('step', '1000');
            input.oninput = () => updateValueAndRecalculate(id);
        }
    });
}

window.onload = function() {
    applyUrlParameters();
    initChart();
    setupFormForScreenSize();
    resetForm();

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const presetName = this.getAttribute('data-preset');
            if (presets[presetName]) {
                applyPreset(presets[presetName]);
                validateAndCalculate('Rstar');
                this.style.transform = 'scale(0.95)';
                setTimeout(() => { this.style.transform = ''; }, 150);
            }
        });
    });

    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            const paramId = this.getAttribute('data-param');
            showTooltip(paramId);
        });
    });

    const tooltipClose = document.querySelector('.tooltip-close');
    if (tooltipClose) { tooltipClose.addEventListener('click', hideTooltip); }

    const tooltipModal = document.getElementById('tooltip-modal');
    if (tooltipModal) {
        tooltipModal.addEventListener('click', function(e) {
            if (e.target === this) { hideTooltip(); }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { hideTooltip(); }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { setupFormForScreenSize(); }, 250);
    });
};
