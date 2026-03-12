import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

const redis = Redis.fromEnv();

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (req.method === 'POST') {
    const { file, title, copy, start } = await req.json();
    await redis.set(`deck-settings:${file}`, JSON.stringify({ title, copy, start }));
    return new Response('{"ok":true}', { headers });
  }

  const url = new URL(req.url);
  const file = url.searchParams.get('file');
  if (!file) return new Response('{}', { headers });
  const data = await redis.get(`deck-settings:${file}`);
  return new Response(data ? (typeof data === 'string' ? data : JSON.stringify(data)) : '{}', { headers });
}
