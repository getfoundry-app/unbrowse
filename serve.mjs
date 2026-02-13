import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, extname } from 'node:path';

const DIST = resolve(import.meta.dirname, 'unbrowse-frontend/dist');
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png' };

createServer((req, res) => {
  let p = resolve(DIST, '.' + (req.url === '/' ? '/index.html' : req.url));
  if (!existsSync(p)) p = resolve(DIST, 'index.html');
  try {
    const data = readFileSync(p);
    res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(4111, () => console.log('Serving on :4111'));
