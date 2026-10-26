/**
 * Scientific registry.
 *
 * This module is the single source of truth for every scientific value and
 * claim the project exposes: the calculator defaults, the parameter tooltips,
 * the published methodology page (content/methodology.mjs) and the automated
 * checks (scripts/check-science.mjs).
 *
 * Rules for editing:
 *   1. Every value needs an id, a plausible `range`, a `status` and, unless it
 *      is a pure assumption, a `sourceId` that exists in REFERENCES.
 *   2. `status` separates what we measure from what we choose:
 *        observed  -> measured with an instrument (uncertainty quoted)
 *        derived   -> computed from measurements, with extra assumptions
 *        assumption-> an educated guess with no direct measurement
 *   3. Bump SCIENCE_VERSION and add an entry to docs/science/changelog.md when
 *      a value or its justification changes.
 *
 * The module must stay browser-safe: no DOM and no Node APIs.
 */

export const SCIENCE_VERSION = '1.0.0';
export const SCIENCE_REVIEWED = '2026-10-26';

export const STATUS_LABELS = {
    observed: { en: 'Observed', es: 'Observado' },
    derived: { en: 'Derived', es: 'Derivado' },
    assumption: { en: 'Assumption', es: 'Suposición' }
};

/** Physical constants used by the interface and the documentation. */
export const GALAXY = {
    stars: 200e9,
    radiusLy: 50000,
    diameterLy: 100000
};

export const REFERENCES = {
    drake1961: {
        shortAuthors: 'Drake',
        authors: 'Drake, F. D.',
        year: 1961,
        title: 'Project Ozma',
        container: 'Physics Today 14(4), 40',
        doi: '10.1063/1.3057500',
        url: 'https://doi.org/10.1063/1.3057500',
        accessed: '2026-10-26'
    },
    licquia2015: {
        shortAuthors: 'Licquia & Newman',
        authors: 'Licquia, T. C.; Newman, J. A.',
        year: 2015,
        title: "Improved Estimates of the Milky Way's Stellar Mass and Star Formation Rate from Hierarchical Bayesian Meta-Analysis",
        container: 'The Astrophysical Journal 806, 96',
        doi: '10.1088/0004-637X/806/1/96',
        url: 'https://doi.org/10.1088/0004-637X/806/1/96',
        accessed: '2026-10-26'
    },
    cassan2012: {
        shortAuthors: 'Cassan et al.',
        authors: 'Cassan, A.; Kubas, D.; Beaulieu, J.-P.; et al.',
        year: 2012,
        title: 'One or more bound planets per Milky Way star from microlensing observations',
        container: 'Nature 481, 167',
        doi: '10.1038/nature10684',
        url: 'https://doi.org/10.1038/nature10684',
        accessed: '2026-10-26'
    },
    petigura2013: {
        shortAuthors: 'Petigura et al.',
        authors: 'Petigura, E. A.; Howard, A. W.; Marcy, G. W.',
        year: 2013,
        title: 'Prevalence of Earth-size planets orbiting Sun-like stars',
        container: 'PNAS 110, 19273',
        doi: '10.1073/pnas.1319909110',
        url: 'https://doi.org/10.1073/pnas.1319909110',
        accessed: '2026-10-26'
    },
    kopparapu2013: {
        shortAuthors: 'Kopparapu et al.',
        authors: 'Kopparapu, R. K.; Ramirez, R.; Kasting, J. F.; et al.',
        year: 2013,
        title: 'Habitable Zones Around Main-Sequence Stars: New Estimates',
        container: 'The Astrophysical Journal 765, 131',
        doi: '10.1088/0004-637X/765/2/131',
        url: 'https://doi.org/10.1088/0004-637X/765/2/131',
        accessed: '2026-10-26'
    },
    sandberg2018: {
        shortAuthors: 'Sandberg et al.',
        authors: 'Sandberg, A.; Drexler, E.; Ord, T.',
        year: 2018,
        title: 'Dissolving the Fermi Paradox',
        container: 'arXiv:1806.02404 [physics.pop-ph]',
        doi: '10.48550/arXiv.1806.02404',
        url: 'https://arxiv.org/abs/1806.02404',
        accessed: '2026-10-26'
    },
    nasaArchive: {
        shortAuthors: 'NASA Exoplanet Archive',
        authors: 'NASA Exoplanet Archive (Caltech/IPAC)',
        year: 2026,
        title: 'Planetary Systems Composite Parameters (PSCompPars)',
        container: 'NASA Exoplanet Science Institute',
        doi: null,
        url: 'https://exoplanetarchive.ipac.caltech.edu/',
        accessed: '2026-10-26'
    }
};

