export async function wpPost({ title, html, slug, excerpt, status }) {
  const base = (process.env.WP_URL || '').replace(/\/$/, '');
  if (!base || !process.env.WP_USER || !process.env.WP_APP_PASSWORD) throw new Error('WordPress env vars are missing');
  const auth = Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64');
  const res = await fetch(`${base}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content: html, slug, excerpt, status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `WordPress error ${res.status}`);
  return { id: data.id, link: data.link, status: data.status };
}
