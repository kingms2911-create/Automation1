import { db } from './db';
import { AGENTS, NICHES, findAgent } from './agents';
import { chat, parseJson } from './llm';
import { wpPost } from './wordpress';

const LANG = () => process.env.ARTICLE_LANGUAGE || 'English';
const now = () => new Date().toISOString();
const stripFence = (t) => t.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/, '').trim();

async function getSettings(d) {
  const { data } = await d.from('settings').select('*');
  const s = { auto_publish: 'false', daily_limit: '3', lead_queries: '' };
  for (const r of data || []) s[r.key] = r.value;
  return s;
}
const say = (d, agent, kind, content, task_id = null) => d.from('board').insert({ agent: agent.name, role: agent.role, kind, content, task_id });
const addTask = (d, type, niche, payload) => d.from('tasks').insert({ type, niche, payload });
const finish = (d, t, result) => d.from('tasks').update({ status: 'done', result, updated_at: now() }).eq('id', t.id);

async function placesSearch(query) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': process.env.GOOGLE_PLACES_KEY || '', 'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri' },
    body: JSON.stringify({ textQuery: query }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `Places error ${res.status}`);
  return data.places || [];
}

async function runTask(d, t, settings) {
  const p = t.payload || {};
  if (t.type === 'topic') {
    const agent = findAgent('topic_finder', t.niche);
    const { data: recent } = await d.from('tasks').select('payload').eq('type', 'seo').order('id', { ascending: false }).limit(20);
    const used = (recent || []).map((r) => r.payload?.topic?.title).filter(Boolean).join(' | ');
    const out = await chat(
      `You are a topic research bot for the "${t.niche}" niche. Language: ${LANG()}. Return ONLY JSON: {"topics":[{"title":"","keyword":"","why":""}]} with exactly 1 fresh, specific, searchable article idea that Indian readers would search for.`,
      `Already covered (avoid): ${used || 'none'}`, { max: 500 });
    const topic = parseJson(out).topics?.[0];
    if (!topic?.title) throw new Error('No topic returned');
    await finish(d, t, { topic });
    await say(d, agent, 'output', `Topic: "${topic.title}" (keyword: ${topic.keyword}). Passing to SEO.`, t.id);
    await addTask(d, 'seo', t.niche, { topic });
  } else if (t.type === 'seo') {
    const agent = findAgent('seo_researcher', t.niche);
    const out = await chat(
      `You are an SEO strategist. Language: ${LANG()}. Return ONLY JSON: {"title":"","slug":"","primary_keyword":"","secondary_keywords":[],"meta_description":"","outline":["H2 headings, 5-7"]}. Title under 60 chars, meta description under 155 chars.`,
      `Topic: ${p.topic.title}\nKeyword: ${p.topic.keyword}`, { max: 900 });
    const seo = parseJson(out);
    await finish(d, t, { seo });
    await say(d, agent, 'output', `Plan ready: "${seo.title}" with ${seo.outline?.length || 0} sections. Writer, your turn.`, t.id);
    await addTask(d, 'write', t.niche, { seo });
  } else if (t.type === 'write') {
    const agent = findAgent('writer', t.niche);
    const html = stripFence(await chat(
      `You are a senior content writer. Language: ${LANG()}. Write a helpful, original, human-sounding article of 900-1200 words. Return ONLY the article body as clean HTML (h2, h3, p, ul, li). No h1, no markdown, no code fences. Do not invent statistics or quotes.`,
      `Title: ${p.seo.title}\nPrimary keyword: ${p.seo.primary_keyword}\nSecondary: ${(p.seo.secondary_keywords || []).join(', ')}\nOutline: ${(p.seo.outline || []).join(' | ')}`, { max: 3500 }));
    await finish(d, t, { words: html.split(/\s+/).length });
    await say(d, agent, 'output', `Draft done (~${html.split(/\s+/).length} words). Editor, please review.`, t.id);
    await addTask(d, 'edit', t.niche, { seo: p.seo, html });
  } else if (t.type === 'edit') {
    const agent = findAgent('editor', t.niche);
    const out = await chat(
      `You are a strict editor. The FIRST line of your reply must be exactly "APPROVED" or "REJECTED: <reason>". Reject only if the article is off-topic, unsafe or very thin. If APPROVED, after the first line output the final improved HTML (fix errors, remove unverifiable claims, keep the keyword natural). Language: ${LANG()}.`,
      `Keyword: ${p.seo.primary_keyword}\n\n${p.html}`, { max: 3800 });
    const nl = out.indexOf('\n');
    const verdict = (nl < 0 ? out : out.slice(0, nl)).trim();
    if (!verdict.toUpperCase().startsWith('APPROVED')) {
      await d.from('tasks').update({ status: 'rejected', result: { verdict }, updated_at: now() }).eq('id', t.id);
      await say(d, agent, 'error', `Rejected "${p.seo.title}". ${verdict}`, t.id);
      return;
    }
    const html = stripFence(out.slice(nl + 1));
    await finish(d, t, { verdict });
    await say(d, agent, 'output', 'Approved with edits. Publisher, go ahead.', t.id);
    await addTask(d, 'publish', t.niche, { seo: p.seo, html });
  } else if (t.type === 'publish') {
    const agent = findAgent('publisher', t.niche);
    const r = await wpPost({ title: p.seo.title, html: p.html, slug: p.seo.slug, excerpt: p.seo.meta_description, status: settings.auto_publish === 'true' ? 'publish' : 'draft' });
    await finish(d, t, { title: p.seo.title, ...r });
    await say(d, agent, 'output', `${r.status === 'publish' ? 'Published' : 'Saved as draft'}: "${p.seo.title}" ${r.link || ''}`, t.id);
  } else if (t.type === 'leads') {
    const agent = AGENTS.find((a) => a.role === 'lead_finder');
    const places = await placesSearch(p.query);
    const rows = places.map((x) => ({ name: x.displayName?.text || 'Unknown', address: x.formattedAddress || '', phone: x.nationalPhoneNumber || null, website: x.websiteUri || null, query: p.query }));
    if (rows.length) await d.from('leads').upsert(rows, { onConflict: 'name,address', ignoreDuplicates: true });
    await finish(d, t, { found: rows.length });
    await say(d, agent, 'output', `Search "${p.query}": ${rows.length} businesses found and saved.`, t.id);
  } else throw new Error(`Unknown task type ${t.type}`);
}

