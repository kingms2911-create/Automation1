export async function chat(system, user, { max = 3500, temperature = 0.7 } = {}) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature, max_tokens: max }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `LLM error ${res.status}`);
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('LLM returned an empty response');
  return text.trim();
}
export function parseJson(text) {
  const s = text.indexOf('{'), e = text.lastIndexOf('}');
  if (s < 0 || e < s) throw new Error('No JSON in model output');
  return JSON.parse(text.slice(s, e + 1));
}
