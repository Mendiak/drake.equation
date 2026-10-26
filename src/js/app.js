import { defaultValues, presets, uncertaintyLevels } from './core/config.js';
import { PARAMETERS, getReference } from './core/science.js';
import { t, currentLang, updateLanguage, initLucideIcons } from './i18n/i18n.js';
import { linearToLog, logToLinear, snapToDetent, updateSliderFill, formatParamValue } from './ui/slider-utils.js';
import { formatResult, calculateN, getScenario } from './core/calculations.js';
import {
    renderMagnitudeContext, renderTimeline, renderKeyConceptsCards,
    updateResultDetails, updateMagnitudeScale, animateValue,
    updateGalaxyVisualization, interpretResult, updateFactorBreakdown,
    updateConfidenceRange, updateGreatFilterIndicator, currentN
} from './ui/dom-updates.js';
import { initChart, updateChart } from './ui/chart-utils.js';
import {
    initGalaxySimulation, updateGalaxySimulation, toggleGalaxyFullscreen,
    updateGalaxyRotation, updateGalaxyTilt, updateGalaxyZoom,
    updateGalaxyStarSize, resetGalaxyView, applyPresetFromFullscreen,
    updateParamFromFullscreen, syncFullscreenValues, initGalaxyLegendHandlers,
    handleFullscreenKeydown, isGalaxyFullscreen
} from './features/galaxy/simulation.js';
import { fetchNasaExoplanetData, loadRandomExoplanet, updateExoplanetLanguage } from './features/nasa-exoplanets.js';
import { toggleDisclaimer } from './ui/disclaimer.js';
import { trapFocus } from './ui/a11y.js';

let lastTooltipTrigger = null;
let _hasUserInteracted = false;
let _pointerSlider = null;

let _calcPending = false;
let _calcLastParam = 'Rstar';
let _calcThrottleTimer = null;
let _liveRegionTimer = null;
const CALC_THROTTLE_MS = 50;

function getParameterValues() {
    const values = {};
    for (const paramId in defaultValues) {
        const rawValue = parseFloat(document.getElementById(paramId).value);
        values[paramId] = linearToLog(rawValue, paramId);
    }
    return values;
}

function validateAndCalculate(changedParameter) {
    _calcLastParam = changedParameter || _calcLastParam;

    if (_calcThrottleTimer) clearTimeout(_calcThrottleTimer);

    if (_calcPending) {
        _calcThrottleTimer = setTimeout(() => {
            _calcThrottleTimer = null;
            _doValidateAndCalculate();
        }, CALC_THROTTLE_MS);
        return;
    }

    _calcPending = true;

    requestAnimationFrame(() => {
        _calcPending = false;
        _doValidateAndCalculate();
    });
}

function _doValidateAndCalculate() {
    const currentValues = getParameterValues();
    const N = calculateN(currentValues);
    const formattedN = formatResult(N);

    animateValue(currentN, N, 800);

    const updates = {
        galaxy: typeof updateGalaxySimulation === 'function',
        galaxyViz: typeof updateGalaxyVisualization === 'function',
        chart: _calcLastParam,
        values: currentValues,
        N: N
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            _applyNonCriticalUpdates(updates);
        }, { timeout: 200 });
    } else {
        setTimeout(() => {
            _applyNonCriticalUpdates(updates);
        }, 16);
    }

    // Keep the descriptive static <title> until the visitor actually interacts:
    // a dynamic "N = …" title hurts search snippets.
    if (_hasUserInteracted) {
        document.title = `N = ${formattedN} | ${t('title')}`;
    }

    const liveRegion = document.getElementById('result-live');
    if (liveRegion) {
        clearTimeout(_liveRegionTimer);
        _liveRegionTimer = setTimeout(() => {
            liveRegion.textContent = `${t('result_label')}: ${formattedN}`;
        }, 600);
    }

    interpretResult(N, currentValues);
    updateResultDetails(N);
    updateMagnitudeScale(N);
    updateFactorBreakdown(currentValues);
    updateConfidenceRange(currentValues);
    updateGreatFilterIndicator(N);
}

function _applyNonCriticalUpdates(updates) {
    if (updates.galaxy) {
        updateGalaxySimulation(updates.values);
    }
    if (updates.galaxyViz) {
        updateGalaxyVisualization(updates.N);
    }
    if (updates.chart) {
        updateChart(updates.chart, updates.values);
    }
}

let _isUpdating = false;