// The "meeting": manager reads the board, unsticks work, hands out new assignments.
async function meeting(d, settings) {
  const manager = AGENTS[0];
  const stale = new Date(Date.now() - 5 * 60000).toISOString();
  await d.from('tasks').update({ status: 'pending' }).eq('status', 'running').lt('updated_at', stale);
  const dayStart = new Date(); dayStart.setUTCHours(0, 0, 0, 0);
  const { count: doneToday } = await d.from('tasks').select('id', { count: 'exact', head: true }).eq('type', 'publish').eq('status', 'done').gte('updated_at', dayStart.toISOString());
  const { count: inflight } = await d.from('tasks').select('id', { count: 'exact', head: true }).in('status', ['pending', 'running']).in('type', ['topic', 'seo', 'write', 'edit', 'publish']);
  const limit = parseInt(settings.daily_limit, 10) || 3;
  const need = Math.max(0, Math.min(3, limit - (doneToday || 0) - (inflight || 0)));
  for (let i = 0; i < need; i++) await addTask(d, 'topic', NICHES[Math.floor(Math.random() * NICHES.length)], {});
  const since = new Date(Date.now() - 24 * 3600000).toISOString();
  const queries = settings.lead_queries.split('\n').map((x) => x.trim()).filter(Boolean);
  let newLeadJobs = 0;
  if (queries.length) {
    const { data: recent } = await d.from('tasks').select('payload').eq('type', 'leads').gte('created_at', since);
    const seen = new Set((recent || []).map((r) => r.payload?.query));
    for (const q of queries) if (!seen.has(q)) { await addTask(d, 'leads', null, { query: q }); newLeadJobs++; }
  }
  await say(d, manager, 'meeting', `Stand-up: ${doneToday || 0}/${limit} articles done today, ${inflight || 0} in progress. Assigned ${need} new topic(s) and ${newLeadJobs} lead search(es). Mode: ${settings.auto_publish === 'true' ? 'auto-publish' : 'save as draft'}.`);
}

export async function tick(budgetMs = 50000) {
  const d = db();
  const start = Date.now();
  const settings = await getSettings(d);
  await meeting(d, settings);
  let ran = 0;
  while (Date.now() - start < budgetMs) {
    const { data } = await d.from('tasks').select('*').eq('status', 'pending').order('id').limit(1);
    const t = data?.[0];
    if (!t) break;
    await d.from('tasks').update({ status: 'running', updated_at: now() }).eq('id', t.id);
    try { await runTask(d, t, settings); }
    catch (e) {
      const attempts = (t.attempts || 0) + 1;
      await d.from('tasks').update({ status: attempts >= 3 ? 'failed' : 'pending', attempts, error: String(e.message).slice(0, 500), updated_at: now() }).eq('id', t.id);
      await say(d, AGENTS[0], 'error', `Task #${t.id} (${t.type}) failed: ${String(e.message).slice(0, 200)} [attempt ${attempts}/3]`, t.id);
    }
    ran++;
  }
  return { ran };
}
