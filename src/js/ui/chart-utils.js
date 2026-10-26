import { t, getLocale } from '../i18n/i18n.js';
import { calculateN, formatResult } from '../core/calculations.js';

let drakeChart;
let funnelChart;

function formatAxisTick(value) {
    if (value >= 1e9) return (value / 1e9).toLocaleString(getLocale(), { maximumFractionDigits: 1 }) + 'B';
    if (value >= 1e6) return (value / 1e6).toLocaleString(getLocale(), { maximumFractionDigits: 1 }) + 'M';
    if (value >= 1e3) return (value / 1e3).toLocaleString(getLocale(), { maximumFractionDigits: 1 }) + 'k';
    return Number(value.toPrecision(3)).toLocaleString(getLocale());
}

function formatAxisTitle(label) {
    const maxChars = window.innerWidth <= 600 ? 22 : 60;
    if (label.length <= maxChars) return label;

    const lines = [];
    let line = '';
    label.split(' ').forEach(word => {
        const candidate = line ? `${line} ${word}` : word;
        if (candidate.length <= maxChars) {
            line = candidate;
        } else {
            if (line) lines.push(line);
            line = word;
        }
    });
    if (line) lines.push(line);
    return lines;
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

const currentValuePlugin = {
    id: 'currentValueMarker',
    afterDraw: (chart) => {
        const markerValue = chart.options.plugins.currentValueMarker?.value;
        if (markerValue === undefined || markerValue === null) return;

        const xScale = chart.scales.x;
        if (!xScale) return;
        const labels = chart.data.labels;
        const labelIndex = labels.findIndex(v => Number(v) === Number(markerValue));
        if (labelIndex < 0) return;
        const x = xScale.getPixelForValue(labelIndex, labelIndex);
        if (x < xScale.left || x > xScale.right) return;

        const ctx = chart.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255, 50, 50, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.moveTo(x, chart.chartArea.top);
        ctx.lineTo(x, chart.chartArea.bottom);
        ctx.stroke();

        ctx.setLineDash([]);
        const label = t('chart_current_value');
        ctx.font = '11px system-ui, -apple-system, sans-serif';
        const textWidth = ctx.measureText(label).width;
        const labelY = chart.chartArea.top + 12;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(x - textWidth / 2 - 3, labelY - 9, textWidth + 6, 14);
        ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(label, x, labelY);
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
            maintainAspectRatio: false,
            onResize: (chart) => {
                if (!chart.$parameter) return;
                chart.options.scales.x.title.text = formatAxisTitle(t('labels.' + chart.$parameter));
            },
            plugins: { customCanvasBackgroundColor: { color: '#ffffff' }, currentValueMarker: { value: null }, legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    title: { display: true, text: t('chart_axis_x'), font: { size: 10, weight: '700' } },
                    ticks: {
                        callback: value => Number(drakeChart.data.labels[value]).toFixed(2),
                        autoSkip: true,
                        maxTicksLimit: 5,
                        maxRotation: 0,
                    }
                },
                y: {
                    type: 'logarithmic',
                    title: { display: true, text: 'N', font: { size: 10, weight: '700' } },
                    ticks: { maxTicksLimit: 5, callback: formatAxisTick }
                }
            }
        },
        plugins: [backgroundPlugin, currentValuePlugin]
    });
    const funnelCtx = document.getElementById('funnelChart').getContext('2d');
    funnelChart = new Chart(funnelCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: '#222222',
                borderWidth: 0,
                barPercentage: 0.8
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    type: 'logarithmic',
                    title: { display: true, text: 'N', font: { size: 10, weight: '700' } },
                    ticks: { callback: v => v >= 1e9 ? (v/1e9)+'B' : v >= 1e6 ? (v/1e6)+'M' : v >= 1e3 ? (v/1e3)+'k' : v }
                },
                y: {
                    grid: { display: false }
                }
            }
        }
    });
    document.getElementById('scale-toggle').addEventListener('change', (e) => {
        requestAnimationFrame(() => {
            drakeChart.options.scales.y.type = e.target.checked ? 'logarithmic' : 'linear';
            drakeChart.update();
            const label = e.target.closest('.toggle-group').querySelector('.toggle-label:last-of-type');
            if (label) {
                label.textContent = e.target.checked ? 'Log' : 'Lin';
            }
        });
    });
    document.getElementById('funnel-scale-toggle').addEventListener('change', (e) => {
        requestAnimationFrame(() => {
            funnelChart.options.scales.x.type = e.target.checked ? 'logarithmic' : 'linear';
            funnelChart.update();
            const label = e.target.closest('.toggle-group').querySelector('.toggle-label:last-of-type');
            if (label) {
                label.textContent = e.target.checked ? 'Log' : 'Lin';
            }
        });
    });
}

