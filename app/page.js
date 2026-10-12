'use client';
import { useEffect, useState, useCallback } from 'react';

const COLORS = { manager: '#12263a', topic_finder: '#0f766e', seo_researcher: '#4f46e5', writer: '#b45309', editor: '#be185d', publisher: '#15803d', lead_finder: '#0369a1' };
const initials = (n = '') => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

async function api(path, key, body) {
  const res = await fetch(path, { method: body ? 'POST' : 'GET', headers: { 'x-admin-key': key, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

export default function Home() {
  const [key, setKey] = useState('');
  const [input, setInput] = useState('');
  const [st, setSt] = useState(null);
  const [tab, setTab] = useState('board');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(null);

  const load = useCallback(async (k) => {
    try { const d = await api('/api/state', k); setSt(d); setErr(''); setForm((f) => f || d.settings); }
    catch (e) { setErr(e.message); setSt(null); }
  }, []);

  useEffect(() => { const k = localStorage.getItem('adminKey'); if (k) { setKey(k); load(k); } }, [load]);
  useEffect(() => { if (!key) return; const t = setInterval(() => load(key), 10000); return () => clearInterval(t); }, [key, load]);

  const login = () => { localStorage.setItem('adminKey', input); setKey(input); load(input); };
  const run = async () => { setBusy(true); setErr(''); try { await api('/api/run', key, {}); } catch (e) { setErr(e.message); } setBusy(false); load(key); };
  const save = async () => { try { await api('/api/settings', key, form); setErr(''); load(key); } catch (e) { setErr(e.message); } };

  if (!st) return (
    <div className="wrap">
      <h1>Agent Room</h1>
      <p className="sub">Enter your admin key to open the dashboard.</p>
      <input type="password" placeholder="Admin key" value={input} onChange={(e) => setInput(e.target.value)} />
      {err && <p className="err">{err}</p>}
      <p><button className="btn" onClick={login}>Open dashboard</button></p>
    </div>
  );

  const c = st.counts || {};
  return (
    <div className="wrap">
      <div className="row">
        <div><h1>Agent Room</h1><p className="sub" style={{ margin: 0 }}>{st.agentCount} agents on the team</p></div>
        <button className="btn" onClick={run} disabled={busy}>{busy ? 'Working…' : 'Run now'}</button>
      </div>
      {err && <p className="err">{err}</p>}
      <div className="stats">
        <div className="stat"><b>{c.pending || 0}</b><span>Waiting</span></div>
        <div className="stat"><b>{c.done || 0}</b><span>Done</span></div>
        <div className="stat"><b>{(c.failed || 0) + (c.rejected || 0)}</b><span>Failed</span></div>
      </div>
      <div className="tabs">
        {[['board', 'Meeting room'], ['articles', 'Articles'], ['leads', 'Leads'], ['settings', 'Settings']].map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'board' && (st.board.length ? st.board.map((m) => (
        <div className="msg" key={m.id}>
          <div className="av" style={{ background: COLORS[m.role] || '#555' }}>{initials(m.agent)}</div>
          <div className={`bub ${m.kind}`}><div className="who">{m.agent} · {new Date(m.created_at).toLocaleString()}</div><p>{m.content}</p></div>
        </div>
      )) : <p className="empty">No messages yet. Tap “Run now” to start the first meeting.</p>)}

      {tab === 'articles' && (st.articles.length ? st.articles.map((a) => (
        <div className="card" key={a.id}><b>{a.result?.title}</b><br /><small>{a.result?.status === 'publish' ? 'Published' : 'Draft'} · {new Date(a.updated_at).toLocaleDateString()}</small>{a.result?.link && <> · <a href={a.result.link} target="_blank" rel="noreferrer">Open</a></>}</div>
      )) : <p className="empty">No articles yet.</p>)}

      {tab === 'leads' && (st.leads.length ? st.leads.map((l) => (
        <div className="card" key={l.id}><b>{l.name}</b><br /><small>{l.address}</small><br />{l.phone && <a href={`tel:${l.phone}`}>{l.phone}</a>}{l.website && <> · <a href={l.website} target="_blank" rel="noreferrer">Website</a></>}</div>
      )) : <p className="empty">No leads yet. Add a search in Settings.</p>)}

      {tab === 'settings' && form && (
        <div>
          <label>Publishing mode</label>
          <button className="btn ghost" onClick={() => setForm({ ...form, auto_publish: form.auto_publish === 'true' ? 'false' : 'true' })}>
            {form.auto_publish === 'true' ? 'Auto-publish is ON' : 'Saving as draft (review first)'}
          </button>
          <label>Articles per day</label>
          <input type="number" min="1" max="20" value={form.daily_limit} onChange={(e) => setForm({ ...form, daily_limit: e.target.value })} />
          <label>Lead searches (one per line)</label>
          <textarea rows={4} placeholder={'gyms in Jaipur\ncafes in Pune'} value={form.lead_queries} onChange={(e) => setForm({ ...form, lead_queries: e.target.value })} />
          <p><button className="btn" onClick={save}>Save settings</button></p>
        </div>
      )}
    </div>
  );
}
