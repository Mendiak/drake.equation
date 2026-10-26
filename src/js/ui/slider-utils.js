import { getLocale } from '../i18n/i18n.js';

function getDecimalPlaces(paramId) {
    const decimalMap = {
        'Rstar': 1, 'fp': 2, 'ne': 1,
        'fl': 3, 'fi': 3, 'fc': 2, 'L': 0
    };
    return decimalMap[paramId] || 2;
}

function roundToDecimals(value, decimals) {
    if (decimals === 0) return Math.round(value);
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

function linearToLog(sliderValue, paramId) {
    const slider = document.getElementById(paramId);
    if (!slider) return sliderValue;

    const noLogParams = ['fp', 'fc'];
    if (noLogParams.includes(paramId)) return sliderValue;

    const logParams = [];
    if (!logParams.includes(paramId)) return sliderValue;

    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);

    if (max / min < 100) return sliderValue;

    const position = (sliderValue - min) / (max - min);
    const logValue = min * Math.pow(max / min, position);

    return logValue;
}

function logToLinear(value, paramId) {
    const slider = document.getElementById(paramId);
    if (!slider) return value;

    const noLogParams = ['fp', 'fc'];
    if (noLogParams.includes(paramId)) return value;

    const logParams = [];
    if (!logParams.includes(paramId)) return value;

    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);

    if (max / min < 100) return value;

    const logRatio = Math.log(value / min) / Math.log(max / min);
    const sliderValue = min + logRatio * (max - min);

    return sliderValue;
}

/** Paints the filled portion of a range track from its current value. */
function updateSliderFill(input) {
    if (!input) return;

    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const value = parseFloat(input.value);

    if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(value) || max <= min) {
        input.style.setProperty('--slider-fill', '0%');
        return;
    }

    const percentage = ((value - min) / (max - min)) * 100;
    input.style.setProperty('--slider-fill', `${Math.min(100, Math.max(0, percentage))}%`);
}

/** Formats a parameter for display with a stable number of decimals. */
function formatParamValue(paramId, value) {
    if (paramId === 'L') return Number(value).toLocaleString(getLocale());

    const decimals = getDecimalPlaces(paramId);
    return roundToDecimals(value, decimals).toFixed(decimals);
}

const SNAP_DETENTS = {
    fl: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    fi: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
};

function getSnapPoints(paramId, min, max) {
    if (paramId === 'L') {
        const points = [min, max];
        let magnitude = 100;
        while (magnitude < max) {
            for (const mult of [1, 2, 5]) {
                const point = mult * magnitude;
                if (point >= min && point <= max) points.push(point);
            }
            magnitude *= 10;
        }
        return [...new Set(points)].sort((a, b) => a - b);
    }

    const detents = SNAP_DETENTS[paramId];
    return detents ? detents.filter(v => v >= min && v <= max) : [];
}

function snapToDetent(value, paramId) {
    const slider = document.getElementById(paramId);
    if (!slider) return value;

    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const step = parseFloat(slider.step) || 0;
    if (max <= min) return value;

    const points = getSnapPoints(paramId, min, max);
    if (points.length === 0) return value;

    let nearestIndex = 0;
    let minDistance = Math.abs(value - points[0]);

    for (let i = 1; i < points.length; i += 1) {
        const distance = Math.abs(value - points[i]);
        if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = i;
        }
    }

    const nearest = points[nearestIndex];
    const previousGap = nearestIndex > 0 ? nearest - points[nearestIndex - 1] : Infinity;
    const nextGap = nearestIndex < points.length - 1 ? points[nearestIndex + 1] - nearest : Infinity;
    const localGap = Math.min(previousGap, nextGap);
    const range = max - min;

    // Gentle magnet: 20% of the local gap, never below one native step and
    // never more than 1% of the track. This keeps coarse detents (L) from
    // swallowing half the scale and fine ones (fl/fi) from feeling sticky.
    const threshold = Math.min(
        Math.max(Number.isFinite(localGap) ? localGap * 0.2 : 0, step),
        range * 0.01
    );

    if (threshold > 0 && minDistance <= threshold) {
        return roundToDecimals(nearest, getDecimalPlaces(paramId));
    }

    return value;
}

export { getDecimalPlaces, roundToDecimals, linearToLog, logToLinear, snapToDetent, updateSliderFill, formatParamValue };
