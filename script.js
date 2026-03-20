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

// Get correct decimal places for each parameter
function getDecimalPlaces(paramId) {
    const decimalMap = {
        'Rstar': 1, 'fp': 2, 'ne': 1,
        'fl': 4, 'fi': 4, 'fc': 2, 'L': 0
    };
    return decimalMap[paramId] || 2;
}

// Round to correct decimal places
function roundToDecimals(value, decimals) {
    if (decimals === 0) return Math.round(value);
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

// Convert between linear slider position and logarithmic value
// Useful for parameters with wide ranges (0.001 to 1)
function linearToLog(sliderValue, paramId) {
    const slider = document.getElementById(paramId);
    if (!slider) return sliderValue;
    
    // Apply log scaling only to parameters with very small minimum values
    const logParams = ['fi', 'fl'];
    if (!logParams.includes(paramId)) return sliderValue;
    
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    
    // Only apply log scaling if range spans multiple orders of magnitude
    if (max / min < 100) return sliderValue;
    
    // Map linear slider position (min to max) to logarithmic scale
    // Convert to 0-1 position, then use log scale, then convert back
    const position = (sliderValue - min) / (max - min);
    const logValue = min * Math.pow(max / min, position);
    
    return logValue;
}

function logToLinear(value, paramId) {
    const slider = document.getElementById(paramId);
    if (!slider) return value;
    
    const logParams = ['fi', 'fl'];
    if (!logParams.includes(paramId)) return value;
    
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    
    if (max / min < 100) return value;
    
    // Reverse mapping: from log value back to linear slider position
    const logRatio = Math.log(value / min) / Math.log(max / min);
    const sliderValue = min + logRatio * (max - min);
    
    return sliderValue;
}

// Snap slider values to sensible increments for easier selection
function snapToDetent(value, paramId) {
    const slider = document.getElementById(paramId);
    if (!slider) return value;
    
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const logParams = ['fi', 'fl'];
    const isLog = logParams.includes(paramId) && max / min >= 100;
    
    let snapPoints = [];
    
    if (isLog) {
        // Log-scaled: clean values
        snapPoints = [0.001, 0.003, 0.005, 0.01, 0.03, 0.05, 0.1, 0.3, 0.5, 1.0];
        snapPoints = snapPoints.filter(v => v >= min && v <= max);
        
        const logValue = linearToLog(value, paramId);
        let nearest = logValue;
        let minDistance = Math.abs(logValue - snapPoints[0]);
        
        for (const point of snapPoints) {
            const distance = Math.abs(logValue - point);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = point;
            }
        }
        
        if (minDistance < Math.max(nearest * 0.1, 0.001)) {
            return logToLinear(nearest, paramId);
        }
    } else {
        // Linear: generate sensible snap points based on parameter
        const range = max - min;
        const decimals = getDecimalPlaces(paramId);
        
        if (paramId === 'fp' || paramId === 'fc') {
            // For probabilities: snap to 0.1 increments
            for (let i = 0; i <= 10; i++) snapPoints.push(roundToDecimals(min + (i * 0.1), 2));
        } else if (paramId === 'Rstar' || paramId === 'ne') {
            // For 0.1-10 ranges: snap to 0.5 increments
            for (let i = Math.ceil(min * 10) / 10; i <= max; i += 0.5) {
                snapPoints.push(roundToDecimals(i, 1));
            }
        } else if (paramId === 'L') {
            // For large ranges: snap to round values
            snapPoints.push(min);
            let magnitude = 100;
            while (magnitude < max) {
                for (let mult of [1, 2, 5]) {
                    const point = mult * magnitude;
                    if (point >= min && point <= max) snapPoints.push(point);
                }
                magnitude *= 10;
            }
            snapPoints.push(max);
        }
        
        // Remove duplicates and sort
        snapPoints = [...new Set(snapPoints)].filter(v => v >= min && v <= max).sort((a, b) => a - b);
        
        let nearest = value;
        let minDistance = Math.abs(value - snapPoints[0]);
        
        for (const point of snapPoints) {
            const distance = Math.abs(value - point);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = point;
            }
        }
        
        if (minDistance < range * 0.05) {
            return roundToDecimals(nearest, decimals);
        }
    }
    
    return value;
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
    
    // Apply smart snapping to sensible values
    let value = parseFloat(input.value);
    let snappedValue = snapToDetent(value, paramId);
    
    // Update slider to snapped value if it changed
    if (Math.abs(snappedValue - value) > 0.0001) {
        input.value = snappedValue;
    }
    
    // 1. Limpiar resaltados anteriores
    document.querySelectorAll('.active-param').forEach(el => el.classList.remove('active-param'));
    
    // 2. Resaltar en la ecuación
    const eqSpan = document.getElementById('eq-' + paramId);
    if (eqSpan) eqSpan.classList.add('active-param');

    // 3. Resaltar la etiqueta del slider (el texto dentro del label)
    const labelSpan = document.querySelector(`label[for="${paramId}"] span[data-i18n]`);
    if (labelSpan) labelSpan.classList.add('active-param');

    // Get the actual value (applying log scaling if needed)
    const actualValue = linearToLog(parseFloat(input.value), paramId);
    const decimals = getDecimalPlaces(paramId);
    
    if (paramId === 'L') display.textContent = Number(actualValue).toLocaleString(currentLang);
    else display.textContent = roundToDecimals(actualValue, decimals).toString();
    
    validateAndCalculate(paramId);
}

