import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (req.method === 'POST') {
    const { key, selector, text } = await req.json();
    const raw = await redis.get('template-overrides');
    const overrides = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
    if (!overrides[key]) overrides[key] = {};
    overrides[key][selector] = text;
    await redis.set('template-overrides', JSON.stringify(overrides));
    return new Response('{"ok":true}', { headers });
  }

  const data = await redis.get('template-overrides');
  return new Response(data ? (typeof data === 'string' ? data : JSON.stringify(data)) : '{}', { headers });
}
