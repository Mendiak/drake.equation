/**
 * Scientific integrity checks.
 *
 * Verifies that the registry (src/js/core/science.js), the calculator defaults
 * (src/js/core/config.js), the HTML sliders and the shipped NASA snapshot all
 * agree, and that no value claims more certainty than its source supports.
 *
 * Run with: npm run science
 * Runs in `npm run check` (before the build) and again after the build in CI so
 * the generated data file is covered too.
 */
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    PARAMETERS,
    REFERENCES,
    DATASETS,
    PRESETS,
    SCIENCE_VERSION,
    UNCERTAINTY_FACTORS
} from '../src/js/core/science.js';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const errors = [];
const warnings = [];

function fail(message) {
    errors.push(message);
}

function warn(message) {
    warnings.push(message);
}

const FRACTIONS = new Set(['fp', 'fl', 'fi', 'fc']);
const isFractionKey = (key) => FRACTIONS.has(key);

// ── 1. Registry structure ───────────────────────────────────────────────────

const ids = new Set();
for (const parameter of PARAMETERS) {
    if (ids.has(parameter.id)) fail(`science.js: duplicate parameter id "${parameter.id}"`);
    ids.add(parameter.id);

    if (!['observed', 'derived', 'assumption'].includes(parameter.status)) {
        fail(`science.js: ${parameter.id} has invalid status "${parameter.status}"`);
    }
    if (!(parameter.value > 0)) fail(`science.js: ${parameter.id} value must be positive`);
    if (!Array.isArray(parameter.range) || parameter.range[0] >= parameter.range[1]) {
        fail(`science.js: ${parameter.id} has an invalid plausible range`);
    }
    if (!Array.isArray(parameter.slider) || parameter.slider[0] >= parameter.slider[1]) {
        fail(`science.js: ${parameter.id} has an invalid slider range`);
    }
    if (parameter.value < parameter.slider[0] || parameter.value > parameter.slider[1]) {
        fail(`science.js: ${parameter.id} default is outside the slider range`);
    }
    if (isFractionKey(parameter.id) && parameter.value > 1) {
        fail(`science.js: ${parameter.id} is a fraction but its default is ${parameter.value}`);
    }
    if (!parameter.definition?.en || !parameter.definition?.es) {
        fail(`science.js: ${parameter.id} needs a bilingual definition`);
    }
    if (!parameter.basis?.en || !parameter.basis?.es) {
        fail(`science.js: ${parameter.id} needs a bilingual basis`);
    }
    if (!parameter.usedIn?.length) warn(`science.js: ${parameter.id} is not referenced anywhere`);

    if (!/^\d{4}-\d{2}$/.test(parameter.reviewAfter ?? '')) {
        fail(`science.js: ${parameter.id} needs reviewAfter as YYYY-MM`);
    } else if (parameter.reviewAfter < new Date().toISOString().slice(0, 7)) {
        warn(`science.js: ${parameter.id} review is overdue (${parameter.reviewAfter})`);
    }
}

// ── 2. References ───────────────────────────────────────────────────────────

for (const [id, reference] of Object.entries(REFERENCES)) {
    for (const field of ['authors', 'shortAuthors', 'title', 'year', 'url', 'accessed']) {
        if (!reference[field]) fail(`science.js: reference "${id}" is missing ${field}`);
    }
    if (reference.url && !/^https?:\/\//.test(reference.url)) {
        fail(`science.js: reference "${id}" has a non-absolute URL`);
    }
    if (!reference.doi && !reference.url) {
        fail(`science.js: reference "${id}" needs a DOI or a URL`);
    }
}

for (const parameter of PARAMETERS) {
    if (parameter.status === 'assumption') {
        if (parameter.sourceId) {
            fail(`science.js: ${parameter.id} is an assumption but claims a source`);
        }
        continue;
    }
    if (!parameter.sourceId) {
        fail(`science.js: ${parameter.id} is ${parameter.status} but has no source`);
    } else if (!REFERENCES[parameter.sourceId]) {
        fail(`science.js: ${parameter.id} points to unknown source "${parameter.sourceId}"`);
    }
}

// ── 3. Defaults and presets agree with the registry ────────────────────────

const { defaultValues, presets } = await import('../src/js/core/config.js');

