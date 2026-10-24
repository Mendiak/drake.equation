/**
 * Builds the static guide pages for both languages into dist/ and refreshes
 * dist/sitemap.xml.
 *
 * Run with: npm run build:content
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { articles, ui, SITE, LAST_UPDATED } from '../content/articles.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = path.join(root, 'dist');
const byId = new Map(articles.map((article) => [article.id, article]));

const TELESCOPE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                        <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44" />
                        <path d="m13.56 11.747 4.332-.924" />
                        <path d="m16 21-3.105-6.21" />
                        <path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z" />
                        <path d="m6.158 8.633 1.114 4.456" />
                        <path d="m8 21 3.105-6.21" />
                        <circle cx="12" cy="13" r="2" />
                    </svg>`;

const GA = `    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZXLS14C7VJ"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-ZXLS14C7VJ');
    </script>`;

const FONTS = `    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        rel="stylesheet" media="print" onload="this.media='all'">`;

function escapeAttribute(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function pagePath(lang, slug) {
    return `${SITE}/${lang === 'es' ? 'es/' : ''}${slug}/`;
}

function resolveTokens(html, lang) {
    return html
        .replaceAll('{{calc}}', lang === 'es' ? '../../' : '../')
        .replace(/\{\{article:([a-z]+)\}\}/g, (match, id) => {
            const target = byId.get(id);
            if (!target) throw new Error(`Unknown article token: ${id}`);
            return `../${target.slugs[lang]}/`;
        });
}

function renderJsonLd(article, lang, canonical) {
    const copy = article[lang];
    const strings = ui[lang];
    const graph = [
        {
            '@type': 'Article',
            '@id': `${canonical}#article`,
            headline: copy.h1,
            description: copy.description,
            inLanguage: lang,
            datePublished: LAST_UPDATED,
            dateModified: LAST_UPDATED,
            author: {
                '@type': 'Person',
                name: 'Mikel Aramendia',
                url: 'https://mendiak.github.io/portfolio/'
            },
            publisher: {
                '@type': 'Organization',
                name: 'Drake Equation Calculator',
                url: `${SITE}/`
            },
            mainEntityOfPage: { '@id': canonical },
            image: `${SITE}/assets/images/og_image.png`,
            about: ['Drake equation', 'Astrobiology', 'Search for extraterrestrial intelligence']
        },
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: strings.home,
                    item: `${SITE}/${lang === 'es' ? 'es/' : ''}`
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: copy.h1,
                    item: canonical
                }
            ]
        }
    ];

    if (copy.faq && copy.faq.length > 0) {
        graph.push({
            '@type': 'FAQPage',
            mainEntity: copy.faq.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a }
            }))
        });
    }

    return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 4)
        .replace(/</g, '\\u003c');
}

function renderPage(article, lang) {
    const copy = article[lang];
    const strings = ui[lang];
    const prefix = lang === 'es' ? '../../' : '../';
    const calcHref = lang === 'es' ? '../../' : '../';
    const canonical = pagePath(lang, article.slugs[lang]);
    const xDefault = pagePath('en', article.slugs.en);
    const locale = lang === 'es' ? 'es_ES' : 'en_US';
    const alternateLocale = lang === 'es' ? 'en_US' : 'es_ES';
    const dateLabel = new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', {
        month: 'long',
        year: 'numeric'
    }).format(new Date(`${LAST_UPDATED}T12:00:00Z`));

    const nav = [
        `<a href="${calcHref}">${strings.calc}</a>`,
        ...articles.map((entry) => {
            const current = entry.id === article.id ? ' aria-current="page"' : '';
            return `<a href="../${entry.slugs[lang]}/"${current}>${entry[lang].short}</a>`;
        })
    ].join('\n                    ');

    const languageLinks = lang === 'es'
        ? `<a class="lang-btn" data-lang="en" hreflang="en" lang="en" href="../../${article.slugs.en}/">EN</a>
                        <span class="lang-divider" aria-hidden="true">|</span>
                        <a class="lang-btn active" data-lang="es" hreflang="es" lang="es" aria-current="page" href="./">ES</a>`
        : `<a class="lang-btn active" data-lang="en" hreflang="en" lang="en" aria-current="page" href="./">EN</a>
                        <span class="lang-divider" aria-hidden="true">|</span>
                        <a class="lang-btn" data-lang="es" hreflang="es" lang="es" href="../es/${article.slugs.es}/">ES</a>`;

    const tocItems = copy.sections
        .map((section) => `<li><a href="#${section.id}">${section.heading}</a></li>`)
        .join('\n                        ');

    const sections = copy.sections
        .map((section) => `<section id="${section.id}">
                    <h2>${section.heading}</h2>
                    ${resolveTokens(section.body.trim(), lang)}
                </section>`)
        .join('\n\n                ');

    const faq = copy.faq && copy.faq.length > 0
        ? `<section class="content-faq" aria-labelledby="faq-title">
                    <h2 id="faq-title">${strings.faq}</h2>
                    ${copy.faq.map((item) => `<h3>${item.q}</h3>
                    <p>${item.a}</p>`).join('\n                    ')}
                </section>`
        : '';

    const related = articles
        .filter((entry) => entry.id !== article.id)
        .map((entry) => `<li><a href="../${entry.slugs[lang]}/">${entry[lang].short}<span aria-hidden="true">&rarr;</span></a></li>`)
        .join('\n                        ');

    const jsonLd = renderJsonLd(article, lang, canonical);

    return `<!DOCTYPE html>
<html lang="${lang}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeAttribute(copy.title)}</title>
    <meta name="description" content="${escapeAttribute(copy.description)}">
    <meta name="author" content="Mikel Aramendia">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#ffffff">
    <link rel="canonical" href="${canonical}">
    <link rel="alternate" hreflang="en" href="${xDefault}">
    <link rel="alternate" hreflang="es" href="${pagePath('es', article.slugs.es)}">
    <link rel="alternate" hreflang="x-default" href="${xDefault}">
    <link rel="sitemap" type="application/xml" href="${SITE}/sitemap.xml" />
    <link rel="stylesheet" href="${prefix}css/index.css">
    <link rel="icon" type="image/png" href="${prefix}assets/images/favicon.png" />
    <link rel="apple-touch-icon" href="${prefix}assets/images/favicon.png" />
${FONTS}
    <meta name="google-site-verification" content="7tAbK2WB9Cx4uF76izgXcrBdBXVeqDfUd9A97KrLewU" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Drake Equation Calculator">
    <meta property="og:url" content="${canonical}">
    <meta property="og:title" content="${escapeAttribute(copy.title)}">
    <meta property="og:description" content="${escapeAttribute(copy.description)}">
    <meta property="og:image" content="${SITE}/assets/images/og_image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeAttribute(copy.h1)}">
    <meta property="og:locale" content="${locale}">
    <meta property="og:locale:alternate" content="${alternateLocale}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${canonical}">
    <meta name="twitter:title" content="${escapeAttribute(copy.title)}">
    <meta name="twitter:description" content="${escapeAttribute(copy.description)}">
    <meta name="twitter:image" content="${SITE}/assets/images/og_image.png">
    <meta name="twitter:image:alt" content="${escapeAttribute(copy.h1)}">

${GA}

    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
${jsonLd}
    </script>
</head>

<body>
    <a class="skip-link" href="#main-content">${strings.skip}</a>
    <div class="container">
        <header class="content-header">
            <div class="content-nav">
                <a class="content-brand" href="${calcHref}">
                    ${TELESCOPE_SVG}
                    <span>${strings.brand}</span>
                </a>
                <div class="lang-switcher" role="group" aria-label="${strings.language}">
                    ${languageLinks}
                </div>
            </div>
            <nav class="content-nav-links" aria-label="${strings.guides}">
                    ${nav}
            </nav>
        </header>

        <main id="main-content">
            <article class="content-page content-article">
                <p class="content-eyebrow">${copy.eyebrow}</p>
                <h1>${copy.h1}</h1>
                <p class="content-lead">${copy.lead}</p>
                <p class="content-meta">${strings.updated} ${dateLabel} &middot; ${copy.readingTime} ${strings.minRead} &middot; ${strings.authorship}</p>

                <nav class="content-toc" aria-labelledby="toc-title">
                    <h2 id="toc-title">${strings.toc}</h2>
                    <ol>
                        ${tocItems}
                    </ol>
                </nav>

                <div class="content-body">
                ${sections}

                ${faq}
                </div>

                <div class="content-cta">
                    <h2>${strings.ctaTitle}</h2>
                    <p>${strings.ctaText}</p>
                    <a href="${calcHref}">${strings.ctaLabel} <span aria-hidden="true">&rarr;</span></a>
                </div>

                <nav class="content-related" aria-labelledby="related-title">
                    <h2 id="related-title">${strings.related}</h2>
                    <ul>
                        ${related}
                    </ul>
                </nav>
            </article>
        </main>
    </div>

    <footer>
        <div class="footer-content">
            <p>&copy; <span id="current-year"></span> <a href="https://mendiak.github.io/portfolio/" target="_blank" rel="noopener noreferrer">Mikel Aramendia</a> |
                <a href="https://github.com/Mendiak/drake.equation" target="_blank" rel="noopener noreferrer">${strings.source}</a> |
                <a href="${calcHref}">${strings.calc}</a></p>
        </div>
    </footer>

    <script>
        document.getElementById('current-year').textContent = new Date().getFullYear();
    </script>
</body>

</html>
`;
}

function renderSitemap() {
    const calculators = [
        { loc: `${SITE}/`, priority: '1.0' },
        { loc: `${SITE}/es/`, priority: '0.9' }
    ];

    const calculatorEntries = calculators.map((entry) => `  <url>
    <loc>${entry.loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/" />
    <xhtml:link rel="alternate" hreflang="es" href="${SITE}/es/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/" />
    <lastmod>${LAST_UPDATED}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${entry.priority}</priority>
  </url>`);

    const articleEntries = articles.flatMap((article) => {
        const en = pagePath('en', article.slugs.en);
        const es = pagePath('es', article.slugs.es);
        return [en, es].map((loc) => `  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${en}" />
    <xhtml:link rel="alternate" hreflang="es" href="${es}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${en}" />
    <lastmod>${LAST_UPDATED}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${calculatorEntries.join('\n')}
${articleEntries.join('\n')}
</urlset>
`;
}

let generated = 0;

await mkdir(dist, { recursive: true });

for (const article of articles) {
    for (const lang of ['en', 'es']) {
        const dir = path.join(dist, lang === 'es' ? 'es' : '', article.slugs[lang]);
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, 'index.html'), renderPage(article, lang), 'utf8');
        generated += 1;
    }
}

await writeFile(path.join(dist, 'sitemap.xml'), renderSitemap(), 'utf8');

console.log(`Generated ${generated} guide pages and sitemap.xml`);
