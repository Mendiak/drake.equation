import { PARAMETERS, PRESETS } from './science.js';

/**
 * Default state of the calculator. It is derived from the scientific registry
 * so the first number on screen always matches the reviewed "modern estimate".
 */
const defaultValues = Object.fromEntries(PARAMETERS.map(({ id, value }) => [id, value]));

const presets = Object.fromEntries(
    Object.entries(PRESETS).map(([id, preset]) => [id, { ...preset.values }])
);

const uncertaintyLevels = {
    low: { color: '#000000', labelKey: 'low' },
    medium: { color: '#666666', labelKey: 'medium' },
    high: { color: '#999999', labelKey: 'high' },
    'very high': { color: '#cccccc', labelKey: 'very_high' }
};

const MOBILE_BREAKPOINT = 768;

export { defaultValues, presets, uncertaintyLevels, MOBILE_BREAKPOINT };