for (const parameter of PARAMETERS) {
    if (defaultValues[parameter.id] !== parameter.value) {
        fail(`config.js: ${parameter.id} default is ${defaultValues[parameter.id]}, registry says ${parameter.value}`);
    }
}

for (const [id, preset] of Object.entries(PRESETS)) {
    if (!presets[id]) {
        fail(`config.js: preset "${id}" is missing`);
        continue;
    }
    for (const [key, value] of Object.entries(preset.values)) {
        if (presets[id][key] !== value) {
            fail(`config.js: preset "${id}" ${key} is ${presets[id][key]}, registry says ${value}`);
        }
        const parameter = PARAMETERS.find((entry) => entry.id === key);
        if (!parameter) {
            fail(`science.js: preset "${id}" uses unknown parameter "${key}"`);
            continue;
        }
        if (isFractionKey(key) && (value < 0 || value > 1)) {
            fail(`science.js: preset "${id}" ${key} is a fraction outside [0, 1]`);
        }
        if (value < parameter.slider[0] || value > parameter.slider[1]) {
            fail(`science.js: preset "${id}" ${key} is outside the slider range`);
        }
        if (!preset.historical && (value < parameter.range[0] || value > parameter.range[1])) {
            fail(`science.js: preset "${id}" ${key} is outside the plausible range`);
        }
    }
    if (!preset.basis?.en || !preset.basis?.es) {
        fail(`science.js: preset "${id}" needs a bilingual basis`);
    }
    if (!preset.label?.en || !preset.label?.es) {
        fail(`science.js: preset "${id}" needs a bilingual label`);
    }
}

for (const [id, value] of Object.entries(presets.scientific)) {
    if (defaultValues[id] !== value) {
        fail(`config.js: the scientific preset must equal the documented defaults (${id})`);
    }
}

// ── 4. Arithmetic and the plausibility envelope ─────────────────────────────

const product = (values) => Object.values(values).reduce((accumulator, value) => accumulator * value, 1);

if (Math.abs(product(PRESETS.drake.values) - 10) > 1e-9) {
    fail(`science.js: Drake's original values must give N = 10, got ${product(PRESETS.drake.values)}`);
}

const { calculateConfidenceRange } = await import('../src/js/core/uncertainty.js');

for (const [id, preset] of Object.entries(PRESETS)) {
    const n = product(preset.values);
    const range = calculateConfidenceRange(preset.values);

    if (!(range.min <= n && n <= range.max)) {
        fail(`uncertainty.js: preset "${id}" N = ${n} falls outside its envelope [${range.min}, ${range.max}]`);
    }
    if (range.min < 0) fail(`uncertainty.js: preset "${id}" has a negative lower bound`);
}

for (const key of FRACTIONS) {
    if (!(key in UNCERTAINTY_FACTORS)) {
        fail(`uncertainty.js: fraction "${key}" has no envelope factor`);
    }
}

// ── 5. NASA dataset and its shipped snapshot ────────────────────────────────

const dataset = DATASETS.nasaCounts;
if (!dataset || !dataset.sourceId || !REFERENCES[dataset.sourceId]) {
    fail('science.js: the NASA dataset needs a valid sourceId');
} else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataset.captured)) {
        fail('science.js: dataset.captured must be YYYY-MM-DD');
    }
    if (!dataset.queryTotal || !dataset.queryHabitable) {
        fail('science.js: the NASA dataset needs both queries');
    }
    for (const query of [dataset.queryTotal, dataset.queryHabitable]) {
        if (/pl_radj/.test(query)) fail('science.js: NASA queries must not use pl_radj (Jupiter radii)');
    }
    if (!/pl_rade/.test(dataset.queryHabitable)) {
        fail('science.js: the habitable-zone query must filter on pl_rade (Earth radii)');
    }
    if (!Number.isInteger(dataset.total) || dataset.total <= 0) fail('science.js: dataset.total must be a positive integer');
    if (!Number.isInteger(dataset.habitable) || dataset.habitable <= 0) fail('science.js: dataset.habitable must be a positive integer');
    if (dataset.habitable >= dataset.total) fail('science.js: habitable candidates cannot exceed the total');
}

