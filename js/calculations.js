import { t, getLocale } from './i18n.js';

function formatResult(n) {
    if (n === 0) return "0";
    if (n >= 1e9) {
        const billions = n / 1e9;
        if (getLocale() === 'es-ES') {
            return billions >= 1000 ? (billions/1000).toFixed(1) + " billones" : billions.toFixed(0) + " mil millones";
        }
        return billions.toFixed(1) + " billion";
    }
    if (n >= 10000) return Math.round(n).toLocaleString(getLocale());
    if (n < 0.01) {
        if (n === 0) return "0";
        const inverse = Math.round(1 / n);
        return `< 1/${inverse.toLocaleString(getLocale())}`;
    }
    return n.toLocaleString(getLocale(), { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function calculateN(params) {
    return params.Rstar * params.fp * params.ne * params.fl * params.fi * params.fc * params.L;
}

function getScenario(params) {
    const N = calculateN(params);
    const biologicalSuccess = params.fl * params.fi;
    const technologicalSuccess = params.fc;
    const longevity = params.L;

    if (longevity < 1000 && N < 100) return t('scenarios.shooting_star');
    if (biologicalSuccess <= 0.001) return t('scenarios.rare_earth');
    if (technologicalSuccess < 0.05 && N < 1000) return t('scenarios.silent_wilderness');
    if (longevity > 100000 && N > 1000) return t('scenarios.galactic_club');
    return t('scenarios.balanced');
}

const parameterUncertainty = {
    Rstar: 1.5,
    fp: 1.5,
    ne: 3,
    fl: 10,
    fi: 100,
    fc: 100,
    L: 100
};

function calculateConfidenceRange(params) {
    let min = 1, max = 1;
    for (const key in params) {
        const factor = parameterUncertainty[key];
        min *= params[key] / factor;
        max *= params[key] * factor;
    }
    return { min, max };
}

export { formatResult, calculateN, getScenario, calculateConfidenceRange };
