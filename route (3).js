import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { AGENTS } from '@/lib/agents';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  if (!isAdmin(req)) return Response.json({ error: 'Wrong admin key' }, { status: 401 });
  const d = db();
  const [s, b, a, l, p] = await Promise.all([
    d.from('settings').select('*'),
    d.from('board').select('*').order('id', { ascending: false }).limit(60),
    d.from('tasks').select('id,type,status,niche,error').order('id', { ascending: false }).limit(200),
    d.from('leads').select('*').order('id', { ascending: false }).limit(100),
    d.from('tasks').select('id,result,updated_at').eq('type', 'publish').eq('status', 'done').order('id', { ascending: false }).limit(20),
  ]);
  const counts = {};
  for (const t of a.data || []) counts[t.status] = (counts[t.status] || 0) + 1;
  return Response.json({ settings: Object.fromEntries((s.data || []).map((r) => [r.key, r.value])), board: (b.data || []).reverse(), counts, leads: l.data || [], articles: p.data || [], agentCount: AGENTS.length });
}
