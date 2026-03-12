import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'POST') {
    const { file, title, copy, start } = req.body;
    await redis.set(`deck-settings:${file}`, JSON.stringify({ title, copy, start }));
    return res.json({ ok: true });
  }

  const file = req.query.file;
  if (!file) return res.json({});
  const data = await redis.get(`deck-settings:${file}`);
  return res.json(data ? JSON.parse(data) : {});
}
