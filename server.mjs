import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, normalize } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const port = 4173;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

createServer(async (request, response) => {
  const pathname = request.url === '/' ? 'index.html' : request.url.split('?')[0].replace(/^\/+/, '');
  const target = normalize(join(root, pathname));

  if (!target.startsWith(root)) {
    response.writeHead(403).end();
    return;
  }

  try {
    const body = await readFile(target);
    response.writeHead(200, { 'Content-Type': mimeTypes[extname(target)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Tetris server listening at http://127.0.0.1:${port}`);
});
