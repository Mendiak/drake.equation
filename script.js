let currentLang = localStorage.getItem('drake-lang') || 'en';

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
    optimistic: { Rstar: 7, fp: 1, ne: 5, fl: 1, fi: 1, fc: 0.2, L: 1000000 },
    scientific: { Rstar: 1.5, fp: 0.5, ne: 2, fl: 0.1, fi: 0.01, fc: 0.1, L: 10000 },
    pessimistic: { Rstar: 1, fp: 0.2, ne: 0.1, fl: 0.01, fi: 0.001, fc: 0.01, L: 100 }
};

const uncertaintyLevels = {
    low: { color: '#000000', labelKey: 'low' },
    medium: { color: '#666666', labelKey: 'medium' },
    high: { color: '#999999', labelKey: 'high' },
    'very high': { color: '#cccccc', labelKey: 'very_high' }
};

const MOBILE_BREAKPOINT = 768;

function t(key) {
    const keys = key.split('.');
    let value = translations[currentLang];
    for (const k of keys) {
        if (value) value = value[k];
        else return key;
    }
    return value || key;
}

function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('drake-lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = t(key);
    });

    renderTimeline();
    validateAndCalculate();
}

function renderTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const timelineData = translations[currentLang].timeline;
    container.innerHTML = timelineData.map(item => `
        <div class="timeline-item">
            <div class="timeline-year">${item.year}</div>
            <div class="timeline-content">
                <strong>${item.title}</strong>
                <p>${item.desc}</p>
                ${item.wiki ? `<a href="${item.wiki}" target="_blank" rel="noopener noreferrer" class="timeline-link">Learn more →</a>` : ''}
            </div>
        </div>
    `).join('');
}