const snapshotPath = path.join(root, 'dist', 'data', 'nasa-exoplanets.json');
try {
    await access(snapshotPath);
    const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'));
    for (const key of ['total', 'habitable', 'updated']) {
        if (snapshot[key] === undefined) fail(`dist/data/nasa-exoplanets.json: missing "${key}"`);
    }
    if (!Number.isInteger(snapshot.total) || !Number.isInteger(snapshot.habitable)) {
        fail('dist/data/nasa-exoplanets.json: counters must be integers');
    }
    if (snapshot.habitable > snapshot.total) {
        fail('dist/data/nasa-exoplanets.json: habitable candidates exceed the total');
    }
    const ageDays = (Date.now() - new Date(`${snapshot.updated}T00:00:00Z`).getTime()) / 86400000;
    if (!Number.isFinite(ageDays)) {
        fail('dist/data/nasa-exoplanets.json: invalid "updated" date');
    } else if (ageDays > 200) {
        fail(`dist/data/nasa-exoplanets.json: snapshot is ${Math.round(ageDays)} days old; rebuild to refresh it`);
    }
} catch {
    warn('dist/data/nasa-exoplanets.json not found (run npm run build to check the shipped snapshot)');
}

// ── 6. HTML sliders match the registry ─────────────────────────────────────

const indexHtml = await readFile(path.join(root, 'src', 'index.html'), 'utf8');
for (const parameter of PARAMETERS) {
    const match = indexHtml.match(new RegExp(`<input[^>]*id="${parameter.id}"[^>]*>`));
    if (!match) {
        fail(`src/index.html: missing slider for ${parameter.id}`);
        continue;
    }
    const value = Number(match[0].match(/\bvalue="([^"]+)"/)?.[1]);
    if (value !== parameter.value) {
        fail(`src/index.html: slider ${parameter.id} starts at ${value}, registry says ${parameter.value}`);
    }
}

// ── 7. Claims that were removed must not come back ─────────────────────────

const BANNED = [
    { phrase: 'Modern Consensus', file: 'translations/README', why: 'no scientific consensus exists for fl, fi, fc or L' },
    { phrase: 'Consenso moderno', file: 'translations/README', why: 'no existe consenso científico sobre fl, fi, fc ni L' },
    { phrase: 'Live data from NASA', file: 'translations/README', why: 'the counters are a build-time snapshot' },
    { phrase: 'Datos en vivo', file: 'translations/README', why: 'los contadores son una instantánea de build' },
    { phrase: 'Only planets in the \'Goldilocks Zone\' can support liquid water', file: 'translations', why: 'subsurface oceans exist outside the habitable zone' },
    { phrase: 'The most critical factor', file: 'translations', why: 'N is linear in all seven factors' },
    { phrase: '10 orders of magnitude', file: 'translations/articles', why: 'the envelope spans about sixteen orders' },
    { phrase: '10 órdenes de magnitud', file: 'translations/articles', why: 'la envolvente abarca unos dieciséis órdenes' },
    { phrase: 'ten orders of magnitude', file: 'articles', why: 'the envelope spans about sixteen orders' }
];

const scannable = {
    translations: await readFile(path.join(root, 'src', 'js', 'i18n', 'translations.js'), 'utf8'),
    articles: await readFile(path.join(root, 'content', 'articles.mjs'), 'utf8'),
    README: await readFile(path.join(root, 'README.md'), 'utf8')
};

for (const { phrase, file, why } of BANNED) {
    const targets = file === 'translations/README'
        ? [scannable.translations, scannable.README]
        : file.split('/').flatMap((name) => (name === 'translations' || name === 'articles' ? [scannable[name]] : []));
    for (const target of targets) {
        if (target.includes(phrase)) fail(`banned phrase "${phrase}" (${why})`);
    }
}

// ── Report ──────────────────────────────────────────────────────────────────

for (const message of warnings) console.warn(`warning  ${message}`);
for (const message of errors) console.error(`error    ${message}`);

if (errors.length > 0) {
    console.error(`\n${errors.length} scientific check error(s) found.`);
    process.exit(1);
}

console.log(`Scientific checks passed (registry v${SCIENCE_VERSION}, ${PARAMETERS.length} parameters, ${Object.keys(REFERENCES).length} references${warnings.length ? `, ${warnings.length} warning(s)` : ''}).`);
