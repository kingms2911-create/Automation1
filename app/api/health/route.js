import { db } from '@/lib/db';
import { tick } from '@/lib/engine';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function GET(req) {
  const u = new URL(req.url);
  if (!process.env.ADMIN_KEY || u.searchParams.get('key') !== process.env.ADMIN_KEY) return Response.json({ error: 'wrong key' }, { status: 401 });
  const out = {};
  if (u.searchParams.get('run')) {
    try { out.run = await tick(25000); } catch (e) { out.run_error = String(e.message || e); }
  }
  const d = db();
  const b = await d.from('board').select('id,agent,kind,content').order('id', { ascending: false }).limit(8);
  out.board = b.error ? b.error.message : b.data;
  const t = await d.from('tasks').select('id,type,status,attempts,error').order('id', { ascending: false }).limit(8);
  out.tasks = t.error ? t.error.message : t.data;
  return Response.json(out);
}
