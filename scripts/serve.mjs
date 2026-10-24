/**
 * Minimal static server for the built site.
 *
 * Serves dist/ with the right MIME types and index.html fallback for
 * directories. No dependencies, so it works with a fresh `npm install`.
 *
 * Run with: npm run preview   (after npm run build)
 *           npm run serve     (builds first)
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.resolve(fileURLToPath(new URL('..', import.meta.url))), 'dist');
const port = Number(process.env.PORT) || 8080;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

createServer(async (req, res) => {
    try {
        const { pathname } = new URL(req.url, 'http://localhost');
        let filePath = path.join(root, decodeURIComponent(pathname));

        if (filePath !== root && !filePath.startsWith(root + path.sep)) {
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('403 Forbidden');
            return;
        }

        const info = await stat(filePath).catch(() => null);
        if (info?.isDirectory()) filePath = path.join(filePath, 'index.html');

        const body = await readFile(filePath);
        res.writeHead(200, {
            'Content-Type': MIME[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream'
        });
        res.end(body);
    } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
    }
}).listen(port, () => {
    console.log(`Serving dist/ at http://localhost:${port}`);
});
