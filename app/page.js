'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [logs, setLogs] = useState("Loading agent status...");
  const [loading, setLoading] = useState(false);

  const runTask = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/run', { method: 'POST' });
      const data = await res.json();
      setLogs(JSON.stringify(data, null, 2));
    } catch (err) {
      setLogs("Error: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    runTask();
  }, []);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>🤖 OmniRoute Agent Dashboard</h1>
      <p style={{ color: '#94a3b8', marginBottom: '20px' }}>System status is live and operational.</p>
      
      <button 
        onClick={runTask} 
        style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        {loading ? "Running Task..." : "Run Agent Tick 🚀"}
      </button>

      <div style={{ marginTop: '20px', background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#38bdf8' }}>Execution Output:</h3>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#cbd5e1', fontSize: '14px' }}>{logs}</pre>
      </div>
    </div>
  );
}