function getParameterValues() {
    const values = {};
    for (const paramId in defaultValues) {
        const rawValue = parseFloat(document.getElementById(paramId).value);
        // Apply log scaling to parameters with very wide ranges
        values[paramId] = linearToLog(rawValue, paramId);
    }
    return values;
}







function validateAndCalculate(changedParameter) {
    const currentValues = getParameterValues();
    const N = calculateN(currentValues);
    const formattedN = formatResult(N);
    animateValue(currentN, N, 800);
    if (typeof updateGalaxySimulation === 'function') {
        updateGalaxySimulation(currentValues);
    }
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
    document.getElementById('tooltip-description').innerHTML = data.description;
    document.getElementById('tooltip-current').textContent = data.current;
    document.getElementById('tooltip-scientific').textContent = data.scientific;
    document.getElementById('tooltip-importance').textContent = data.importance;
    const uncertaintyEl = document.getElementById('tooltip-uncertainty');
    const levelData = uncertaintyLevels[data.uncertainty];
    const uncertaintyLabel = t('uncertainty.' + levelData.labelKey);
    uncertaintyEl.className = 'tooltip-uncertainty ' + data.uncertainty.replace(' ', '-');
    uncertaintyEl.textContent = `${currentLang === 'es' ? 'Nivel de confianza' : 'Confidence Level'}: ${uncertaintyLabel}`;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideTooltip() {
    const modal = document.getElementById('tooltip-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
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
        let value = values[paramId];
        
        // Convert log values back to linear slider positions
        const sliderPosition = logToLinear(value, paramId);
        
        if (slider && display) {
            slider.value = sliderPosition;
            // Display the original actual value with correct decimal places
            const decimals = getDecimalPlaces(paramId);
            display.textContent = paramId === 'L' ? Number(value).toLocaleString(currentLang) : roundToDecimals(value, decimals).toString();
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

function generateSliderTicks(paramId) {
    const slider = document.getElementById(paramId);
    const ticksContainer = document.getElementById(`ticks-${paramId}`);
    
    if (!slider || !ticksContainer) return;
    
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const logParams = ['fi', 'fl'];
    const isLog = logParams.includes(paramId);
    
    let tickValues = [];
    
    if (isLog) {
        // Log scale: specific values for better readability
        tickValues = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1.0].filter(v => v >= min && v <= max);
    } else {
        // Linear scale: 5 ticks evenly spaced
        const count = 5;
        for (let i = 0; i <= count; i++) {
            tickValues.push(min + (max - min) * (i / count));
        }
    }
    
    // Clear container
    ticksContainer.innerHTML = '';
    
    // Generate tick marks and labels
    for (let idx = 0; idx < tickValues.length; idx++) {
        const value = tickValues[idx];
        const tick = document.createElement('div');
        tick.className = 'tick';
        
        // Calculate position
        let percent;
        if (isLog) {
            const logValue = logToLinear(value, paramId);
            percent = ((logValue - min) / (max - min)) * 100;
        } else {
            percent = ((value - min) / (max - min)) * 100;
        }
        
        tick.style.left = percent + '%';
        
        // Add label for first, middle, and last ticks
        let showLabel = false;
        if (idx === 0 || idx === Math.floor(tickValues.length / 2) || idx === tickValues.length - 1) {
            showLabel = true;
        }
        // Also show labels for log scale
        if (isLog && [0.001, 0.01, 0.1, 1.0].includes(value)) {
            showLabel = true;
        }
        
        if (showLabel) {
            tick.classList.add('labeled');
            const label = document.createElement('span');
            label.className = 'tick-label';
            
            // Format label
            if (value < 0.01) {
                label.textContent = value.toFixed(4).replace(/\.?0+$/, '');
            } else if (value < 1) {
                label.textContent = value.toFixed(2).replace(/\.?0+$/, '');
            } else if (value >= 1000) {
                label.textContent = (value / 1000).toFixed(0) + 'k';
            } else {
                label.textContent = value.toFixed(0);
            }
            
            tick.appendChild(label);
        }
        
        ticksContainer.appendChild(tick);
    }
}










window.onload = function() {
    applyUrlParameters();
    initChart();
    initGalaxySimulation();
    updateLanguage(currentLang);
    const scientificBtn = document.querySelector('[data-preset="scientific"]');
    if (scientificBtn) scientificBtn.classList.add('active-preset');
    
    // Generate slider ticks for all parameters
    for (const paramId of Object.keys(defaultValues)) {
        generateSliderTicks(paramId);
    }
    
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
