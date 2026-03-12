import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

export default async function handler(req) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('name');
  if (!slug) {
    return new Response('Missing name parameter', { status: 400 });
  }

  const html = await redis.get(`pres:${slug}`);
  if (!html) {
    return new Response('Presentation not found', { status: 404 });
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
