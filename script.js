function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    const range = end - start;
    const minTimer = 50;
    let stepTime = Math.abs(Math.floor(duration / range));
    stepTime = Math.max(stepTime, minTimer);
    let startTime = new Date().getTime();
    let endTime = startTime + duration;
    let timer;

    function run() {
        let now = new Date().getTime();
        let remaining = Math.max((endTime - now) / duration, 0);
        let value = Math.round(end - (remaining * range));
        obj.innerText = value.toFixed(2);
        if (value == end) {
            clearInterval(timer);
        }
    }

    timer = setInterval(run, stepTime);
    run();
}



function validateAndCalculate() {
    // Get values from input fields
    const Rstar = parseFloat(document.getElementById('Rstar').value);
    const fp = parseFloat(document.getElementById('fp').value);
    const ne = parseFloat(document.getElementById('ne').value);
    const fl = parseFloat(document.getElementById('fl').value);
    const fi = parseFloat(document.getElementById('fi').value);
    const fc = parseFloat(document.getElementById('fc').value);
    const L = parseFloat(document.getElementById('L').value);

    let isValid = true;

    // Validate values
    if (isNaN(Rstar) || Rstar < 0) {
        alert("Please enter a valid value for the star formation rate (R*).");
        isValid = false;
    }
    if (isNaN(fp) || fp < 0 || fp > 1) {
        alert("Please enter a valid value for the fraction of stars with planetary systems (fₚ).");
        isValid = false;
    }
    if (isNaN(ne) || ne < 0) {
        alert("Please enter a valid value for the number of planets per star system that can support life (nₑ).");
        isValid = false;
    }
    if (isNaN(fl) || fl < 0 || fl > 1) {
        alert("Please enter a valid value for the fraction of those planets where life develops (fₗ).");
        isValid = false;
    }
    if (isNaN(fi) || fi < 0 || fi > 1) {
        alert("Please enter a valid value for the fraction of planets with life where intelligent life evolves (fᵢ).");
        isValid = false;
    }
    if (isNaN(fc) || fc < 0 || fc > 1) {
        alert("Please enter a valid value for the fraction of civilizations that develop detectable technology (f꜀).");
        isValid = false;
    }
    if (isNaN(L) || L < 0) {
        alert("Please enter a valid value for the duration of the detectable phase of the civilization (L).");
        isValid = false;
    }

    if (isValid) {
        // Calculate the result using the Drake Equation
        const N = Rstar * fp * ne * fl * fi * fc * L;
    
        // Animate the result on the page
        animateValue('result', 0, N, 2000); // 2000 ms duration
    
        // Determine the last changed parameter
        const formInputs = ['Rstar', 'fp', 'ne', 'fl', 'fi', 'fc', 'L'];
        const lastChangedParameter = formInputs.find(input => document.getElementById(input) === document.activeElement) || 'Rstar';
    
        // Update chart for the last changed parameter
        updateChart(lastChangedParameter);
    }
    
}

let drakeChart;

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
            responsive: true,
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
                        color: 'rgba(0, 0, 0, 0.8)'
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
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(0, 0, 0, 0.8)'
                    }
                }
            }
        }
    });
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
    drakeChart.options.scales.y.type = 'logarithmic';
    drakeChart.update();
}


// Call initChart when the page loads
window.onload = function() {
    initChart();
    clearForm();
};

function clearForm() {
    document.getElementById('drake-form').reset();
}