/**
 * The seven terms of the Drake equation, in the order they are multiplied.
 * `value` is the default shown on first load and feeds src/js/core/config.js.
 * `range` is the scientifically plausible range; `slider` is the UI range.
 */
export const PARAMETERS = [
    {
        id: 'Rstar',
        symbol: 'R*',
        definition: {
            en: 'Average rate at which the Milky Way forms stars.',
            es: 'Ritmo medio al que la Vía Láctea forma estrellas.'
        },
        value: 1.5,
        unit: { en: 'stars per year', es: 'estrellas por año' },
        range: [1.0, 3.0],
        slider: [0.1, 10],
        status: 'derived',
        basis: {
            en: 'The Galactic star formation rate is 1.65 ± 0.19 M☉/yr (Licquia & Newman 2015). Converting that mass rate into stars per year needs an initial mass function, and that conversion, not the measurement, dominates the uncertainty.',
            es: 'La tasa de formación estelar galáctica es 1,65 ± 0,19 M☉/año (Licquia & Newman 2015). Convertir esa tasa de masa en estrellas por año exige una función de masa inicial, y esa conversión —no la medición— domina la incertidumbre.'
        },
        sourceId: 'licquia2015',
        usedIn: ['default', 'presets.scientific', 'observed-marker', 'tooltips.Rstar'],
        reviewAfter: '2028-10'
    },
    {
        id: 'fp',
        symbol: 'fp',
        definition: {
            en: 'Fraction of stars that have planetary systems.',
            es: 'Fracción de estrellas que tienen sistemas planetarios.'
        },
        value: 1.0,
        unit: { en: 'fraction', es: 'fracción' },
        range: [0.8, 1.0],
        slider: [0.01, 1],
        status: 'observed',
        basis: {
            en: 'Microlensing finds one or more bound planets per Milky Way star on average (Cassan et al. 2012); Kepler and TESS agree that planetary systems are the rule rather than the exception.',
            es: 'El microlente encuentra de media uno o más planetas ligados por cada estrella de la Vía Láctea (Cassan et al. 2012); Kepler y TESS coinciden en que los sistemas planetarios son la norma, no la excepción.'
        },
        sourceId: 'cassan2012',
        usedIn: ['default', 'presets.scientific', 'observed-marker', 'tooltips.fp'],
        reviewAfter: '2028-10'
    },
    {
        id: 'ne',
        symbol: 'ne',
        definition: {
            en: 'Average number of planets per system that could support life.',
            es: 'Número medio de planetas por sistema que podrían albergar vida.'
        },
        value: 0.2,
        unit: { en: 'planets per star', es: 'planetas por estrella' },
        range: [0.05, 1.0],
        slider: [0.1, 10],
        status: 'derived',
        basis: {
            en: 'About 6% of Sun-like stars host a 1–2 R⊕ planet in the conservative habitable zone (Petigura et al. 2013); broader definitions and M dwarfs push the estimate towards 0.2–0.5. The calculator uses 0.2 as a deliberately generous central value. Being in the habitable zone is necessary for surface liquid water, not sufficient for life.',
            es: 'Alrededor del 6% de las estrellas similares al Sol albergan un planeta de 1–2 R⊕ en la zona habitable conservadora (Petigura et al. 2013); definiciones más amplias y las enanas M elevan la estimación hacia 0,2–0,5. La calculadora usa 0,2 como valor central deliberadamente generoso. Estar en la zona habitable es necesario para agua líquida en superficie, pero no suficiente para la vida.'
        },
        sourceId: 'petigura2013',
        usedIn: ['default', 'presets.scientific', 'tooltips.ne'],
        reviewAfter: '2028-10'
    },
    {
        id: 'fl',
        symbol: 'fl',
        definition: {
            en: 'Fraction of habitable planets where life actually appears.',
            es: 'Fracción de planetas habitables donde la vida aparece de hecho.'
        },
        value: 0.1,
        unit: { en: 'fraction', es: 'fracción' },
        range: [0.001, 1.0],
        slider: [0.001, 1],
        status: 'assumption',
        basis: {
            en: 'There is no measurement. Life appeared on Earth within roughly a billion years of the planet becoming habitable, but a single datum cannot constrain a probability: abiogenesis may be common or vanishingly rare.',
            es: 'No existe ninguna medición. La vida apareció en la Tierra en el primer ~10% de la historia del planeta, pero un solo dato no permite acotar una probabilidad: la abiogénesis puede ser común o extremadamente rara.'
        },
        sourceId: null,
        usedIn: ['default', 'presets.scientific', 'tooltips.fl'],
        reviewAfter: '2028-10'
    },
    {
        id: 'fi',
        symbol: 'fi',
        definition: {
            en: 'Fraction of life-bearing worlds where intelligent life evolves.',
            es: 'Fracción de mundos con vida donde evoluciona vida inteligente.'
        },
        value: 0.01,
        unit: { en: 'fraction', es: 'fracción' },
        range: [0.001, 1.0],
        slider: [0.001, 1],
        status: 'assumption',
        basis: {
            en: 'Intelligence is not an inevitable outcome of evolution. Life existed for about 3 billion years before complex brains appeared, and technological intelligence evolved once on Earth. This value is a guess.',
            es: 'La inteligencia no es un resultado inevitable de la evolución. La vida existió unos 3.000 millones de años antes de que aparecieran cerebros complejos, y la inteligencia tecnológica surgió una sola vez en la Tierra. Este valor es una conjetura.'
        },
        sourceId: null,
        usedIn: ['default', 'presets.scientific', 'tooltips.fi'],
        reviewAfter: '2028-10'
    },
    {
        id: 'fc',
        symbol: 'fc',
        definition: {
            en: 'Fraction of intelligent species that develop detectable technology.',
            es: 'Fracción de especies inteligentes que desarrollan tecnología detectable.'
        },
        value: 0.1,
        unit: { en: 'fraction', es: 'fracción' },
        range: [0.01, 1.0],
        slider: [0.01, 1],
        status: 'assumption',
        basis: {
            en: 'No data. Intelligence does not imply technology: it requires manipulative appendages, resources and a path that happens to produce detectable emissions. The value is an assumption.',
            es: 'No hay datos. La inteligencia no implica tecnología: hacen falta extremidades manipuladoras, recursos y una trayectoria que además produzca emisiones detectables. El valor es una suposición.'
        },
        sourceId: null,
        usedIn: ['default', 'presets.scientific', 'tooltips.fc'],
        reviewAfter: '2028-10'
    },
    {
        id: 'L',
        symbol: 'L',
        definition: {
            en: 'Average time a civilisation remains detectable, in years.',
            es: 'Tiempo medio que una civilización permanece detectable, en años.'
        },
        value: 10000,
        unit: { en: 'years', es: 'años' },
        range: [100, 1000000],
        slider: [100, 1000000],
        status: 'assumption',
        basis: {
            en: 'Unknown. Earth has been detectable by radio for about a century. N is linear in every factor, so L is not more important than the others; it simply spans the widest range of plausible values (100 to 1,000,000 years).',
            es: 'Desconocido. La Tierra es detectable por radio desde hace aproximadamente un siglo. N es lineal en todos los factores, así que L no es más importante que los demás: simplemente abarca el rango de valores plausibles más amplio (100 a 1.000.000 de años).'
        },
        sourceId: null,
        usedIn: ['default', 'presets.scientific', 'tooltips.L'],
        reviewAfter: '2028-10'
    }
];

