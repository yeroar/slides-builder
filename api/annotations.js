import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'POST') {
    await redis.set('annotations', JSON.stringify(req.body));
    return res.json({ ok: true });
  }

  const data = await redis.get('annotations');
  return res.json(data ? JSON.parse(data) : {});
}
