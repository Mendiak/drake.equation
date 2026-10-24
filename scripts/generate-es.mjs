/**
 * Generates the static Spanish page at dist/es/index.html from src/index.html.
 *
 * Why: a client-side language toggle is invisible to search engines. Each
 * language needs its own URL, canonical and translated HTML so it can be
 * indexed independently.
 *
 * Run with: npm run build:es
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translations } from '../src/js/i18n/translations.js';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const SITE = 'https://mendiak.github.io/drake.equation';

const es = translations.es;

const HEAD_ES = {
    title: 'Calculadora de la Ecuación de Drake | Estima civilizaciones extraterrestres',
    description: 'Calculadora interactiva de la Ecuación de Drake para estimar el número de civilizaciones avanzadas en la Vía Láctea. Explora los parámetros, el análisis de sensibilidad y la simulación 3D de la galaxia.',
    ogTitle: 'Calculadora de la Ecuación de Drake | Estima civilizaciones extraterrestres',
    ogDescription: 'Herramienta interactiva para explorar la Ecuación de Drake y estimar las civilizaciones comunicativas de la Vía Láctea, con simulación 3D y análisis de sensibilidad.',
    twitterDescription: 'Herramienta interactiva para explorar la Ecuación de Drake y estimar las civilizaciones comunicativas de la Vía Láctea. Incluye simulación 3D.',
    imageAlt: 'Calculadora de la Ecuación de Drake con una simulación 3D de la Vía Láctea y gráficos de sensibilidad'
};

const JSON_LD_ES = `    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Calculadora de la Ecuación de Drake",
        "alternateName": "Drake Equation Calculator",
        "url": "${SITE}/es/",
        "description": "Calculadora interactiva de la Ecuación de Drake para estimar el número de civilizaciones avanzadas en la Vía Láctea.",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web Browser",
        "browserRequirements": "Requiere JavaScript",
        "inLanguage": "es",
        "isAccessibleForFree": true,
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": {
            "@type": "Person",
            "name": "Mendiak",
            "url": "https://github.com/mendiak"
        },
        "keywords": "Ecuación de Drake, SETI, astrobiología, civilizaciones extraterrestres, exoplanetas, paradoja de Fermi",
        "educationalAlignment": {
            "@type": "EducationalAlignment",
            "alignmentType": "educationalSubject",
            "targetName": "Astronomía"
        }
    }
    </script>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "inLanguage": "es",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "¿Qué es la Ecuación de Drake?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "La Ecuación de Drake (N = R* × fp × ne × fl × fi × fc × L) es un marco probabilístico formulado por el Dr. Frank Drake en 1961 para estimar el número de civilizaciones extraterrestres activas y comunicativas en la galaxia de la Vía Láctea."
                }
            },
            {
                "@type": "Question",
                "name": "¿Qué es la Paradoja de Fermi?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "La Paradoja de Fermi pregunta: si la Ecuación de Drake sugiere que deberían existir muchas civilizaciones, ¿por qué no hemos encontrado evidencia de ellas? Las posibles respuestas incluyen el Gran Filtro, civilizaciones de corta duración o distancias vastas que impiden el contacto."
                }
            },
            {
                "@type": "Question",
                "name": "¿Qué es la Zona Habitable en la Ecuación de Drake?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "La Zona Habitable (o Zona Ricitos de Oro) es la región alrededor de una estrella donde las condiciones podrían ser adecuadas para la existencia de agua líquida. Se relaciona con el parámetro ne: el número de planetas similares a la Tierra por sistema que podrían albergar vida."
                }
            },
            {
                "@type": "Question",
                "name": "¿Qué son las tecnofirmas y SETI?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Las tecnofirmas son señales de tecnología avanzada que podrían detectarse de forma remota, como señales de radio o megaestructuras. SETI (Búsqueda de Inteligencia Extraterrestre) utiliza radiotelescopios y otros métodos para buscar estas señales, relacionándose con el parámetro fc: la fracción de civilizaciones que desarrollan tecnología detectable."
                }
            },
            {
                "@type": "Question",
                "name": "¿Qué es el Gran Filtro?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "El Gran Filtro es un desafío hipotético que impide que la vida alcance una etapa avanzada y capaz de viajar al espacio. Si N es bajo, el filtro probablemente quedó atrás (la vida es rara). Si N es alto pero no vemos evidencia, el filtro puede estar adelante (las civilizaciones tienden a autodestruirse)."
                }
            },
            {
                "@type": "Question",
                "name": "¿Cuántas estrellas hay en la Vía Láctea?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "La Vía Láctea contiene aproximadamente entre 200 mil y 400 mil millones de estrellas. La Ecuación de Drake ayuda a estimar cuántas de esas estrellas podrían albergar civilizaciones inteligentes y comunicativas."
                }
            }
        ]
    }
    </script>
`;

const HEAD_REPLACEMENTS = [
    ['<html lang="en">', '<html lang="es">'],
    ['<title>Drake Equation Calculator | Estimate Extraterrestrial Civilizations</title>', `<title>${HEAD_ES.title}</title>`],
    ['<meta name="description" content="Interactive Drake Equation calculator to estimate the number of advanced civilizations in the Milky Way. Explore parameters, sensitivity analysis, and 3D galaxy simulation.">', `<meta name="description" content="${HEAD_ES.description}">`],
    [`<link rel="canonical" href="${SITE}/">`, `<link rel="canonical" href="${SITE}/es/">`],
    [`<meta property="og:url" content="${SITE}/">`, `<meta property="og:url" content="${SITE}/es/">`],
    [`<meta property="og:title" content="Drake Equation Calculator | Estimate Extraterrestrial Civilizations">`, `<meta property="og:title" content="${HEAD_ES.ogTitle}">`],
    ['<meta property="og:description" content="Interactive tool to explore the Drake Equation and estimate communicative civilizations in the Milky Way. Features 3D galaxy simulation and sensitivity analysis.">', `<meta property="og:description" content="${HEAD_ES.ogDescription}">`],
    ['<meta property="og:image:alt" content="Drake Equation calculator with a 3D Milky Way simulation and sensitivity charts">', `<meta property="og:image:alt" content="${HEAD_ES.imageAlt}">`],
    ['<meta property="og:locale" content="en_US">', '<meta property="og:locale" content="es_ES">'],
    ['<meta property="og:locale:alternate" content="es_ES">', '<meta property="og:locale:alternate" content="en_US">'],
    [`<meta name="twitter:url" content="${SITE}/">`, `<meta name="twitter:url" content="${SITE}/es/">`],
    [`<meta name="twitter:title" content="Drake Equation Calculator | Estimate Extraterrestrial Civilizations">`, `<meta name="twitter:title" content="${HEAD_ES.ogTitle}">`],
    ['<meta name="twitter:description" content="Interactive tool to explore the Drake Equation and estimate communicative civilizations in the Milky Way. Features 3D galaxy simulation.">', `<meta name="twitter:description" content="${HEAD_ES.twitterDescription}">`],
    ['<meta name="twitter:image:alt" content="Drake Equation calculator with a 3D Milky Way simulation and sensitivity charts">', `<meta name="twitter:image:alt" content="${HEAD_ES.imageAlt}">`],
    // Spanish page: force the UI language regardless of previous visits.
    ['    <link rel="stylesheet" href="./css/index.css">', '    <script>window.__DRAKE_LANG__ = "es";</script>\n    <link rel="stylesheet" href="../css/index.css">'],
    ['href="./assets/images/favicon.png"', 'href="../assets/images/favicon.png"'],
    ['<script type="module" src="js/app.js"></script>', '<script type="module" src="../js/app.js"></script>'],
    // Guide cards point at the Spanish articles.
    ['href="./what-is-the-drake-equation/"', 'href="./que-es-la-ecuacion-de-drake/"'],
    ['href="./fermi-paradox/"', 'href="./paradoja-de-fermi/"'],
    ['href="./habitable-zone/"', 'href="./zona-habitable/"'],
    ['href="./seti-technosignatures/"', 'href="./seti-y-tecnofirmas/"'],
    // Language switcher links point to the sibling page.
    ['<a class="lang-btn active" data-lang="en" hreflang="en" lang="en" aria-current="true" href="./">EN</a>', '<a class="lang-btn" data-lang="en" hreflang="en" lang="en" href="../">EN</a>'],
    ['<a class="lang-btn" data-lang="es" hreflang="es" lang="es" href="./es/">ES</a>', '<a class="lang-btn active" data-lang="es" hreflang="es" lang="es" aria-current="page" href="./">ES</a>']
];

function replaceOrThrow(html, from, to, label) {
    if (!html.includes(from)) throw new Error(`Missing fragment while building es/: ${label}`);
    return html.split(from).join(to);
}

function resolveKey(dict, key) {
    return key.split('.').reduce((value, part) => (value == null ? undefined : value[part]), dict);
}

function escapeAttribute(value) {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Replace the inner HTML of every element carrying data-i18n. */
function translateElements(html) {
    const opening = /<([a-zA-Z][a-zA-Z0-9-]*)([^>]*\sdata-i18n="([^"]+)"[^>]*)>/g;
    const edits = [];
    const missing = new Set();
    let match;

    while ((match = opening.exec(html)) !== null) {
        const [full, tagName, , key] = match;
        const value = resolveKey(es, key);
        if (typeof value !== 'string') {
            missing.add(key);
            continue;
        }

        const contentStart = match.index + full.length;
        const sameTag = new RegExp(`<(/?)${tagName}\\b[^>]*>`, 'gi');
        sameTag.lastIndex = contentStart;
        let depth = 1;
        let closeStart = -1;
        let closeEnd = -1;
        let inner;

        while ((inner = sameTag.exec(html)) !== null) {
            if (inner[1] === '/') depth--;
            else if (!inner[0].endsWith('/>')) depth++;

            if (depth === 0) {
                closeStart = inner.index;
                closeEnd = inner.index + inner[0].length;
                break;
            }
        }

        if (closeStart === -1) continue;
        edits.push({ start: contentStart, end: closeStart, value });
    }

    for (let i = edits.length - 1; i >= 0; i--) {
        const edit = edits[i];
        // Nested data-i18n elements: the outer translation wins.
        const nested = edits.some(other => other !== edit && other.start > edit.start && other.end < edit.end);
        if (nested) continue;
        html = html.slice(0, edit.start) + edit.value + html.slice(edit.end);
    }

    if (missing.size > 0) {
        console.warn('Missing es translations for:', [...missing].join(', '));
    }

    // Static aria-label / title attributes
    html = applyI18nAttribute(html, 'data-i18n-aria-label', 'aria-label');
    html = applyI18nAttribute(html, 'data-i18n-title', 'title');

    return html;
}

