import { tick } from '@/lib/engine';
import { isAdmin } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(req) {
  try { return Response.json(await tick()); } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