export const DATASETS = {
    nasaCounts: {
        sourceId: 'nasaArchive',
        captured: '2026-10-15',
        total: 6451,
        habitable: 36,
        queryTotal: 'SELECT COUNT(*) FROM PSCompPars',
        queryHabitable: 'SELECT COUNT(*) FROM PSCompPars WHERE pl_eqt BETWEEN 180 AND 310 AND pl_rade <= 1.6',
        caveats: {
            en: 'The habitable count is a defined proxy (equilibrium temperature 180–310 K and radius ≤ 1.6 R⊕), not a detection of life. Radii must come from pl_rade (Earth radii); pl_radj is Jupiter radii and selects gas giants.',
            es: 'El recuento de habitables es un proxy definido (temperatura de equilibrio 180–310 K y radio ≤ 1,6 R⊕), no una detección de vida. Los radios deben tomarse de pl_rade (radios terrestres); pl_radj son radios de Júpiter y selecciona gigantes gaseosos.'
        }
    }
};

export const ASSUMPTIONS = [
    {
        id: 'uniform-disk',
        title: { en: 'Uniform distribution', es: 'Distribución uniforme' },
        text: {
            en: 'Civilisations are spread uniformly over a thin disk 100,000 light-years across. The typical separation is estimated as 0.5·√(A/N) with A = πR² and R = 50,000 ly.',
            es: 'Las civilizaciones se distribuyen uniformemente en un disco fino de 100.000 años luz de diámetro. La separación típica se estima como 0,5·√(A/N) con A = πR² y R = 50.000 años luz.'
        }
    },
    {
        id: 'constant-sfr',
        title: { en: 'Constant star formation', es: 'Formación estelar constante' },
        text: {
            en: 'The star formation rate is treated as constant over the last L years. Strictly, N should integrate the star formation history over the detectability window.',
            es: 'La tasa de formación estelar se trata como constante durante los últimos L años. En rigor, N debería integrar la historia de formación estelar en la ventana de detectabilidad.'
        }
    },
    {
        id: 'uncertainty-envelope',
        title: { en: 'Uncertainty is an envelope', es: 'La incertidumbre es una envolvente' },
        text: {
            en: 'The displayed range multiplies the extreme value of each factor. It is a plausibility envelope under worst-case independence, not a confidence interval: the probability of all seven extremes occurring at once is tiny.',
            es: 'El rango mostrado multiplica el valor extremo de cada factor. Es una envolvente de plausibilidad bajo independencia y casos extremos, no un intervalo de confianza: la probabilidad de que los siete extremos ocurran a la vez es ínfima.'
        }
    },
    {
        id: 'galaxy-visualisation',
        title: { en: 'The 3D galaxy is illustrative', es: 'La galaxia 3D es ilustrativa' },
        text: {
            en: 'A few tens of thousands of points stand in for roughly 200 billion stars. Colours show how far a star system could pass the Drake filters (potential), not a census of civilisations active now.',
            es: 'Unas decenas de miles de puntos representan unos 200.000 millones de estrellas. Los colores muestran hasta dónde podría llegar un sistema en los filtros de Drake (potencial), no un censo de civilizaciones activas ahora.'
        }
    }
];

