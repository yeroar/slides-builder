export const config = { runtime: 'edge' };

// On Vercel, we can't scan the filesystem. Return a static list.
// This is updated at build time or manually when new examples are added.
const EXAMPLES = [
  { file: 'credit-card.html', path: '/examples/credit-card.html', title: 'Credit Card — All Hands Overview' },
  { file: 'fold-ceo-letter-2026.html', path: '/fold-ceo-letter-2026.html', title: 'Fold — Letter to Customers, January 2026' },
  { file: 'fold-credit-card.html', path: '/fold-credit-card.html', title: 'Fold Credit Card — All Hands Overview' },
  { file: 'fold-onboarding-v2.html', path: '/fold-onboarding-v2.html', title: 'Onboarding V2 — Future Vision' },
];

export default async function handler() {
  return new Response(JSON.stringify(EXAMPLES), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
