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
    title: 'Calculadora de la Ecuación de Drake | Civilizaciones',
    description: 'Calculadora interactiva de la Ecuación de Drake: estima cuántas civilizaciones avanzadas podrían existir en la Vía Láctea y ajusta los siete factores.',
    ogTitle: 'Calculadora de la Ecuación de Drake | Civilizaciones',
    ogDescription: 'Explora la Ecuación de Drake con calculadora en vivo, gráficos de sensibilidad, simulación 3D de la Vía Láctea y datos reales de exoplanetas.',
    twitterDescription: 'Explora la Ecuación de Drake con calculadora en vivo, gráficos de sensibilidad y simulación 3D de la Vía Láctea.',
    imageAlt: 'Calculadora de la Ecuación de Drake con una simulación 3D de la Vía Láctea y gráficos de sensibilidad'
};

const JSON_LD_ES = `    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebApplication",
                "@id": "${SITE}/es/#app",
                "name": "Calculadora de la Ecuación de Drake",
                "alternateName": "Drake Equation Calculator",
                "url": "${SITE}/es/",
                "description": "Calculadora interactiva de la Ecuación de Drake para estimar el número de civilizaciones avanzadas en la Vía Láctea.",
                "applicationCategory": "EducationalApplication",
                "operatingSystem": "Web Browser",
                "browserRequirements": "Requiere JavaScript",
                "inLanguage": "es",
                "isAccessibleForFree": true,
                "dateModified": "2026-10-24",
                "featureList": [
                    "Cálculo en tiempo real de la Ecuación de Drake",
                    "Gráfico de análisis de sensibilidad",
                    "Embudo del filtro cósmico",
                    "Simulación 3D de la Vía Láctea",
                    "Datos de exoplanetas de la NASA"
                ],
                "screenshot": {
                    "@type": "ImageObject",
                    "url": "${SITE}/assets/images/og_image.png",
                    "width": 1200,
                    "height": 630
                },
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "author": {
                    "@type": "Person",
                    "name": "Mikel Aramendia",
                    "url": "https://mendiak.github.io/portfolio/",
                    "sameAs": [
                        "https://github.com/Mendiak"
                    ]
                },
                "publisher": {
                    "@id": "${SITE}/#organization"
                },
                "isPartOf": {
                    "@id": "${SITE}/#website"
                },
                "keywords": "Ecuación de Drake, SETI, astrobiología, civilizaciones extraterrestres, exoplanetas, paradoja de Fermi",
                "educationalAlignment": {
                    "@type": "EducationalAlignment",
                    "alignmentType": "educationalSubject",
                    "targetName": "Astronomía"
                }
            },
            {
                "@type": "Organization",
                "@id": "${SITE}/#organization",
                "name": "Drake Equation Calculator",
                "url": "${SITE}/",
                "logo": {
                    "@type": "ImageObject",
                    "url": "${SITE}/assets/images/apple-touch-icon.png",
                    "width": 180,
                    "height": 180
                },
                "sameAs": [
                    "https://github.com/Mendiak"
                ]
            },
            {
                "@type": "WebSite",
                "@id": "${SITE}/#website",
                "url": "${SITE}/",
                "name": "Drake Equation Calculator",
                "inLanguage": [
                    "en",
                    "es"
                ],
                "publisher": {
                    "@id": "${SITE}/#organization"
                }
            },
            {
                "@type": "FAQPage",
                "@id": "${SITE}/es/#faq",
                "inLanguage": "es",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "¿Cómo funciona esta calculadora de la Ecuación de Drake?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Multiplica los siete factores de la ecuación —R*, fp, ne, fl, fi, fc y L— y muestra N, el número de civilizaciones que podrían estar comunicándose en la Vía Láctea ahora mismo. Cada control actualiza el resultado al instante."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "¿Por qué el resultado puede cambiar en órdenes de magnitud?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Varios términos son desconocidos por factores de diez o más. Multiplicar números inciertos acumula la incertidumbre en lugar de promediarla, así que pequeños cambios en fl, fi o L pueden llevar N de menos de uno a millones."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "¿Qué significan los presets?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Los presets son conjuntos completos de supuestos: Científico optimista, Sagan, los valores originales de Drake de 1961, Consenso moderno, Tierra rara y Científico pesimista. Son puntos de partida para comparar, no mediciones."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "¿Un N alto demuestra que existen extraterrestres?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No. N es una estimación construida a partir de supuestos, no una observación. Un N alto hace más desconcertante el silencio del cielo —la paradoja de Fermi—, pero no demuestra que haya alguien ahí fuera."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "¿Por qué la galaxia 3D muestra más estrellas que N?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "La simulación colorea cada estrella según hasta dónde avanza por los filtros de Drake, incluidas estrellas que podrían albergar vida pero ninguna civilización detectable hoy. N cuenta solo civilizaciones activas ahora, por eso puede ser mucho menor, o cero."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "¿Qué cuenta como planeta habitable?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "ne es el número medio de planetas por sistema que podrían albergar vida. Estar en la zona habitable permite el agua líquida, pero no es suficiente por sí solo: la atmósfera, el campo magnético y la geología también importan."
                        }
                    }
                ]
            }
        ]
    }
    </script>
`;

