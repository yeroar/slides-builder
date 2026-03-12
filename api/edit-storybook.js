import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'POST') {
    const { key, selector, text } = req.body;
    const raw = await redis.get('template-overrides');
    const overrides = raw ? JSON.parse(raw) : {};
    if (!overrides[key]) overrides[key] = {};
    overrides[key][selector] = text;
    await redis.set('template-overrides', JSON.stringify(overrides));
    return res.json({ ok: true });
  }

  const data = await redis.get('template-overrides');
  return res.json(data ? JSON.parse(data) : {});
}
