import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const PORT = 3456;
const DIR = new URL('.', import.meta.url).pathname;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // POST /annotations — save to disk
  if (req.method === 'POST' && req.url === '/annotations') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString();
    await writeFile(join(DIR, 'annotations.json'), body, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"ok":true}');
    console.log('  annotations.json saved');
    return;
  }

  // Static file server
  const path = req.url === '/' ? '/templates.html' : req.url.split('?')[0];
  try {
    const file = await readFile(join(DIR, path));
    const ext = extname(path);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain', 'Cache-Control': 'no-cache' });
    res.end(file);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(PORT, () => {
  console.log(`\n  Preview server running at http://localhost:${PORT}\n`);
  console.log('  Open examples:');
  console.log('    http://localhost:3456/examples/credit-card.html');
  console.log('    http://localhost:3456/examples/cryptoswitch.html');
  console.log('  Press Ctrl+C to stop\n');
});