function updateChart(parameter, currentValues) {
    if (!drakeChart || !drakeChart.data) {
        console.warn('Chart not initialized yet');
        return;
    }

    const values = [];
    const results = [];
    const baseValue = currentValues[parameter];
    for (let i = 1; i <= 50; i++) {
        const variedValue = baseValue * (i / 25);
        values.push(variedValue);
        const chartPointParams = { ...currentValues };
        chartPointParams[parameter] = variedValue;
        results.push(calculateN(chartPointParams));
    }
    drakeChart.data.labels = values;
    drakeChart.data.datasets[0].data = results;
    drakeChart.$parameter = parameter;
    drakeChart.options.scales.x.title.text = formatAxisTitle(t('labels.' + parameter));
    drakeChart.options.plugins.currentValueMarker.value = baseValue;
    drakeChart.update('none');
    updateFunnel(currentValues);
    const explanationElement = document.getElementById('chart-explanation');
    if (explanationElement) {
        const paramName = t('labels.' + parameter);
        explanationElement.innerHTML = t('chart_explanation_base').replace('{param}', `<span class="active-param">${paramName}</span>`);
    }

    // Text equivalent of the chart for screen-reader and non-visual users.
    const tableElement = document.getElementById('chart-data-table');
    if (tableElement) {
        const paramName = t('labels.' + parameter);
        const sampleIndexes = [0, 4, 9, 14, 19, 24, 29, 34, 39, 44, 49];
        const formatParamValue = value => value >= 1000
            ? Math.round(value).toLocaleString(getLocale())
            : Number(value.toPrecision(3)).toLocaleString(getLocale());
        const rows = sampleIndexes.map(index => {
            const value = formatParamValue(values[index]);
            return `<tr><th scope="row">${value}</th><td>${formatResult(results[index])}</td></tr>`;
        }).join('');
        tableElement.innerHTML = `
            <table>
                <caption>${t('chart_table_caption').replace('{param}', paramName)}</caption>
                <thead>
                    <tr><th scope="col">${t('chart_table_param')}</th><th scope="col">${t('chart_table_result')}</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }
}

function updateFunnel(currentValues) {
    // The funnel is the equation itself, term by term. It starts from the stars
    // formed during the detectability window (R* · L), not from all 200 billion
    // stars: that is the only starting point whose product is exactly N.
    // The ne step counts planets per system, so it is the only bar that can be
    // larger than the previous one; every other step multiplies by a fraction.
    const stars = currentValues.Rstar * currentValues.L;
    const steps = [
        { key: 'total', val: stars },
        { key: 'planets', val: stars * currentValues.fp },
        { key: 'habitable', val: stars * currentValues.fp * currentValues.ne },
        { key: 'life', val: stars * currentValues.fp * currentValues.ne * currentValues.fl },
        { key: 'intelligence', val: stars * currentValues.fp * currentValues.ne * currentValues.fl * currentValues.fi },
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
                let probText;

                if (ratio >= 1.01) {
                    probText = `× ${ratio.toFixed(1)}`;
                } else if (ratio < 0.1) {
                    probText = t('funnel_one_in').replace('{val}', Math.round(1/ratio).toLocaleString(getLocale()));
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

export { initChart, updateChart };
