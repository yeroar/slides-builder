import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const PORT = parseInt(process.env.PORT, 10) || 3456;
const DIR = new URL('.', import.meta.url).pathname;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
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

  // POST /edit-storybook — text overrides for storybook pages
  if (req.method === 'POST' && req.url === '/edit-storybook') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const { key, selector, text } = JSON.parse(Buffer.concat(chunks).toString());
    try {
      const filePath = join(DIR, 'template-overrides.json');
      let overrides = {};
      try { overrides = JSON.parse(await readFile(filePath, 'utf-8')); } catch {}
      if (!overrides[key]) overrides[key] = {};
      overrides[key][selector] = text;
      await writeFile(filePath, JSON.stringify(overrides, null, 2), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
      console.log(`  ✏️  Override saved: ${key} → ${selector}`);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // POST /deck-settings — save deck settings per file
  if (req.method === 'POST' && req.url === '/deck-settings') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const { file, title, copy, start } = JSON.parse(Buffer.concat(chunks).toString());
    try {
      const filePath = join(DIR, 'deck-settings.json');
      let settings = {};
      try { settings = JSON.parse(await readFile(filePath, 'utf-8')); } catch {}
      settings[file] = { title, copy, start };
      await writeFile(filePath, JSON.stringify(settings, null, 2), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
      console.log(`  ⚙️  Deck settings saved for ${file}`);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // GET /deck-settings?file=... — load deck settings
  if (req.method === 'GET' && req.url.startsWith('/deck-settings')) {
    try {
      const data = JSON.parse(await readFile(join(DIR, 'deck-settings.json'), 'utf-8'));
      const params = new URL(req.url, 'http://localhost').searchParams;
      const file = params.get('file');
      const result = file && data[file] ? data[file] : {};
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      res.end(JSON.stringify(result));
    } catch {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{}');
    }
    return;
  }

  // GET /edit-storybook — load overrides
  if (req.method === 'GET' && req.url === '/edit-storybook') {
    try {
      const data = await readFile(join(DIR, 'template-overrides.json'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      res.end(data);
    } catch {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{}');
    }
    return;
  }

  // POST /edit — inline edit, patch HTML file on disk
  if (req.method === 'POST' && req.url === '/edit') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const { file, slideIndex, html } = JSON.parse(Buffer.concat(chunks).toString());
    try {
      const filePath = join(DIR, file);
      let source = await readFile(filePath, 'utf-8');

      // Find the Nth <div class="slide-inner ..."> ... </div> block
      // We match opening tag through its closing </div> by counting nesting
      const openRe = /<div\s+class="slide-inner[^"]*"/g;
      let match, count = 0, startPos = -1;
      while ((match = openRe.exec(source)) !== null) {
        if (count === slideIndex) { startPos = match.index; break; }
        count++;
      }
      if (startPos === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Slide not found', slideIndex }));
        return;
      }

      // Find the opening tag end (the >)
      const tagEnd = source.indexOf('>', startPos);
      const openTag = source.slice(startPos, tagEnd + 1);

      // Walk forward counting nested divs to find the matching </div>
      let depth = 1, pos = tagEnd + 1;
      while (depth > 0 && pos < source.length) {
        const nextOpen = source.indexOf('<div', pos);
        const nextClose = source.indexOf('</div>', pos);
        if (nextClose === -1) break;
        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++;
          pos = nextOpen + 4;
        } else {
          depth--;
          if (depth === 0) {
            // Replace content between openTag end and this </div>
            const before = source.slice(0, tagEnd + 1);
            const after = source.slice(nextClose);
            source = before + '\n' + html + '\n' + after;
            await writeFile(filePath, source, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, slideIndex }));
            console.log(`  ✏️  Slide ${slideIndex + 1} saved in ${file}`);
            return;
          }
          pos = nextClose + 6;
        }
      }
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Could not find closing tag' }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
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
});

function tryListen(server, port, maxRetries = 10) {
  server.listen(port, () => {
    console.log('');
    console.log('  ▶ Loading templates and skills...');
    console.log(`  ✔ Ready at http://localhost:${port}`);
    console.log('');
    console.log(`    http://localhost:${port}/examples/credit-card.html`);
    console.log(`    http://localhost:${port}/examples/cryptoswitch.html`);
    console.log('');
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && maxRetries > 0) {
      console.log(`  ▶ Port ${port} in use, trying ${port + 1}...`);
      tryListen(server, port + 1, maxRetries - 1);
    } else {
      console.error(`  ✘ Failed to start: ${err.message}`);
      process.exit(1);
    }
  });
}

tryListen(server, PORT);
