import { db } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const key = new URL(req.url).searchParams.get('key');
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return Response.json({ error: 'wrong key' }, { status: 401 });
  const out = {
    url_set: !!process.env.SUPABASE_URL,
    service_key_set: !!process.env.SUPABASE_SERVICE_KEY,
    openrouter_set: !!process.env.OPENROUTER_API_KEY,
  };
  const d = db();
  for (const t of ['tasks', 'board', 'leads', 'settings']) {
    const { error } = await d.from(t).select('*', { head: true, count: 'exact' });
    out[t] = error ? error.message : 'ok';
  }
  const w = await d.from('board').insert({ agent: 'Health check', role: 'manager', kind: 'meeting', content: 'Health check ok' });
  out.write = w.error ? w.error.message : 'ok';
  return Response.json(out);
}
