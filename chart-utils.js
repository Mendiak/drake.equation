// Drake Equation Charts & Visualization
// Chart.js initialization and management

let drakeChart;
let funnelChart;

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
        data: { labels: [], datasets: [{ label: 'N', data: [], borderColor: '#000000', backgroundColor: 'rgba(0, 0, 0, 0.05)', borderWidth: 1.5, tension: 0, fill: true, pointRadius: 0 }] },
        options: {
            animation: { duration: 400 },
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: { customCanvasBackgroundColor: { color: '#ffffff' }, legend: { display: false } },
            scales: {
                x: { 
                    title: { display: true, text: t('chart_axis_x'), font: { size: 11, weight: '600' } }, 
                    ticks: { 
                        callback: value => Number(drakeChart.data.labels[value]).toFixed(2),
                        autoSkip: true,
                        maxTicksLimit: 6,
                        maxRotation: 0,
                    } 
                },
                y: { type: 'logarithmic', title: { display: true, text: 'N', font: { size: 11, weight: '600' } }, ticks: { callback: value => value >= 1 ? Math.round(value).toLocaleString(currentLang) : value.toFixed(2) } }
            }
        },
        plugins: [backgroundPlugin]
    });
    const funnelCtx = document.getElementById('funnelChart').getContext('2d');
    funnelChart = new Chart(funnelCtx, {
        type: 'bar',
        data: { labels: [], datasets: [{ data: [], backgroundColor: '#000000', borderWidth: 0, barPercentage: 0.8 }] },
        options: { 
            indexAxis: 'y', 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }, 
            scales: { 
                x: { 
                    type: 'logarithmic', 
                    title: { display: true, text: 'N', font: { size: 11, weight: '600' } },
                    ticks: { callback: v => v >= 1e9 ? (v/1e9)+'B' : v >= 1e6 ? (v/1e6)+'M' : v >= 1e3 ? (v/1e3)+'k' : v } 
                } 
            } 
        } 
    });
    document.getElementById('scale-toggle').addEventListener('change', (e) => { drakeChart.options.scales.y.type = e.target.checked ? 'logarithmic' : 'linear'; drakeChart.update(); });
    document.getElementById('funnel-scale-toggle').addEventListener('change', (e) => { funnelChart.options.scales.x.type = e.target.checked ? 'logarithmic' : 'linear'; funnelChart.update(); });
    document.getElementById('download-chart-btn').addEventListener('click', () => { const link = document.createElement('a'); link.href = drakeChart.toBase64Image(); link.download = 'drake-equation.png'; link.click(); });
    document.getElementById('share-btn').addEventListener('click', generateShareLink);
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
    drakeChart.options.scales.x.title.text = t('labels.' + parameter);
    drakeChart.update();
    updateFunnel(currentValues);
    const explanationElement = document.getElementById('chart-explanation');
    if (explanationElement) {
        const paramName = t('labels.' + parameter);
        explanationElement.innerHTML = t('chart_explanation_base').replace('{param}', `<span class="active-param">${paramName}</span>`);
    }
}

function updateFunnel(currentValues) {
    const totalStars = 200000000000;
    const steps = [
        { key: 'total', val: totalStars },
        { key: 'planets', val: totalStars * currentValues.fp },
        { key: 'habitable', val: totalStars * currentValues.fp * currentValues.ne },
        { key: 'life', val: totalStars * currentValues.fp * currentValues.ne * currentValues.fl },
        { key: 'intelligence', val: totalStars * currentValues.fp * currentValues.ne * currentValues.fl * currentValues.fi },
        { key: 'tech', val: calculateN(currentValues) }
    ];
    funnelChart.data.labels = steps.map(s => t(`funnel_steps.${s.key}`));
    funnelChart.data.datasets[0].data = steps.map(s => s.val);
    funnelChart.update();
    const insightContainer = document.getElementById('funnel-insights');
    if (insightContainer) {
        insightContainer.innerHTML = steps.map((s, i) => {
            let retentionText = '';
            if (i > 0) {
                const ratio = s.val / steps[i-1].val;
                let probText = '';
                
                if (ratio < 0.1) {
                    probText = t('funnel_one_in').replace('{val}', Math.round(1/ratio).toLocaleString(currentLang));
                } else {
                    const percentage = (ratio * 100).toFixed(i === 1 || i === 2 ? 0 : 2);
                    probText = t('funnel_pass').replace('{val}', percentage + '%');
                }
                retentionText = `<span class="funnel-percentage">${probText}</span>`;
            }
            return `<div class="funnel-step-info"><span class="funnel-step-label">${t(`funnel_steps.${s.key}`)}</span><span class="funnel-step-value">${formatResult(s.val)}</span>${retentionText}<p class="funnel-step-desc">${t(`funnel_insights.${s.key}`)}</p></div>`;
        }).join('');
    }
}