const HEAD_REPLACEMENTS = [
    ['<html lang="en">', '<html lang="es">'],
    [`<link rel="canonical" href="${SITE}/">`, `<link rel="canonical" href="${SITE}/es/">`],
    ['<meta property="og:locale" content="en_US">', '<meta property="og:locale" content="es_ES">'],
    ['<meta property="og:locale:alternate" content="es_ES">', '<meta property="og:locale:alternate" content="en_US">'],
    // Spanish page: force the UI language regardless of previous visits.
    ['    <link rel="stylesheet" href="./css/index.css">', '    <script>window.__DRAKE_LANG__ = "es";</script>\n    <link rel="stylesheet" href="../css/index.css">'],
    ['href="./assets/images/favicon.svg"', 'href="../assets/images/favicon.svg"'],
    ['href="./assets/images/favicon.png"', 'href="../assets/images/favicon.png"'],
    ['href="./assets/images/apple-touch-icon.png"', 'href="../assets/images/apple-touch-icon.png"'],
    ['<script type="module" src="js/app.js"></script>', '<script type="module" src="../js/app.js"></script>'],
    // Guide cards and FAQ links point at the Spanish articles.
    ['href="./what-is-the-drake-equation/"', 'href="./que-es-la-ecuacion-de-drake/"'],
    ['href="./fermi-paradox/"', 'href="./paradoja-de-fermi/"'],
    ['href="./habitable-zone/"', 'href="./zona-habitable/"'],
    ['href="./seti-technosignatures/"', 'href="./seti-y-tecnofirmas/"'],
    ['href="./methodology/"', 'href="./metodologia/"'],
    // Language switcher links point to the sibling page.
    ['<a class="lang-btn active" data-lang="en" hreflang="en" lang="en" aria-current="page" href="./">EN</a>', '<a class="lang-btn" data-lang="en" hreflang="en" lang="en" href="../">EN</a>'],
    ['<a class="lang-btn" data-lang="es" hreflang="es" lang="es" href="./es/">ES</a>', '<a class="lang-btn active" data-lang="es" hreflang="es" lang="es" aria-current="page" href="./">ES</a>']
];

// The English copy in these tags can change at any time, so match the tags by
// attribute instead of by their exact wording.
const HEAD_META_REPLACEMENTS = [
    [/<title>[\s\S]*?<\/title>/, `<title>${HEAD_ES.title}</title>`],
    [/<meta name="description" content="[^"]*">/, `<meta name="description" content="${HEAD_ES.description}">`],
    [/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${SITE}/es/">`],
    [/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${HEAD_ES.ogTitle}">`],
    [/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${HEAD_ES.ogDescription}">`],
    [/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${HEAD_ES.imageAlt}">`],
    [/<meta name="twitter:url" content="[^"]*">/, `<meta name="twitter:url" content="${SITE}/es/">`],
    [/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${HEAD_ES.ogTitle}">`],
    [/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${HEAD_ES.twitterDescription}">`],
    [/<meta name="twitter:image:alt" content="[^"]*">/, `<meta name="twitter:image:alt" content="${HEAD_ES.imageAlt}">`]
];

function replaceOrThrow(html, from, to, label) {
    const found = typeof from === 'string' ? html.includes(from) : from.test(html);
    if (!found) throw new Error(`Missing fragment while building es/: ${label}`);
    return typeof from === 'string' ? html.split(from).join(to) : html.replace(from, to);
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

for (const [pattern, to] of HEAD_META_REPLACEMENTS) {
    html = replaceOrThrow(html, pattern, to, pattern.source);
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
