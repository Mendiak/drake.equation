import { getLocale } from './i18n.js';

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

function snapToDetent(value, paramId) {
    const slider = document.getElementById(paramId);
    if (!slider) return value;

    const noSnapParams = ['fp', 'fc'];
    if (noSnapParams.includes(paramId)) return value;

    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const logParams = [];
    const isLog = logParams.includes(paramId) && max / min >= 100;

    let snapPoints = [];

    if (isLog) {
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
        const range = max - min;
        const decimals = getDecimalPlaces(paramId);

        if (paramId === 'fp' || paramId === 'fc') {
            for (let i = 0; i <= 10; i++) snapPoints.push(roundToDecimals(min + (i * 0.1), 2));
        } else if (paramId === 'fl' || paramId === 'fi') {
            snapPoints = [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0].filter(v => v >= min && v <= max);
        } else if (paramId === 'Rstar' || paramId === 'ne') {
            const start = Math.ceil(min * 10) / 10;
            const end = Math.floor(max * 10) / 10;
            for (let i = start * 10; i <= end * 10; i += 5) {
                snapPoints.push(roundToDecimals(i / 10, 1));
            }
            if (!snapPoints.includes(max)) {
                snapPoints.push(max);
            }
        } else if (paramId === 'L') {
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

        const snapThreshold = (paramId === 'fl' || paramId === 'fi') ? Math.max(nearest * 0.15, 0.003) : range * 0.05;
        if (minDistance < snapThreshold) {
            return roundToDecimals(nearest, decimals);
        }
    }

    return value;
}

export { getDecimalPlaces, roundToDecimals, linearToLog, logToLinear, snapToDetent };
