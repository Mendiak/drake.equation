// Drake Equation DOM Updates
// Visual and textual updates for the interface

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

function renderKeyConceptsCards() {
    const concepts = ['habitable', 'technosignature', 'great_filter', 'cosmic_perspective'];
    const conceptsGrid = document.querySelector('.concepts-grid');
    if (!conceptsGrid) return;
    
    conceptsGrid.innerHTML = concepts.map(concept => `
        <div class="concept-card">
            <h4>${t(`concept_${concept}.title`)}</h4>
            <p>${t(`concept_${concept}.desc`)}</p>
        </div>
    `).join('');
}

function updateResultDetails(N) {
    const resultDetails = document.getElementById('result-details');
    if (!resultDetails) return;
    
    if (N >= 0.1) {
        const avgDistance = Math.round(100000 / Math.sqrt(N));
        const starRatio = Math.round(200000000000 / N);
        
        document.getElementById('result-meaning-title').innerHTML = t('result_interpretation.title');
        document.getElementById('result-meaning-near').innerHTML = t('result_interpretation.near').replace('{distance}', avgDistance.toLocaleString(currentLang));
        document.getElementById('result-meaning-ratio').innerHTML = t('result_interpretation.ratio').replace('{ratio}', starRatio.toLocaleString(currentLang));
        document.getElementById('result-meaning-context').innerHTML = t('result_interpretation.earth_context') + '<br>' + t('result_interpretation.filter_note');
        
        resultDetails.style.display = 'block';
    } else {
        resultDetails.style.display = 'none';
    }
}

function updateMagnitudeScale(N) {
    const indicator = document.getElementById('magnitude-indicator');
    const label = document.getElementById('magnitude-label');
    if (!indicator || !label) return;
    
    let position = 0;
    let labelText = 'Start calculating...';
    
    if (N >= 1) {
        if (N <= 10) {
            position = 16.66 * Math.log10(N);
            labelText = `N ≈ ${formatResult(N)} (${currentLang === 'es' ? 'Raro' : 'Rare'})`;
        } else if (N <= 100) {
            position = 16.66 + 16.66 * Math.log10(N / 10);
            labelText = `N ≈ ${formatResult(N)} (${currentLang === 'es' ? 'Moderado' : 'Moderate'})`;
        } else if (N <= 1000) {
            position = 33.33 + 16.66 * Math.log10(N / 100);
            labelText = `N ≈ ${formatResult(N)} (${currentLang === 'es' ? 'Abundante' : 'Abundant'})`;
        } else if (N <= 100000) {
            position = 50 + 16.66 * Math.log10(N / 1000);
            labelText = `N ≈ ${formatResult(N)} (${currentLang === 'es' ? 'Muy abundante' : 'Very Abundant'})`;
        } else if (N <= 1e9) {
            position = 66.66 + 16.66 * Math.log10(N / 100000);
            labelText = `N ≈ ${formatResult(N)} (${currentLang === 'es' ? 'Masivamente abundante' : 'Massively Abundant'})`;
        } else {
            position = 83.33 + 16.66 * Math.log10(N / 1e9);
            labelText = `N ≈ ${formatResult(N)} (${currentLang === 'es' ? 'Universo lleno' : 'Universe Teeming'})`;
        }
    }
    
    indicator.style.left = Math.min(position, 100) + '%';
    label.innerHTML = labelText;
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
    
    let targetCount = 0;
    if (N > 0) {
        // Logarithmic scale so even low N values result in at least 20-50 stars
        // but high values still feel noticeably denser (up to 600 max)
        const logFactor = Math.log10(N + 1); 
        targetCount = Math.floor(20 + (logFactor * 60)); 
    }
    targetCount = Math.min(targetCount, 600); // Max stars
    
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