/**
 * Complete sets of assumptions shown as presets. `historical: true` marks a
 * reconstruction of a past estimate whose values are deliberately not the
 * modern measurements (Sagan 1961-era R*, Drake's original 1961 values).
 */
export const PRESETS = {
    optimistic: {
        values: { Rstar: 3, fp: 1, ne: 1, fl: 1, fi: 1, fc: 0.2, L: 1000000 },
        label: { en: 'Optimistic', es: 'Optimista' },
        historical: false,
        basis: {
            en: 'Every parameter at the upper end of its plausible range: planets are ubiquitous, life and intelligence always appear, and civilisations last a million years.',
            es: 'Todos los parámetros en el extremo superior de su rango plausible: los planetas son ubicuos, la vida y la inteligencia siempre aparecen y las civilizaciones duran un millón de años.'
        }
    },
    sagan: {
        values: { Rstar: 10, fp: 1, ne: 1, fl: 1, fi: 1, fc: 0.1, L: 1000000 },
        label: { en: 'Sagan estimate', es: 'Estimación de Sagan' },
        historical: true,
        basis: {
            en: "Reconstruction of Carl Sagan's ~10^6 estimate. R* = 10 stars/yr reflects 1960s values, not the modern measurement of 1.5–3.",
            es: 'Reconstrucción de la estimación de Carl Sagan, ~10^6. R* = 10 estrellas/año refleja los valores de los años 60, no la medición moderna de 1,5–3.'
        }
    },
    scientific: {
        values: { Rstar: 1.5, fp: 1, ne: 0.2, fl: 0.1, fi: 0.01, fc: 0.1, L: 10000 },
        label: { en: 'Modern estimate', es: 'Estimación moderna' },
        historical: false,
        basis: {
            en: 'Modern estimate: measured star formation, planetary occurrence and habitable-zone occurrence, conservative guesses for the biological terms, and a 10,000-year detectability window.',
            es: 'Estimación moderna: formación estelar, ocurrencia planetaria y ocurrencia en zona habitable medidas; conjeturas conservadoras para los términos biológicos y una ventana de detectabilidad de 10.000 años.'
        }
    },
    drake: {
        values: { Rstar: 10, fp: 0.5, ne: 2, fl: 1, fi: 0.01, fc: 0.01, L: 10000 },
        label: { en: 'Drake 1961', es: 'Drake 1961' },
        historical: true,
        basis: {
            en: "Frank Drake's original 1961 values, which give N = 10. R* and ne reflect the estimates available at the Green Bank meeting.",
            es: 'Los valores originales de Frank Drake en 1961, que dan N = 10. R* y ne reflejan las estimaciones disponibles en la reunión de Green Bank.'
        }
    },
    rare_earth: {
        values: { Rstar: 1.5, fp: 1, ne: 0.1, fl: 0.001, fi: 0.001, fc: 0.1, L: 10000 },
        label: { en: 'Rare Earth', es: 'Tierra rara' },
        historical: false,
        basis: {
            en: 'The Rare Earth hypothesis: planetary systems and habitable planets are common, but the origin of life and the evolution of intelligence are both rare.',
            es: 'La hipótesis de la Tierra rara: los sistemas planetarios y los planetas habitables son comunes, pero el origen de la vida y la evolución de la inteligencia son ambos raros.'
        }
    },
    pessimistic: {
        values: { Rstar: 1.5, fp: 1, ne: 0.1, fl: 0.001, fi: 0.001, fc: 0.01, L: 100 },
        label: { en: 'Pessimistic', es: 'Pesimista' },
        historical: false,
        basis: {
            en: 'Everything unknown is assumed hostile: life and intelligence are rare, technology rarer still, and civilisations last only a century.',
            es: 'Todo lo desconocido se supone hostil: la vida y la inteligencia son raras, la tecnología aún más, y las civilizaciones duran solo un siglo.'
        }
    }
};

/**
 * Envelope factors used by the "plausibility range" readout. They are display
 * assumptions, not measurements; see ASSUMPTIONS.uncertainty-envelope.
 */
export const UNCERTAINTY_FACTORS = {
    Rstar: 1.5,
    fp: 1.5,
    ne: 3,
    fl: 10,
    fi: 100,
    fc: 100,
    L: 100
};

export function getReference(id) {
    return REFERENCES[id] ?? null;
}

export function cite(id) {
    const reference = getReference(id);
    if (!reference) throw new Error(`Unknown reference: ${id}`);
    return `${reference.shortAuthors} (${reference.year})`;
}