function formatResult(n) {
    if (n === 0) return "0";
    if (n >= 1e9) {
        const billions = n / 1e9;
        if (currentLang === 'es') {
            return billions >= 1000 ? (billions/1000).toFixed(1) + " billones" : billions.toFixed(0) + " mil millones";
        }
        return billions.toFixed(1) + " billion";
    }
    if (n >= 10000) return Math.round(n).toLocaleString(currentLang);
    if (n < 0.01) {
        if (n === 0) return "0";
        const inverse = Math.round(1 / n);
        return `< 1/${inverse.toLocaleString(currentLang)}`;
    }
    return n.toLocaleString(currentLang, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function getScenario(params) {
    const biologicalSuccess = params.fl * params.fi;
    const technologicalSuccess = params.fc;
    const longevity = params.L;

    if (longevity < 500) return t('scenarios.shooting_star');
    if (biologicalSuccess < 0.0001) return t('scenarios.rare_earth');
    if (technologicalSuccess < 0.05) return t('scenarios.silent_wilderness');
    if (longevity > 100000) return t('scenarios.galactic_club');
    return t('scenarios.balanced');
}

function updateValueAndRecalculate(paramId) {
    const input = document.getElementById(paramId);
    const display = document.getElementById(paramId + '-value');
    
    // 1. Limpiar resaltados anteriores
    document.querySelectorAll('.active-param').forEach(el => el.classList.remove('active-param'));
    
    // 2. Resaltar en la ecuación
    const eqSpan = document.getElementById('eq-' + paramId);
    if (eqSpan) eqSpan.classList.add('active-param');

    // 3. Resaltar la etiqueta del slider (el texto dentro del label)
    const labelSpan = document.querySelector(`label[for="${paramId}"] span:first-child`);
    if (labelSpan) labelSpan.classList.add('active-param');

    if (paramId === 'L') display.textContent = Number(input.value).toLocaleString(currentLang);
    else display.textContent = input.value;
    
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

let currentN = 0;
let animationFrame;

function animateValue(start, end, duration) {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    const startTime = performance.now();
    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const value = start + (end - start) * easeProgress;
        document.getElementById('result').innerText = formatResult(value);
        if (progress < 1) animationFrame = requestAnimationFrame(update);
        else currentN = end;
    }
    animationFrame = requestAnimationFrame(update);
}

function updateGalaxyVisualization(N) {
    const galaxy = document.getElementById('galaxy-viz');
    if (!galaxy) return;
    const targetCount = Math.min(Math.floor(N), 500); 
    const currentDots = galaxy.querySelectorAll('.galaxy-dot');
    const currentCount = currentDots.length;

    if (targetCount > currentCount) {
        const toAdd = targetCount - currentCount;
        for (let i = 0; i < toAdd; i++) {
            const dot = document.createElement('div');
            dot.className = 'galaxy-dot';
            dot.style.left = Math.random() * 100 + '%';
            dot.style.top = Math.random() * 100 + '%';
            const opacity = 0.2 + Math.random() * 0.8;
            galaxy.appendChild(dot);
            setTimeout(() => { dot.style.opacity = opacity; }, 10);
        }
    } else if (targetCount < currentCount) {
        const toRemove = currentCount - targetCount;
        for (let i = 0; i < toRemove; i++) {
            const dot = currentDots[i];
            dot.style.opacity = '0';
            setTimeout(() => { if (dot.parentNode) galaxy.removeChild(dot); }, 1000);
        }
    }
}

function validateAndCalculate(changedParameter) {
    const currentValues = getParameterValues();
    const N = calculateN(currentValues);
    const formattedN = formatResult(N);
    animateValue(currentN, N, 800);
    updateGalaxyVisualization(N);
    document.title = `N = ${formattedN} | ${t('title')}`;
    interpretResult(N);
    const parameterToChart = changedParameter || 'Rstar';
    updateChart(parameterToChart, currentValues);
}

function interpretResult(N) {
    const interpretationEl = document.getElementById('result-interpretation');
    const currentValues = getParameterValues();
    const scenario = getScenario(currentValues);
    if (!interpretationEl) return;
    const avgDistance = N >= 1 ? Math.round(100000 / Math.sqrt(N)) : null;
    const starRatio = N >= 1 ? (200000000000 / N).toLocaleString(currentLang, { maximumFractionDigits: 0 }) : null;
    let interpretation = `<strong>${scenario.name}</strong><p>${scenario.desc}</p>`;
    if (N >= 1) {
        interpretation += `<div class="cosmic-context">
            <div class="context-item"><small>${t('context.nearest')}</small><span>~${avgDistance.toLocaleString(currentLang)} ${t('context.unit_ly')}</span></div>
            <div class="context-item"><small>${t('context.star_ratio')}</small><span>${t('context.unit_stars').replace('{n}', starRatio)}</span></div>
        </div>`;
    }
    if (N < 1) interpretation += `<div class="filter-insight">${t('context.filter_alone')}</div>`;
    else if (N < 100) interpretation += `<div class="filter-insight">${t('context.filter_rare')}</div>`;
    else interpretation += `<div class="filter-insight">${t('context.filter_common').replace('{n}', formatResult(N))}</div>`;
    interpretation += `<div class="scientific-note">${t('context.scientific_note')}</div>`;
    interpretationEl.innerHTML = interpretation;
    updateFermiParadox(N);
}

function updateFermiParadox(N) {
    const fermiDynamic = document.getElementById('fermi-dynamic');
    if (!fermiDynamic) return;
    let fermiText = '';
    if (N < 1) fermiText = t('fermi_dynamic.weak');
    else if (N < 100) fermiText = t('fermi_dynamic.start').replace('{n}', Math.round(N));
    else if (N < 10000) fermiText = t('fermi_dynamic.significant').replace('{n}', Math.round(N));
    else fermiText = t('fermi_dynamic.extreme').replace('{n}', formatResult(N));
    fermiDynamic.innerHTML = fermiText;
}

function showTooltip(paramId) {
    const modal = document.getElementById('tooltip-modal');
    const data = t('tooltips.' + paramId);
    if (!data || !modal) return;
    document.getElementById('tooltip-title').innerHTML = data.title;
    document.getElementById('tooltip-description').textContent = data.description;
    document.getElementById('tooltip-current').textContent = data.current;
    document.getElementById('tooltip-scientific').textContent = data.scientific;
    document.getElementById('tooltip-importance').textContent = data.importance;
    const uncertaintyEl = document.getElementById('tooltip-uncertainty');
    const levelData = uncertaintyLevels[data.uncertainty];
    const uncertaintyLabel = t('uncertainty.' + levelData.labelKey);
    uncertaintyEl.className = 'tooltip-uncertainty ' + data.uncertainty.replace(' ', '-');
    uncertaintyEl.textContent = `${currentLang === 'es' ? 'Nivel de confianza' : 'Confidence Level'}: ${uncertaintyLabel}`;
    modal.style.display = 'flex';
}

function hideTooltip() {
    const modal = document.getElementById('tooltip-modal');
    if (modal) modal.style.display = 'none';
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
            display.textContent = paramId === 'L' ? Number(value).toLocaleString(currentLang) : value;
        }
    }
}

let drakeChart;
let funnelChart;