function applyI18nAttribute(html, dataAttr, targetAttr) {
    const tagPattern = new RegExp(`<[^>]*${dataAttr}="[^"]+"[^>]*>`, 'g');

    return html.replace(tagPattern, (tag) => {
        const keyMatch = tag.match(new RegExp(`${dataAttr}="([^"]+)"`));
        if (!keyMatch) return tag;

        const value = resolveKey(es, keyMatch[1]);
        if (typeof value !== 'string') return tag;

        const attrPattern = new RegExp(`\\s${targetAttr}="[^"]*"`);
        if (attrPattern.test(tag)) {
            return tag.replace(attrPattern, ` ${targetAttr}="${escapeAttribute(value)}"`);
        }
        return tag.replace(/>$/, ` ${targetAttr}="${escapeAttribute(value)}">`);
    });
}

let html = await readFile(path.join(root, 'src', 'index.html'), 'utf8');

for (const [from, to] of HEAD_REPLACEMENTS) {
    html = replaceOrThrow(html, from, to, from.slice(0, 60));
}

// Swap the whole structured-data block for the Spanish version
const jsonLdPattern = /[ ]{4}<!-- Schema\.org JSON-LD -->[\s\S]*?(?=[ ]{4}<!-- Google tag)/;
if (!jsonLdPattern.test(html)) throw new Error('Missing fragment while building es/: Schema.org block');
html = html.replace(jsonLdPattern, JSON_LD_ES);

html = translateElements(html);

const outDir = path.join(root, 'dist', 'es');
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'index.html'), html, 'utf8');

console.log('Generated es/index.html');
