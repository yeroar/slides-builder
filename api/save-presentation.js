import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (req.method === 'POST') {
    const { name, html, title } = await req.json();
    if (!name || !html) {
      return new Response(JSON.stringify({ error: 'name and html required' }), { status: 400, headers });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await redis.set(`pres:${slug}`, html);

    // Update index
    const raw = await redis.get('pres-index');
    const index = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    const existing = index.findIndex(e => e.slug === slug);
    const entry = { slug, title: title || name, created: new Date().toISOString() };
    if (existing >= 0) index[existing] = entry;
    else index.push(entry);
    await redis.set('pres-index', JSON.stringify(index));

    return new Response(JSON.stringify({ ok: true, slug, url: `/p/${slug}` }), { headers });
  }

  if (req.method === 'DELETE') {
    const { slug } = await req.json();
    if (!slug) {
      return new Response(JSON.stringify({ error: 'slug required' }), { status: 400, headers });
    }
    await redis.del(`pres:${slug}`);
    const raw = await redis.get('pres-index');
    const index = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    const updated = index.filter(e => e.slug !== slug);
    await redis.set('pres-index', JSON.stringify(updated));
    return new Response(JSON.stringify({ ok: true, deleted: slug }), { headers });
  }

  // GET — list all saved presentations
  const raw = await redis.get('pres-index');
  const index = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
  return new Response(JSON.stringify(index), { headers });
}