function updateValueAndRecalculate(paramId, snap = false) {
    if (_isUpdating) return;

    const input = document.getElementById(paramId);
    const display = document.getElementById(paramId + '-value');

    if (snap) {
        const currentValue = parseFloat(input.value);
        const snappedValue = snapToDetent(currentValue, paramId);

        if (Math.abs(snappedValue - currentValue) > 0.000001) {
            _isUpdating = true;
            input.value = snappedValue;
            _isUpdating = false;
        }
    }

    document.querySelectorAll('.active-param').forEach(el => el.classList.remove('active-param'));

    const eqSpan = document.getElementById('eq-' + paramId);
    if (eqSpan) eqSpan.classList.add('active-param');

    const labelSpan = document.querySelector(`label[for="${paramId}"][data-i18n]`);
    if (labelSpan) labelSpan.classList.add('active-param');

    const actualValue = linearToLog(parseFloat(input.value), paramId);
    updateSliderFill(input);
    display.textContent = formatParamValue(paramId, actualValue);

    validateAndCalculate(paramId);
}

function showTooltip(paramId) {
    const modal = document.getElementById('tooltip-modal');
    const data = t('tooltips.' + paramId);
    if (!data || !modal) return;
    lastTooltipTrigger = document.activeElement;
    document.getElementById('tooltip-title').innerHTML = data.title;
    document.getElementById('tooltip-description').innerHTML = data.description;
    document.getElementById('tooltip-current').textContent = data.current;
    document.getElementById('tooltip-scientific').textContent = data.scientific;
    document.getElementById('tooltip-importance').textContent = data.importance;
    const uncertaintyEl = document.getElementById('tooltip-uncertainty');
    const levelData = uncertaintyLevels[data.uncertainty];
    const uncertaintyLabel = t('uncertainty.' + levelData.labelKey);
    uncertaintyEl.className = 'tooltip-uncertainty ' + data.uncertainty.replace(' ', '-');
    uncertaintyEl.textContent = `${currentLang === 'es' ? 'Incertidumbre' : 'Uncertainty'}: ${uncertaintyLabel}`;

    const sourceEl = document.getElementById('tooltip-source');
    if (sourceEl) {
        const parameter = PARAMETERS.find((entry) => entry.id === paramId);
        const reference = parameter?.sourceId ? getReference(parameter.sourceId) : null;
        sourceEl.innerHTML = reference
            ? `<a href="${reference.url}" target="_blank" rel="noopener noreferrer">${reference.authors} (${reference.year})</a> — ${reference.container}<span class="sr-only"> (${t('new_tab_indicator')})</span>`
            : t('tooltip_source_assumption');
    }

    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.querySelector('.tooltip-close')?.focus();
}

function hideTooltip() {
    const modal = document.getElementById('tooltip-modal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        if (lastTooltipTrigger && typeof lastTooltipTrigger.focus === 'function') {
            lastTooltipTrigger.focus();
        }
        lastTooltipTrigger = null;
    }
}

function resetForm() {
    _hasUserInteracted = true;
    applyPreset(presets.scientific);
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active-preset'));
    const scientificBtn = document.querySelector('[data-preset="scientific"]');
    if (scientificBtn) scientificBtn.classList.add('active-preset');
    validateAndCalculate('Rstar');
}

function copyShareUrl() {
    const url = new URL(window.location);
    const activePreset = document.querySelector('.preset-btn.active-preset');
    if (activePreset) {
        url.search = '';
        url.searchParams.set('preset', activePreset.getAttribute('data-preset'));
    } else {
        const params = getParameterValues();
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }
    }
    const shareUrl = url.toString();
    const title = t('title');
    const text = t('share_description');

    if (navigator.share && window.matchMedia('(max-width: 768px)').matches) {
        navigator.share({ title, text, url: shareUrl }).catch(() => {});
        return;
    }

    navigator.clipboard.writeText(shareUrl).then(() => {
        const btn = document.querySelector('.share-btn');
        if (btn) {
            btn.classList.add('copied');
            const span = btn.querySelector('span');
            const original = span.textContent;
            span.textContent = t('share_copied');
            setTimeout(() => {
                btn.classList.remove('copied');
                span.textContent = original;
            }, 2000);
        }
    }).catch(() => {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
    });
}

function applyPreset(values) {
    const updates = [];

    for (const paramId in values) {
        const slider = document.getElementById(paramId);
        const display = document.getElementById(paramId + '-value');
        let value = values[paramId];

        const sliderPosition = logToLinear(value, paramId);

        if (slider && display) {
            updates.push({ paramId, slider, display, sliderPosition, value });
        }
    }

    for (const update of updates) {
        update.slider.value = update.sliderPosition;
        updateSliderFill(update.slider);
        update.display.textContent = formatParamValue(update.paramId, update.value);
    }
}

function applyUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const presetName = urlParams.get('preset');
    if (presetName && presets[presetName]) {
        Object.assign(defaultValues, presets[presetName]);
        const presetBtn = document.querySelector(`[data-preset="${presetName}"]`);
        if (presetBtn) presetBtn.classList.add('active-preset');
        return;
    }
    for (const [key, value] of urlParams.entries()) {
        if (Object.hasOwn(defaultValues, key)) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) defaultValues[key] = numValue;
        }
    }
}

function _initCritical() {
    applyUrlParameters();
    updateLanguage(currentLang);

    const hasUrlParams = window.location.search.length > 0;

    if (!hasUrlParams) {
        const scientificBtn = document.querySelector('[data-preset="scientific"]');
        if (scientificBtn) scientificBtn.classList.add('active-preset');
    }

    initChart();

    applyPreset(defaultValues);
    validateAndCalculate('Rstar');

    renderMagnitudeContext();
    renderTimeline();
    renderKeyConceptsCards();
    fetchNasaExoplanetData();
    loadRandomExoplanet();

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = btn.getAttribute('data-lang');
            if (lang !== currentLang) {
                // Each language has its own static URL; keep the current share state.
                const target = new URL(btn.getAttribute('href'), window.location.href);
                target.search = window.location.search;
                btn.setAttribute('href', target.toString());
                return;
            }
            e.preventDefault();
            updateLanguage(lang);
            const values = getParameterValues();
            const N = currentN;
            interpretResult(N, values);
            updateResultDetails(N);
            updateMagnitudeScale(N);
            updateFactorBreakdown(values);
            updateConfidenceRange(values);
            updateGreatFilterIndicator(N);
            renderMagnitudeContext();
            renderTimeline();
            renderKeyConceptsCards();
            updateExoplanetLanguage();
            document.title = `N = ${formatResult(N)} | ${t('title')}`;
        });
    });

    document.querySelectorAll('.info-icon[data-param]').forEach(icon => {
        icon.addEventListener('click', () => showTooltip(icon.getAttribute('data-param')));
    });

    const tooltipModal = document.getElementById('tooltip-modal');
    if (tooltipModal) {
        tooltipModal.addEventListener('click', (e) => {
            if (e.target === tooltipModal || e.target.classList.contains('tooltip-close')) hideTooltip();
        });
    }

    document.addEventListener('keydown', (e) => {
        const tooltipModal = document.getElementById('tooltip-modal');
        const tooltipOpen = tooltipModal && tooltipModal.getAttribute('aria-hidden') === 'false';

        if (e.key === 'Escape') hideTooltip();
        if (tooltipOpen) {
            trapFocus(tooltipModal, e);
            return;
        }
        if (!e.defaultPrevented) handleFullscreenKeydown(e);
    });

    document.getElementById('drake-form').addEventListener('input', (e) => {
        const slider = e.target.closest('input[type="range"]');
        if (slider && slider.id && !slider.id.startsWith('fs-')) {
            _hasUserInteracted = true;
            updateValueAndRecalculate(slider.id);
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active-preset'));
        }
    });

    // Snap to "nice" values only when a pointer drag ends: doing it on every
    // input event made the thumb jump while dragging, and doing it on `change`
    // also snapped keyboard arrow presses back to the detent.
    document.getElementById('drake-form').addEventListener('pointerdown', (e) => {
        const slider = e.target.closest('input[type="range"]');
        if (slider && slider.id && !slider.id.startsWith('fs-')) {
            _pointerSlider = slider;
        }
    });

    window.addEventListener('pointerup', () => {
        if (!_pointerSlider) return;
        _hasUserInteracted = true;
        updateValueAndRecalculate(_pointerSlider.id, true);
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active-preset'));
        _pointerSlider = null;
    });

    window.addEventListener('pointercancel', () => {
        _pointerSlider = null;
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const presetName = this.getAttribute('data-preset');
            if (presets[presetName]) {
                _hasUserInteracted = true;
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active-preset'));
                this.classList.add('active-preset');

                const presetValues = presets[presetName];
                const applyAndNotify = () => {
                    applyPreset(presetValues);
                    validateAndCalculate('Rstar');
                    document.dispatchEvent(new CustomEvent('drake:preset-applied', {
                        detail: { preset: presetName }
                    }));
                };

                if ('requestIdleCallback' in window) {
                    requestIdleCallback(applyAndNotify, { timeout: 100 });
                } else {
                    setTimeout(applyAndNotify, 50);
                }
            }
        });
    });

    document.getElementById('reset-button').addEventListener('click', resetForm);

    document.querySelector('.share-btn')?.addEventListener('click', copyShareUrl);

    document.querySelectorAll('[data-action="galaxy-fullscreen"]').forEach(el => {
        el.addEventListener('click', toggleGalaxyFullscreen);
    });

    const fullscreenTrigger = document.querySelector('.fullscreen-btn-overlay');
    if (fullscreenTrigger && window.innerWidth <= 768) {
        fullscreenTrigger.setAttribute('aria-disabled', 'true');
        fullscreenTrigger.setAttribute('aria-label', t('mobile_fullscreen_unavailable'));
        fullscreenTrigger.setAttribute('title', t('mobile_fullscreen_unavailable'));
    }

    document.querySelectorAll('[data-action="exoplanet-shuffle"]').forEach(el => {
        el.addEventListener('click', loadRandomExoplanet);
    });

    document.querySelectorAll('[data-action="toggle-disclaimer"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            toggleDisclaimer();
        });
    });

    enhanceExternalLinks();
}

