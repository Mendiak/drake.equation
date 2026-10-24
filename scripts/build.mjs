/**
 * Assembles dist/ from src/ and the generated pages.
 *
 * src/ holds the calculator source (HTML, CSS, JS, assets). Everything that is
 * generated — the Spanish page, the guide pages and sitemap.xml — is written
 * straight into dist/, so the repository root stays free of build artifacts.
 *
 * Run with: npm run build
 */
import { execFileSync } from 'node:child_process';
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

console.log('Built dist/ from src/');