function generateShareLink() {
    const params = new URLSearchParams();
    for (const paramId in defaultValues) params.append(paramId, document.getElementById(paramId).value);
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        const shareButton = document.getElementById('share-btn');
        const originalContent = shareButton.innerHTML;
        shareButton.innerHTML = currentLang === 'es' ? '¡Copiado!' : 'Copied!';
        setTimeout(() => { shareButton.innerHTML = originalContent; }, 2000);
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
        data: { labels: [], datasets: [{ label: 'N', data: [], borderColor: '#000000', backgroundColor: 'rgba(0, 0, 0, 0.05)', borderWidth: 1.5, tension: 0, fill: true, pointRadius: 0 }] },
        options: {
            animation: { duration: 400 },
            responsive: true,
            plugins: { customCanvasBackgroundColor: { color: '#ffffff' }, legend: { display: false } },
            scales: {
                x: { title: { display: true, text: t('chart_axis_x'), font: { size: 11, weight: '600' } }, ticks: { callback: value => Number(drakeChart.data.labels[value]).toFixed(2) } },
                y: { type: 'logarithmic', title: { display: true, text: 'N', font: { size: 11, weight: '600' } }, ticks: { callback: value => value >= 1 ? Math.round(value).toLocaleString(currentLang) : value.toFixed(2) } }
            }
        },
        plugins: [backgroundPlugin]
    });
    const funnelCtx = document.getElementById('funnelChart').getContext('2d');
    funnelChart = new Chart(funnelCtx, {
        type: 'bar',
        data: { labels: [], datasets: [{ data: [], backgroundColor: '#000000', borderWidth: 0, barPercentage: 0.8 }] },
        options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } }, scales: { x: { type: 'logarithmic', ticks: { callback: v => v >= 1e9 ? (v/1e9)+'B' : v >= 1e6 ? (v/1e6)+'M' : v >= 1e3 ? (v/1e3)+'k' : v } } } }
    });
    document.getElementById('scale-toggle').addEventListener('change', (e) => { drakeChart.options.scales.y.type = e.target.checked ? 'logarithmic' : 'linear'; drakeChart.update(); });
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
                const percentage = (ratio * 100).toFixed(i === 1 || i === 2 ? 0 : 2);
                const prob = currentLang === 'es' ? (ratio < 0.1 ? `Solo 1 de cada ${Math.round(1/ratio)}` : `${percentage}%`) : (ratio < 0.1 ? `Only 1 in ${Math.round(1/ratio)}` : `${percentage}%`);
                retentionText = `<span class="funnel-percentage">${prob} ${currentLang === 'es' ? 'superan este filtro' : 'pass this filter'}</span>`;
            }
            return `<div class="funnel-step-info"><span class="funnel-step-label">${t(`funnel_steps.${s.key}`)}</span><span class="funnel-step-value">${formatResult(s.val)}</span>${retentionText}<p class="funnel-step-desc">${t(`funnel_insights.${s.key}`)}</p></div>`;
        }).join('');
    }
}

function setupFormForScreenSize() {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const formInputs = ['Rstar', 'fp', 'ne', 'fl', 'fi', 'fc', 'L'];
    formInputs.forEach(id => {
        const input = document.getElementById(id);
        if (isMobile) { input.type = 'number'; input.setAttribute('step', 'any'); }
        else { input.type = 'range'; input.setAttribute('step', defaultValues[id] > 1 ? '1' : '0.01'); if (id === 'Rstar' || id === 'ne') input.setAttribute('step', '0.1'); if (id === 'L') input.setAttribute('step', '1000'); }
    });
}

window.onload = function() {
    applyUrlParameters();
    initChart();
    setupFormForScreenSize();
    updateLanguage(currentLang);
    const scientificBtn = document.querySelector('[data-preset="scientific"]');
    if (scientificBtn) scientificBtn.classList.add('active-preset');
    resetForm();
    document.querySelectorAll('.lang-btn').forEach(btn => { btn.addEventListener('click', () => updateLanguage(btn.getAttribute('data-lang'))); });
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const presetName = this.getAttribute('data-preset');
            if (presets[presetName]) {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active-preset'));
                this.classList.add('active-preset');
                applyPreset(presets[presetName]);
                validateAndCalculate('Rstar');
            }
        });
    });
    document.querySelectorAll('.info-icon').forEach(icon => { icon.addEventListener('click', (e) => showTooltip(e.target.getAttribute('data-param'))); });
    const tooltipModal = document.getElementById('tooltip-modal');
    if (tooltipModal) { tooltipModal.addEventListener('click', (e) => { if (e.target === tooltipModal || e.target.classList.contains('tooltip-close')) hideTooltip(); }); }
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTooltip(); });
    window.addEventListener('resize', () => setupFormForScreenSize());
};
