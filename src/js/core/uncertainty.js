/**
 * Plausibility envelope for N.
 *
 * This is deliberately NOT a confidence interval. It multiplies the extreme
 * value of every factor, which is the widest possible range under the
 * assumption that all factors are independent. The probability of all seven
 * extremes happening at once is negligible, so the result is an envelope, not
 * a probability statement. See ASSUMPTIONS.uncertainty-envelope in science.js.
 *
 * Kept free of DOM and i18n imports so scripts/check-science.mjs can verify it
 * in Node.
 */
import { UNCERTAINTY_FACTORS } from './science.js';

const BOUNDS = {
    fp: [0, 1],
    fl: [0, 1],
    fi: [0, 1],
    fc: [0, 1],
    ne: [0, 10]
};

function clamp(value, [min, max]) {
    return Math.min(Math.max(value, min), max);
}

export function calculateConfidenceRange(params) {
    let min = 1;
    let max = 1;

    for (const key of Object.keys(UNCERTAINTY_FACTORS)) {
        if (!(key in params)) continue;

        const factor = UNCERTAINTY_FACTORS[key];
        const bounds = BOUNDS[key] ?? [0, Infinity];

        min *= clamp(params[key] / factor, bounds);
        max *= clamp(params[key] * factor, bounds);
    }

    return { min, max };
}

export { UNCERTAINTY_FACTORS };
