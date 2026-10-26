/**
 * Assembles dist/ from src/ and the generated pages.
 *
 * src/ holds the calculator source (HTML, CSS, JS, assets). Everything that is
 * generated — the Spanish page, the guide pages and sitemap.xml — is written
 * straight into dist/, so the repository root stays free of build artifacts.
 * CSS and JavaScript are minified in place once every generator has finished.
 *
 * Run with: npm run build
 */
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';
import { DATASETS } from '../src/js/core/science.js';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(src, dist, { recursive: true });

// Generators write into dist/ and expect it to exist.
for (const script of ['scripts/generate-es.mjs', 'scripts/generate-content.mjs']) {
    execFileSync(process.execPath, [script], { cwd: root, stdio: 'inherit' });
}

/**
 * NASA's Exoplanet Archive does not send CORS headers, so the browser cannot
 * query it directly. Fetch the counters at build time and ship a same-origin
 * JSON file instead. If the network is unavailable the static fallback is used.
 */
async function writeNasaData() {
    const { total, habitable, captured, queryTotal, queryHabitable } = DATASETS.nasaCounts;
    const fallback = { total, habitable, updated: captured };
    const endpoints = {
        total: queryTotal,
        habitable: queryHabitable
    };
    const result = { ...fallback };

    await Promise.all(Object.entries(endpoints).map(async ([key, query]) => {
        try {
            const url = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(query)}&format=json`;
            const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
            if (!response.ok) return;
            const data = await response.json();
            const count = parseInt(data[0]?.['count(*)'], 10);
            if (Number.isFinite(count) && count > 0) {
                result[key] = count;
                result.updated = new Date().toISOString().slice(0, 10);
            }
        } catch {
            // Offline builds keep the documented snapshot from science.js.
        }
    }));

    await mkdir(path.join(dist, 'data'), { recursive: true });
    await writeFile(path.join(dist, 'data', 'nasa-exoplanets.json'), JSON.stringify(result), 'utf8');
    console.log(`NASA exoplanet counters: ${result.total} total, ${result.habitable} habitable candidates (${result.updated})`);
}

await writeNasaData();

async function* walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) yield* walk(entryPath);
        else yield entryPath;
    }
}

async function minifyAssets() {
    let minified = 0;
    for await (const file of walk(dist)) {
        const extension = path.extname(file);
        const loader = extension === '.css' ? 'css' : extension === '.js' ? 'js' : null;
        if (!loader) continue;

        const source = await readFile(file, 'utf8');
        const { code } = await transform(source, {
            loader,
            minify: true,
            target: loader === 'js' ? 'es2020' : undefined,
            legalComments: 'none'
        });
        await writeFile(file, code, 'utf8');
        minified += 1;
    }
    return minified;
}

const minified = await minifyAssets();
console.log(`Built dist/ from src/ and minified ${minified} CSS/JS files`);
