export const config = { runtime: 'edge' };

import { SYSTEM_PROMPT } from '../system-prompt.mjs';

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { messages, context } = body;
    const systemContent = SYSTEM_PROMPT + (context ? `\n\nCurrent presentation context:\n${context}` : '');

    // Strip image blocks from older messages to reduce payload
    const trimmedMessages = messages.map((m, i) => {
      if (i < messages.length - 1 && Array.isArray(m.content)) {
        const textParts = m.content.filter(p => p.type === 'text');
        return { role: m.role, content: textParts.length === 1 ? textParts[0].text : textParts };
      }
      return { role: m.role, content: m.content };
    });

    // Stream from Claude API
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16384,
        stream: true,
        system: systemContent,
        messages: trimmedMessages,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return new Response(JSON.stringify({ error: `Claude API ${resp.status}`, detail: err.slice(0, 500) }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Pipe the SSE stream through to the client
    return new Response(resp.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
