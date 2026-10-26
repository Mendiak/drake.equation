/**
 * Static SEO checks for the built site in dist/.
 *
 * Validates every URL in sitemap.xml: title and description length, canonical,
 * reciprocal hreflang, a single H1, a parseable JSON-LD block, and that every
 * internal link resolves to a file that actually exists. Also makes sure the
 * 404 page is noindex and that every index.html is listed in the sitemap.
 *
 * Run with: npm run seo   (after npm run build)
 */
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = path.join(root, 'dist');
const SITE = 'https://mendiak.github.io/drake.equation';
const SITE_PATH = '/drake.equation/';

const errors = [];
const warnings = [];

function fail(file, message) {
    errors.push(`${file}: ${message}`);
}

function warn(file, message) {
    warnings.push(`${file}: ${message}`);
}

function decodeEntities(value) {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ');
}

async function exists(file) {
    try {
        await access(file);
        return true;
    } catch {
        return false;
    }
}

function distFileFor(url) {
    if (!url.startsWith(`${SITE}/`) && url !== SITE) return null;
    let relative = url.slice(SITE.length).replace(/^\//, '');
    relative = relative.split('#')[0].split('?')[0];
    if (relative === '' || relative.endsWith('/')) relative = path.join(relative, 'index.html');
    else if (!path.extname(relative)) relative = path.join(relative, 'index.html');
    return path.join(dist, relative);
}

async function* walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) yield* walk(entryPath);
        else yield entryPath;
    }
}

const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const sitemapSet = new Set(sitemapUrls);

if (sitemapUrls.length === 0) fail('sitemap.xml', 'no <loc> entries found');

for (const url of sitemapUrls) {
    const file = distFileFor(url);
    const label = url.replace(SITE, '') || '/';

    if (!file || !(await exists(file))) {
        fail(label, 'URL in sitemap has no matching file');
        continue;
    }

    const html = await readFile(file, 'utf8');
    const expectedLang = url.startsWith(`${SITE}/es/`) ? 'es' : 'en';

    const htmlLang = html.match(/<html[^>]*\blang="([^"]+)"/)?.[1];
    if (htmlLang !== expectedLang) fail(label, `html lang is "${htmlLang}", expected "${expectedLang}"`);

    const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
    const titleLength = decodeEntities(title).trim().length;
    if (titleLength < 15) fail(label, `title too short (${titleLength} chars)`);
    else if (titleLength > 65) fail(label, `title too long (${titleLength} chars)`);
    else if (titleLength > 60) warn(label, `title may be truncated (${titleLength} chars)`);

    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
    const descriptionLength = decodeEntities(description).trim().length;
    if (descriptionLength < 50) fail(label, `description too short (${descriptionLength} chars)`);
    else if (descriptionLength > 170) fail(label, `description too long (${descriptionLength} chars)`);
    else if (descriptionLength > 160) warn(label, `description may be truncated (${descriptionLength} chars)`);

    const robots = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
    if (!robots.includes('index')) fail(label, 'missing indexable robots meta');

    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    if (canonical !== url) fail(label, `canonical is "${canonical}", expected "${url}"`);

    const hreflang = new Map(
        [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
            .map((match) => [match[1], match[2]])
    );
    for (const code of ['en', 'es', 'x-default']) {
        const target = hreflang.get(code);
        if (!target) fail(label, `missing hreflang="${code}"`);
        else if (!sitemapSet.has(target)) fail(label, `hreflang="${code}" points outside the sitemap: ${target}`);
    }

    const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1Count !== 1) fail(label, `expected exactly one <h1>, found ${h1Count}`);

    const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (jsonLdBlocks.length === 0) fail(label, 'no JSON-LD structured data');
    for (const block of jsonLdBlocks) {
        try {
            JSON.parse(block[1]);
        } catch (error) {
            fail(label, `invalid JSON-LD: ${error.message}`);
        }
    }

    for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
        const href = match[1];
        if (!href || href.startsWith('#') || /^(https?:|mailto:|tel:|data:|javascript:)/i.test(href)) continue;
        const target = new URL(href, url);
        if (!target.href.startsWith(SITE)) continue;
        const targetFile = distFileFor(target.href);
        if (targetFile && !(await exists(targetFile))) {
            fail(label, `broken internal link: ${href}`);
        }
    }
}

// Every built page should be discoverable through the sitemap.
for await (const file of walk(dist)) {
    if (!file.endsWith('index.html')) continue;
    const relative = path.relative(dist, file).split(path.sep).join('/');
    const url = `${SITE}/${relative.replace(/index\.html$/, '')}`;
    if (!sitemapSet.has(url)) fail(relative, 'page is not listed in sitemap.xml');
}

const notFound = path.join(dist, '404.html');
if (!(await exists(notFound))) {
    fail('404.html', 'missing custom 404 page');
} else {
    const html = await readFile(notFound, 'utf8');
    if (!/<meta name="robots" content="[^"]*noindex/.test(html)) fail('404.html', 'must be noindex');
    if (!(html.match(/<h1[\s>]/g) ?? []).length) fail('404.html', 'missing <h1>');
}

for (const message of warnings) console.warn(`warning  ${message}`);

if (errors.length > 0) {
    for (const message of errors) console.error(`error    ${message}`);
    console.error(`\n${errors.length} SEO error(s) found.`);
    process.exit(1);
}

console.log(`SEO checks passed for ${sitemapUrls.length} URLs${warnings.length ? ` (${warnings.length} warning(s))` : ''}.`);
