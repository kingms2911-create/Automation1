export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(req) {
  try {
    return Response.json({ success: true, message: "Dashboard unlocked" });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
