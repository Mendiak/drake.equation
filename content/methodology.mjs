/**
 * Published methodology page.
 *
 * The tables and the reference list are generated from src/js/core/science.js,
 * so the page cannot drift from the calculator: both read the same registry.
 * Add the page to `articles` in generate-content.mjs and it inherits the nav,
 * breadcrumbs, FAQ schema and sitemap entry.
 */
import {
    PARAMETERS,
    REFERENCES,
    DATASETS,
    ASSUMPTIONS,
    PRESETS,
    STATUS_LABELS,
    SCIENCE_VERSION,
    SCIENCE_REVIEWED,
    GALAXY
} from '../src/js/core/science.js';

const locale = (lang) => (lang === 'es' ? 'es-ES' : 'en-US');
const num = (value, lang) => new Intl.NumberFormat(locale(lang), { maximumFractionDigits: 3 }).format(value);

function formatN(value, lang) {
    if (value >= 0.001 && value < 1e7) return num(value, lang);
    const [mantissa, exponent] = value.toExponential(1).split('e');
    const coefficient = Number(mantissa).toLocaleString(locale(lang), { maximumFractionDigits: 1 });
    return `${coefficient} × 10<sup>${Number(exponent)}</sup>`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function sourceCell(parameter, lang) {
    if (!parameter.sourceId) {
        return lang === 'es' ? 'Sin medición directa' : 'No direct measurement';
    }
    const reference = REFERENCES[parameter.sourceId];
    return `<a href="${reference.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(reference.shortAuthors)} (${reference.year})</a>`;
}

function parameterTable(lang) {
    const strings = lang === 'es'
        ? { symbol: 'Símbolo', term: 'Término', value: 'Valor por defecto', range: 'Rango plausible', status: 'Estado', source: 'Fuente' }
        : { symbol: 'Symbol', term: 'Term', value: 'Default', range: 'Plausible range', status: 'Status', source: 'Source' };

    const rows = PARAMETERS.map((parameter) => {
        const range = `${num(parameter.range[0], lang)} – ${num(parameter.range[1], lang)}`;
        return `<tr>
            <th scope="row"><span class="content-table-symbol">${escapeHtml(parameter.symbol)}</span></th>
            <td>${escapeHtml(parameter.definition[lang])}</td>
            <td class="content-table-number">${num(parameter.value, lang)}</td>
            <td class="content-table-number">${range}</td>
            <td><span class="content-badge content-badge-${parameter.status}">${escapeHtml(STATUS_LABELS[parameter.status][lang])}</span></td>
            <td>${sourceCell(parameter, lang)}</td>
        </tr>`;
    }).join('\n');

    return `<div class="content-table-wrap">
        <table class="content-table">
            <caption class="sr-only">${lang === 'es' ? 'Valores y fuentes de los siete términos de la ecuación de Drake' : 'Values and sources for the seven terms of the Drake equation'}</caption>
            <thead><tr>
                <th scope="col">${strings.symbol}</th>
                <th scope="col">${strings.term}</th>
                <th scope="col">${strings.value}</th>
                <th scope="col">${strings.range}</th>
                <th scope="col">${strings.status}</th>
                <th scope="col">${strings.source}</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>
    </div>`;
}

function parameterBasis(lang) {
    return PARAMETERS.map((parameter) => `<h3><span class="content-formula-inline">${escapeHtml(parameter.symbol)}</span> — ${escapeHtml(parameter.definition[lang])}</h3>
        <p><strong>${lang === 'es' ? 'Estado' : 'Status'}:</strong> ${escapeHtml(STATUS_LABELS[parameter.status][lang])} · <strong>${lang === 'es' ? 'Fuente' : 'Source'}:</strong> ${sourceCell(parameter, lang)}</p>
        <p>${escapeHtml(parameter.basis[lang])}</p>`).join('\n');
}

function datasetBlock(lang) {
    const dataset = DATASETS.nasaCounts;
    const reference = REFERENCES[dataset.sourceId];
    const labels = lang === 'es'
        ? { total: 'planetas confirmados', habitable: 'candidatos en zona habitable', captured: 'Fecha de captura', query: 'Consulta TAP' }
        : { total: 'confirmed planets', habitable: 'habitable-zone candidates', captured: 'Capture date', query: 'TAP query' };

    return `<p>${escapeHtml(reference.title)} — <a href="${reference.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(reference.authors)}</a>.</p>
    <ul>
        <li><strong>${labels.captured}:</strong> ${dataset.captured}</li>
        <li><strong>${labels.total}:</strong> ${num(dataset.total, lang)}</li>
        <li><strong>${labels.habitable}:</strong> ${num(dataset.habitable, lang)}</li>
    </ul>
    <p><strong>${labels.query}:</strong></p>
    <pre class="content-code"><code>${escapeHtml(dataset.queryTotal)}</code></pre>
    <pre class="content-code"><code>${escapeHtml(dataset.queryHabitable)}</code></pre>
    <p>${escapeHtml(dataset.caveats[lang])}</p>`;
}

function assumptionsList(lang) {
    return `<ul>${ASSUMPTIONS.map((assumption) => `<li><strong>${escapeHtml(assumption.title[lang])}.</strong> ${escapeHtml(assumption.text[lang])}</li>`).join('\n')}</ul>`;
}

function presetTable(lang) {
    const headers = lang === 'es'
        ? { preset: 'Ajuste', basis: 'Supuesto', n: 'N resultante' }
        : { preset: 'Preset', basis: 'Assumption', n: 'Resulting N' };

    const rows = Object.entries(PRESETS).map(([, preset]) => {
        const n = Object.values(preset.values).reduce((product, value) => product * value, 1);
        return `<tr>
            <th scope="row">${escapeHtml(preset.label[lang])}${preset.historical ? ` <span class="content-badge content-badge-assumption">${lang === 'es' ? 'histórico' : 'historical'}</span>` : ''}</th>
            <td>${escapeHtml(preset.basis[lang])}</td>
            <td class="content-table-number">${formatN(n, lang)}</td>
        </tr>`;
    }).join('\n');

    return `<div class="content-table-wrap"><table class="content-table">
        <caption class="sr-only">${lang === 'es' ? 'Ajustes predefinidos y su resultado' : 'Presets and their result'}</caption>
        <thead><tr><th scope="col">${headers.preset}</th><th scope="col">${headers.basis}</th><th scope="col">${headers.n}</th></tr></thead>
        <tbody>${rows}</tbody>
    </table></div>`;
}

function referenceList(lang) {
    const accessed = lang === 'es' ? 'consultado' : 'accessed';
    return `<ol class="content-references">${Object.values(REFERENCES).map((reference) => {
        const doi = reference.doi
            ? ` <a href="${reference.url}" target="_blank" rel="noopener noreferrer">doi:${escapeHtml(reference.doi)}</a>.`
            : ` <a href="${reference.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(reference.url)}</a>.`;
        return `<li>${escapeHtml(reference.authors)} (${reference.year}). <em>${escapeHtml(reference.title)}</em>. ${escapeHtml(reference.container)}.${doi} <span class="content-reference-meta">(${accessed} ${reference.accessed})</span></li>`;
    }).join('\n')}</ol>`;
}

const galaxyStarsEn = num(GALAXY.stars, 'en');
const galaxyStarsEs = num(GALAXY.stars, 'es');

export const methodologyArticle = {
    id: 'methodology',
    slugs: { en: 'methodology', es: 'metodologia' },
    en: {
        short: 'Method & sources',
        title: 'Methodology and Sources | Drake Equation',
        description: 'Every value in the Drake Equation calculator traced to a source, a date and a status, including the NASA Exoplanet Archive queries and the scientific changelog.',
        eyebrow: 'Transparency',
        h1: 'Methodology and sources',
        lead: 'This page documents where every number comes from, how confident we are in it, and what the calculator does <em>not</em> claim. It is generated from the same scientific registry that feeds the calculator, so the documentation cannot drift from the tool.',
        readingTime: 6,
        sections: [
            {
                id: 'scope',
                heading: 'What this page is',
                body: `<p>The calculator multiplies seven terms. Some of them are measured, some are derived from measurements, and some are honest guesses. Mixing those categories without saying so is the most common way a Drake Equation tool misleads its reader, so each value carries a status:</p>
                <ul>
                    <li><strong>Observed</strong> — measured with an instrument, with the uncertainty quoted by the source.</li>
                    <li><strong>Derived</strong> — computed from measurements plus an explicit modelling choice (for example, converting a star formation rate in solar masses per year into stars per year).</li>
                    <li><strong>Assumption</strong> — no direct measurement exists. The value is a documented choice, not a result.</li>
                </ul>
                <p>Registry version <strong>${SCIENCE_VERSION}</strong>, reviewed <time datetime="${SCIENCE_REVIEWED}">${SCIENCE_REVIEWED}</time>. Any change to a value or its justification is recorded in the <a href="https://github.com/Mendiak/drake.equation/blob/main/docs/science/changelog.md" target="_blank" rel="noopener noreferrer">scientific changelog</a>.</p>`
            },
            {
                id: 'equation',
                heading: 'The equation and its units',
                body: `<p class="content-formula">N = R* &times; f<sub>p</sub> &times; n<sub>e</sub> &times; f<sub>l</sub> &times; f<sub>i</sub> &times; f<sub>c</sub> &times; L</p>
                <p><strong>N</strong> is the number of civilisations in the Milky Way whose emissions are detectable <em>now</em>. It is not the number that has ever existed. That distinction lives in L: a civilisation that lasted a thousand years, two billion years ago, contributes nothing to N today.</p>
                <p>The product is only dimensionally consistent if R* is a rate (stars per year) and L is a time (years). Their product, R* × L, is the number of stars formed during the detectability window — which is why the funnel chart starts there rather than at the ${galaxyStarsEn} stars of the Galaxy.</p>
                <p>N is linear in every one of the seven factors. Doubling any term doubles N. No factor is intrinsically more important than another; what differs is how well we know it. The relative uncertainty is concentrated in f<sub>l</sub>, f<sub>i</sub>, f<sub>c</sub> and L.</p>`
            },
            {
                id: 'terms',
                heading: 'The seven terms',
                body: `${parameterTable('en')}
                <p class="content-note">The plausible range is the interval used to build the uncertainty envelope, not a confidence interval. The default is the value shown on first load.</p>
                <h3>Basis for each value</h3>
                ${parameterBasis('en')}`
            },
            {
                id: 'presets',
                heading: 'Presets',
                body: `<p>Presets are complete sets of assumptions, not measurements. Two of them are historical reconstructions and are marked as such: their star formation rate reflects 1960s estimates, not the modern measurement.</p>
                ${presetTable('en')}
                <p class="content-note">N is recomputed from the seven values, so the table is a check on arithmetic as well as on documentation.</p>`
            },
            {
                id: 'datasets',
                heading: 'Exoplanet data',
                body: `<p>The counters are a snapshot of the NASA Exoplanet Archive captured at build time. They are not fetched live in the browser: the archive does not send CORS headers, and a reproducible snapshot is easier to audit than a number that changes silently.</p>
                ${datasetBlock('en')}`
            },
            {
                id: 'assumptions',
                heading: 'Model assumptions',
                body: `<p>These are the choices that turn the equation into a specific number. They are not measurements and can be challenged independently of the sources above.</p>
                ${assumptionsList('en')}`
            },
            {
                id: 'limitations',
                heading: 'Known limitations',
                body: `<ul>
                    <li><strong>A point estimate is not a probability.</strong> N is a product of central values. The distribution of plausible answers is broad and skewed, and a single number hides that. For a probabilistic treatment, see {{source:sandberg2018}}.</li>
                    <li><strong>The plausibility envelope is not a confidence interval.</strong> It multiplies the extreme value of every factor. The probability of all seven extremes happening together is negligible.</li>
                    <li><strong>The habitable zone is not habitability.</strong> Surface liquid water also requires an atmosphere, a magnetic field and a stable star. Subsurface oceans can exist far outside the classical zone.</li>
                    <li><strong>The galaxy visualisation is illustrative.</strong> A few tens of thousands of points stand in for ~${galaxyStarsEn} stars. Colours show potential, not a census.</li>
                    <li><strong>There is no scientific consensus</strong> on f<sub>l</sub>, f<sub>i</sub>, f<sub>c</sub> or L. Any label suggesting otherwise would be wrong.</li>
                </ul>`
            },
            {
                id: 'changelog',
                heading: 'Scientific changelog',
                body: `<div class="content-table-wrap"><table class="content-table">
                    <thead><tr><th scope="col">Version</th><th scope="col">Date</th><th scope="col">Changes</th></tr></thead>
                    <tbody>
                        <tr>
                            <th scope="row">${SCIENCE_VERSION}</th>
                            <td>${SCIENCE_REVIEWED}</td>
                            <td>First documented release. Fixed the habitable-zone query (pl_radj → pl_rade), refreshed the exoplanet counts, marked estimated radii and masses, replaced the linear "sensitivity" claim with the correct elasticity, and renamed the "Modern Consensus" preset to "Modern Estimate".</td>
                        </tr>
                    </tbody>
                </table></div>`
            },
            {
                id: 'cite',
                heading: 'How to cite this tool',
                body: `<p>Aramendia, M. (2026). <em>Drake Equation Calculator — scientific documentation</em> (v${SCIENCE_VERSION}, reviewed ${SCIENCE_REVIEWED}). https://mendiak.github.io/drake.equation/methodology/</p>
                <h3>References</h3>
                ${referenceList('en')}`
            }
        ],
        faq: [
            {
                q: 'What do "observed", "derived" and "assumption" mean?',
                a: 'Observed means measured with an instrument. Derived means computed from measurements plus an explicit modelling choice. Assumption means no direct measurement exists and the value is a documented guess.'
            },
            {
                q: 'Why is the default estimate below one civilisation?',
                a: 'Because the measured factors are multiplied by conservative guesses for the origin of life, the evolution of intelligence, technology and longevity. A product of plausible fractions can easily fall below one, which means "probably none at any given time", not "certainly none".'
            },
            {
                q: 'Is the displayed range a confidence interval?',
                a: 'No. It is a plausibility envelope: the product of the extreme value of each factor. It shows how wide the ignorance is, not the probability of each outcome.'
            },
            {
                q: 'Where do the exoplanet counters come from?',
                a: 'From a build-time snapshot of the NASA Exoplanet Archive. The exact TAP queries and the capture date are listed on this page, and the generated JSON ships with the site.'
            }
        ]
    },
    es: {
        short: 'Método y fuentes',
        title: 'Metodología y fuentes | Ecuación de Drake',
        description: 'Cada valor de la Ecuación de Drake con su fuente, fecha y estado, incluidas las consultas al Archivo de Exoplanetas de la NASA y el registro de cambios.',
        eyebrow: 'Transparencia',
        h1: 'Metodología y fuentes',
        lead: 'Esta página documenta de dónde sale cada número, cuánta confianza merece y qué <em>no</em> afirma la calculadora. Se genera desde el mismo registro científico que alimenta la herramienta, así que la documentación no puede separarse de lo que se muestra.',
        readingTime: 6,
        sections: [
            {
                id: 'scope',
                heading: 'Qué es esta página',
                body: `<p>La calculadora multiplica siete términos. Algunos están medidos, otros se derivan de mediciones y otros son conjeturas honestas. Mezclar esas categorías sin decirlo es la forma más común de que una herramienta sobre la ecuación de Drake engañe a quien la lee, así que cada valor lleva un estado:</p>
                <ul>
                    <li><strong>Observado</strong> — medido con un instrumento, con la incertidumbre que indica la fuente.</li>
                    <li><strong>Derivado</strong> — calculado a partir de mediciones más una decisión explícita de modelado (por ejemplo, convertir una tasa de formación estelar en masas solares por año a estrellas por año).</li>
                    <li><strong>Suposición</strong> — no existe medición directa. El valor es una elección documentada, no un resultado.</li>
                </ul>
                <p>Versión del registro <strong>${SCIENCE_VERSION}</strong>, revisada el <time datetime="${SCIENCE_REVIEWED}">${SCIENCE_REVIEWED}</time>. Cualquier cambio de un valor o de su justificación queda registrado en el <a href="https://github.com/Mendiak/drake.equation/blob/main/docs/science/changelog.md" target="_blank" rel="noopener noreferrer">registro de cambios científicos</a>.</p>`
            },
            {
                id: 'equation',
                heading: 'La ecuación y sus unidades',
                body: `<p class="content-formula">N = R* &times; f<sub>p</sub> &times; n<sub>e</sub> &times; f<sub>l</sub> &times; f<sub>i</sub> &times; f<sub>c</sub> &times; L</p>
                <p><strong>N</strong> es el número de civilizaciones de la Vía Láctea cuyas emisiones son detectables <em>ahora</em>. No es el número que ha existido alguna vez. Esa distinción vive en L: una civilización que duró mil años hace dos mil millones de años no aporta nada a N hoy.</p>
                <p>El producto solo es dimensionalmente coherente si R* es una tasa (estrellas por año) y L es un tiempo (años). Su producto, R* × L, es el número de estrellas formadas durante la ventana de detectabilidad; por eso el embudo empieza ahí y no en los ${galaxyStarsEs} estrellas de la galaxia.</p>
                <p>N es lineal en cada uno de los siete factores. Duplicar cualquier término duplica N. Ningún factor es intrínsecamente más importante que otro; lo que cambia es cuánto lo conocemos. La incertidumbre relativa se concentra en f<sub>l</sub>, f<sub>i</sub>, f<sub>c</sub> y L.</p>`
            },
            {
                id: 'terms',
                heading: 'Los siete términos',
                body: `${parameterTable('es')}
                <p class="content-note">El rango plausible es el intervalo usado para construir la envolvente de incertidumbre, no un intervalo de confianza. El valor por defecto es el que aparece al cargar la página.</p>
                <h3>Base de cada valor</h3>
                ${parameterBasis('es')}`
            },
            {
                id: 'presets',
                heading: 'Ajustes predefinidos',
                body: `<p>Los ajustes son conjuntos completos de supuestos, no mediciones. Dos de ellos son reconstrucciones históricas y se marcan como tales: su tasa de formación estelar refleja estimaciones de los años 60, no la medición moderna.</p>
                ${presetTable('es')}
                <p class="content-note">N se recalcula a partir de los siete valores, así que la tabla también comprueba la aritmética.</p>`
            },
            {
                id: 'datasets',
                heading: 'Datos de exoplanetas',
                body: `<p>Los contadores son una instantánea del Archivo de Exoplanetas de la NASA capturada al construir el sitio. No se consultan en vivo desde el navegador: el archivo no envía cabeceras CORS y una instantánea reproducible es más fácil de auditar que un número que cambia sin aviso.</p>
                ${datasetBlock('es')}`
            },
            {
                id: 'assumptions',
                heading: 'Supuestos del modelo',
                body: `<p>Estas son las decisiones que convierten la ecuación en un número concreto. No son mediciones y se pueden discutir con independencia de las fuentes anteriores.</p>
                ${assumptionsList('es')}`
            },
            {
                id: 'limitations',
                heading: 'Limitaciones conocidas',
                body: `<ul>
                    <li><strong>Una estimación puntual no es una probabilidad.</strong> N es un producto de valores centrales. La distribución de respuestas plausibles es amplia y asimétrica, y un solo número la oculta. Para un tratamiento probabilístico, véase {{source:sandberg2018}}.</li>
                    <li><strong>La envolvente de plausibilidad no es un intervalo de confianza.</strong> Multiplica el valor extremo de cada factor. La probabilidad de que los siete extremos coincidan es insignificante.</li>
                    <li><strong>La zona habitable no es habitabilidad.</strong> El agua líquida en superficie requiere además atmósfera, campo magnético y una estrella estable. Los océanos subsuperficiales pueden existir muy fuera de la zona clásica.</li>
                    <li><strong>La visualización de la galaxia es ilustrativa.</strong> Unas decenas de miles de puntos representan ~${galaxyStarsEs} estrellas. Los colores muestran potencial, no un censo.</li>
                    <li><strong>No hay consenso científico</strong> sobre f<sub>l</sub>, f<sub>i</sub>, f<sub>c</sub> ni L. Cualquier etiqueta que sugiera lo contrario sería falsa.</li>
                </ul>`
            },
            {
                id: 'changelog',
                heading: 'Registro de cambios científicos',
                body: `<div class="content-table-wrap"><table class="content-table">
                    <thead><tr><th scope="col">Versión</th><th scope="col">Fecha</th><th scope="col">Cambios</th></tr></thead>
                    <tbody>
                        <tr>
                            <th scope="row">${SCIENCE_VERSION}</th>
                            <td>${SCIENCE_REVIEWED}</td>
                            <td>Primera versión documentada. Corregida la consulta de zona habitable (pl_radj → pl_rade), actualizados los recuentos de exoplanetas, marcados los radios y masas estimados, sustituida la afirmación de «sensibilidad» lineal por la elasticidad correcta y renombrado el ajuste «Consenso moderno» como «Estimación moderna».</td>
                        </tr>
                    </tbody>
                </table></div>`
            },
            {
                id: 'cite',
                heading: 'Cómo citar esta herramienta',
                body: `<p>Aramendia, M. (2026). <em>Ecuación de Drake — documentación científica</em> (v${SCIENCE_VERSION}, revisada el ${SCIENCE_REVIEWED}). https://mendiak.github.io/drake.equation/es/metodologia/</p>
                <h3>Referencias</h3>
                ${referenceList('es')}`
            }
        ],
        faq: [
            {
                q: '¿Qué significan «observado», «derivado» y «suposición»?',
                a: 'Observado significa medido con un instrumento. Derivado significa calculado a partir de mediciones más una decisión explícita de modelado. Suposición significa que no existe medición directa y el valor es una conjetura documentada.'
            },
            {
                q: '¿Por qué la estimación por defecto es inferior a una civilización?',
                a: 'Porque los factores medidos se multiplican por conjeturas conservadoras sobre el origen de la vida, la evolución de la inteligencia, la tecnología y la longevidad. Un producto de fracciones plausibles puede caer por debajo de uno, lo que significa «probablemente ninguna en un momento dado», no «ninguna con certeza».'
            },
            {
                q: '¿El rango mostrado es un intervalo de confianza?',
                a: 'No. Es una envolvente de plausibilidad: el producto del valor extremo de cada factor. Muestra la amplitud de la ignorancia, no la probabilidad de cada resultado.'
            },
            {
                q: '¿De dónde salen los contadores de exoplanetas?',
                a: 'De una instantánea del Archivo de Exoplanetas de la NASA capturada al construir el sitio. Las consultas TAP exactas y la fecha de captura se detallan en esta página, y el JSON generado se publica con el sitio.'
            }
        ]
    }
};