/**
 * Add an accessible hint to links that open in a new tab (WCAG 3.2.5).
 */
function enhanceExternalLinks() {
    document.querySelectorAll('a[target="_blank"]:not([data-new-tab])').forEach(link => {
        link.setAttribute('data-new-tab', '');
        const hint = document.createElement('span');
        hint.className = 'sr-only';
        hint.textContent = ` (${t('new_tab_indicator')})`;
        link.appendChild(hint);
    });
}

function _initGalaxyWhenVisible() {
    const section = document.querySelector('.galaxy-sim-section');
    if (!section || !('IntersectionObserver' in window)) {
        initGalaxySimulation();
        return;
    }

    let started = false;
    const start = () => {
        if (started) return;
        started = true;
        observer.disconnect();
        clearTimeout(fallback);
        initGalaxySimulation();
    };

    const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) start();
    }, { rootMargin: '600px 0px' });

    observer.observe(section);

    // Safety net: never leave the simulation uninitialised for the whole visit.
    const fallback = setTimeout(start, 8000);
}

function _initNonCritical() {
    _initGalaxyWhenVisible();
    initGalaxyLegendHandlers();

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="fullscreen-preset"]');
        if (btn) {
            const presetName = btn.getAttribute('data-preset');
            if (presetName) applyPresetFromFullscreen(presetName);
        }
    });

    document.addEventListener('input', (e) => {
        const fsSlider = e.target.closest('[data-action="fs-param"]');
        if (fsSlider) {
            const paramId = fsSlider.getAttribute('data-param-id');
            if (paramId) updateParamFromFullscreen(paramId, fsSlider.value);
        }
    });

    document.querySelectorAll('[data-action="fs-galaxy-rotation"]').forEach(el => {
        el.addEventListener('input', (e) => updateGalaxyRotation(e.currentTarget.value));
    });
    document.querySelectorAll('[data-action="fs-galaxy-tilt"]').forEach(el => {
        el.addEventListener('input', (e) => updateGalaxyTilt(e.currentTarget.value));
    });
    document.querySelectorAll('[data-action="fs-galaxy-zoom"]').forEach(el => {
        el.addEventListener('input', (e) => updateGalaxyZoom(e.currentTarget.value));
    });
    document.querySelectorAll('[data-action="fs-galaxy-star-size"]').forEach(el => {
        el.addEventListener('input', (e) => updateGalaxyStarSize(e.currentTarget.value));
    });
    document.querySelectorAll('[data-action="galaxy-reset-view"]').forEach(el => {
        el.addEventListener('click', resetGalaxyView);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initCritical);
    if ('requestIdleCallback' in window) {
        requestIdleCallback(_initNonCritical, { timeout: 2000 });
    } else {
        setTimeout(_initNonCritical, 100);
    }
    if ('requestIdleCallback' in window) {
        requestIdleCallback(initLucideIcons, { timeout: 1000 });
    } else {
        setTimeout(initLucideIcons, 50);
    }
} else {
    _initCritical();
    if ('requestIdleCallback' in window) {
        requestIdleCallback(_initNonCritical, { timeout: 2000 });
    } else {
        setTimeout(_initNonCritical, 100);
    }
    if ('requestIdleCallback' in window) {
        requestIdleCallback(initLucideIcons, { timeout: 1000 });
    } else {
        setTimeout(initLucideIcons, 50);
    }
}
