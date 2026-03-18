let currentLang = localStorage.getItem('drake-lang') || 'en';

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
        
        // Also update title if a tooltip key exists
        const tooltipKey = key + '_tooltip';
        const tooltipText = t(tooltipKey);
        if (tooltipText !== tooltipKey) {
            el.setAttribute('title', tooltipText);
        }
    });

    renderTimeline();
    renderKeyConceptsCards();
    validateAndCalculate();
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







function validateAndCalculate(changedParameter) {
    const currentValues = getParameterValues();
    const N = calculateN(currentValues);
    const formattedN = formatResult(N);
    animateValue(currentN, N, 800);
    updateGalaxyVisualization(N);
    document.title = `N = ${formattedN} | ${t('title')}`;
    interpretResult(N);
    updateResultDetails(N);
    updateMagnitudeScale(N);
    const parameterToChart = changedParameter || 'Rstar';
    updateChart(parameterToChart, currentValues);
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










window.onload = function() {
    applyUrlParameters();
    initChart();
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
    
    const detailsElements = document.querySelectorAll('details');
    detailsElements.forEach(details => {
        details.addEventListener('toggle', () => {
            if (details.open) {
                detailsElements.forEach(otherDetails => {
                    if (otherDetails !== details && otherDetails.open) {
                        otherDetails.removeAttribute('open');
                    }
                });
            }
        });
    });
};
