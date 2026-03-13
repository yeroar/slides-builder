export const config = { runtime: 'edge' };

// On Vercel, we can't scan the filesystem. Return a static list.
// This is updated at build time or manually when new examples are added.
const EXAMPLES = [];

export default async function handler() {
  return new Response(JSON.stringify(EXAMPLES), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
