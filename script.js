const defaultValues = {
    Rstar: 1.5,
    fp: 0.5,
    ne: 2,
    fl: 0.1,
    fi: 0.01,
    fc: 0.1,
    L: 10000
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

function validateAndCalculate(changedParameter) {
    // Get values from input fields
    const Rstar = parseFloat(document.getElementById('Rstar').value);
    const fp = parseFloat(document.getElementById('fp').value);
    const ne = parseFloat(document.getElementById('ne').value);
    const fl = parseFloat(document.getElementById('fl').value);
    const fi = parseFloat(document.getElementById('fi').value);
    const fc = parseFloat(document.getElementById('fc').value);
    const L = parseFloat(document.getElementById('L').value);

    // Calculate the result using the Drake Equation
    const N = Rstar * fp * ne * fl * fi * fc * L;

    const formattedN = formatResult(N);

    // Update the result on the page and in the browser tab title
    document.getElementById('result').innerText = formattedN;
    document.title = `N = ${formattedN} | Drake Equation`;

    // Determine which parameter's effect to show on the chart
    const parameterToChart = changedParameter || 'Rstar'; // Default to Rstar if no specific param changed

    // Update chart for the last changed parameter
    updateChart(parameterToChart);
}

function resetForm() {
    for (const paramId in defaultValues) {
        const slider = document.getElementById(paramId);
        const display = document.getElementById(paramId + '-value');
        const defaultValue = defaultValues[paramId];

        if (slider && display) {
            slider.value = defaultValue;
            if (paramId === 'L') {
                display.textContent = Number(defaultValue).toLocaleString();
            } else {
                display.textContent = defaultValue;
            }
        }
    }
    validateAndCalculate('Rstar');
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
                borderColor: 'rgb(247, 191, 32)',
                tension: 0.1
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
                        color: 'rgba(0, 0, 0, 0.8)'
                    }
                }
            },
            scales: {
                x: { 
                    title: {
                        display: true,
                        text: 'Parameter Value',
                        color: 'rgba(0, 0, 0, 0.8)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.3)'
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.8)',
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
                        color: 'rgba(0, 0, 0, 0.8)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.3)'
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.8)',
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


function updateChart(parameter) {
    const values = [];
    const results = [];
    
    // Get the current value of the parameter
    const currentValue = parseFloat(document.getElementById(parameter).value);
    
    // Generate 50 points for the chart
    for (let i = 0; i < 50; i++) {
        const value = currentValue * (i / 25); // This will create a range from 0 to 2 times the current value
        values.push(value);
        
        // Clone current form values
        const formData = new FormData(document.getElementById('drake-form'));
        formData.set(parameter, value);
        
        // Calculate N for this point using the Drake equation
        const Rstar = parseFloat(formData.get('Rstar'));
        const fp = parseFloat(formData.get('fp'));
        const ne = parseFloat(formData.get('ne'));
        const fl = parseFloat(formData.get('fl'));
        const fi = parseFloat(formData.get('fi'));
        const fc = parseFloat(formData.get('fc'));
        const L = parseFloat(formData.get('L'));
        
        const N = Rstar * fp * ne * fl * fi * fc * L;
        results.push(N);
    }
    
    drakeChart.data.labels = values;
    drakeChart.data.datasets[0].data = results;
    drakeChart.options.scales.x.title.text = parameter;
    
    const isLog = document.getElementById('scale-toggle').checked;
    drakeChart.options.scales.y.type = isLog ? 'logarithmic' : 'linear';
    drakeChart.update();

    // Update the dynamic explanation text
    const explanationElement = document.getElementById('chart-explanation');
    if (explanationElement) {
        const description = parameterDescriptions[parameter] || 'one of the key parameters';
        explanationElement.innerHTML = `The chart illustrates how this number changes based on ${description} — one of the key parameters in the Drake Equation.`;
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
    resetForm(); // Load default values and perform initial calculation

    // Add a listener to adjust the form when the window is resized
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            setupFormForScreenSize();
        }, 250); // Debounce to avoid excessive calls
    });
};
