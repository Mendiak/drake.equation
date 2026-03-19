// Drake Equation Configuration
// Static values and presets

const defaultValues = {
    Rstar: 1.5,
    fp: 0.5,
    ne: 2,
    fl: 0.1,
    fi: 0.01,
    fc: 0.1,
    L: 10000
};

const presets = {
    optimistic: { Rstar: 7, fp: 1, ne: 5, fl: 1, fi: 1, fc: 0.2, L: 1000000 },
    sagan: { Rstar: 10, fp: 1, ne: 1, fl: 1, fi: 1, fc: 0.1, L: 1000000 },
    scientific: { Rstar: 1.5, fp: 0.8, ne: 2, fl: 0.1, fi: 0.01, fc: 0.1, L: 10000 },
    drake: { Rstar: 10, fp: 0.5, ne: 2, fl: 1, fi: 0.01, fc: 0.01, L: 10000 },
    rare_earth: { Rstar: 1, fp: 0.5, ne: 0.1, fl: 0.001, fi: 0.001, fc: 0.01, L: 1000 },
    pessimistic: { Rstar: 1, fp: 0.2, ne: 0.1, fl: 0.01, fi: 0.001, fc: 0.01, L: 100 }
};

const uncertaintyLevels = {
    low: { color: '#000000', labelKey: 'low' },
    medium: { color: '#666666', labelKey: 'medium' },
    high: { color: '#999999', labelKey: 'high' },
    'very high': { color: '#cccccc', labelKey: 'very_high' }
};

const MOBILE_BREAKPOINT = 768;
