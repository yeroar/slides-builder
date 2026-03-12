import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

const redis = Redis.fromEnv();

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (req.method === 'POST') {
    const body = await req.json();
    await redis.set('annotations', JSON.stringify(body));
    return new Response('{"ok":true}', { headers });
  }

  const data = await redis.get('annotations');
  return new Response(data ? (typeof data === 'string' ? data : JSON.stringify(data)) : '{}', { headers });
}
