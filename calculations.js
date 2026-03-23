/* exported formatResult, calculateN, getScenario */
// Drake Equation Calculations
// Pure calculation functions

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

function calculateN(params) {
    return params.Rstar * params.fp * params.ne * params.fl * params.fi * params.fc * params.L;
}

function getScenario(params) {
    const biologicalSuccess = params.fl * params.fi;
    const technologicalSuccess = params.fc;
    const longevity = params.L;

    if (longevity < 1000) return t('scenarios.shooting_star');
    if (biologicalSuccess <= 0.001) return t('scenarios.rare_earth');
    if (technologicalSuccess < 0.05) return t('scenarios.silent_wilderness');
    if (longevity > 100000) return t('scenarios.galactic_club');
    return t('scenarios.balanced');
}
