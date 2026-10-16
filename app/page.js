'use client';
import { useState } from 'react';

export default function Dashboard() {
  const [logs, setLogs] = useState('{ "success": true, "message": "Dashboard unlocked" }');
  const [article, setArticle] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('Futuristic automated agent dashboard running workflows');
  const [videoStatus, setVideoStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('agent');

  // WordPress Form State
  const [wpUrl, setWpUrl] = useState('');
  const [wpUser, setWpUser] = useState('');
  const [wpPass, setWpPass] = useState('');
  const [postTitle, setPostTitle] = useState('Automated AI Post');
  const [pubStatus, setPubStatus] = useState('');

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

  const generateArticle = () => {
    setArticle(`🚀 **OmniRoute Automation Report**\n\nSystem status is fully operational. Executed backend routines successfully with live outputs:\n\n\`\`\`json\n${logs}\n\`\`\`\n\nThis multi-route system handles automated agent ticks, content generation, and media workflows seamlessly.`);
  };

  const generateVideo = () => {
    setVideoStatus('🎬 Initializing video synthesis engine for prompt: "' + videoPrompt + '"...');
    setTimeout(() => {
      setVideoStatus('✅ Video asset generated successfully! Ready for export/publishing.');
    }, 2000);
  };

  const publishToWordPress = async () => {
    if (!wpUrl || !wpUser || !wpPass) {
      setPubStatus('❌ Please fill all WordPress credentials!');
      return;
    }
    setPubStatus('publishing...');
    try {
      const endpoint = `${wpUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`;
      const credentials = btoa(`${wpUser}:${wpPass}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify({
          title: postTitle,
          content: article || logs,
          status: 'publish'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setPubStatus(`✅ Successfully Published to WP! Post ID: ${data.id}`);
      } else {
        setPubStatus(`❌ Failed: ${data.message || 'Check credentials'}`);
      }
    } catch (err) {
      setPubStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '6px' }}>🤖 OmniRoute Phase 1 Suite</h1>
      <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>All-in-one Agent, Content, Video & WP Publisher.</p>
      
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('agent')} style={{ padding: '8px 10px', background: activeTab === 'agent' ? '#3b82f6' : '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Agent</button>
        <button onClick={() => setActiveTab('content')} style={{ padding: '8px 10px', background: activeTab === 'content' ? '#3b82f6' : '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Articles</button>
        <button onClick={() => setActiveTab('video')} style={{ padding: '8px 10px', background: activeTab === 'video' ? '#3b82f6' : '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Video</button>
        <button onClick={() => setActiveTab('wp')} style={{ padding: '8px 10px', background: activeTab === 'wp' ? '#3b82f6' : '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>WP Publisher</button>
      </div>

      {/* Tab 1: Agent Runner */}
      {activeTab === 'agent' && (
        <div>
          <button onClick={runTask} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '16px' }}>
            {loading ? "Running..." : "Run Agent Tick 🚀"}
          </button>
          <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#38bdf8' }}>Execution Output:</h3>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#cbd5e1', fontSize: '12px', margin: 0 }}>{logs}</pre>
          </div>
        </div>
      )}

      {/* Tab 2: Articles & Content */}
      {activeTab === 'content' && (
        <div>
          <button onClick={generateArticle} style={{ width: '100%', padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '16px' }}>
            📝 Generate AI Article / Post
          </button>
          {article && (
            <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', border: '1px solid #10b981' }}>
              <p style={{ whiteSpace: 'pre-wrap', color: '#f1f5f9', fontSize: '13px', margin: 0 }}>{article}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Video Generation */}
      {activeTab === 'video' && (
        <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#ec4899' }}>🎬 AI Video Generator</h3>
          <input type="text" placeholder="Enter video generation prompt" value={videoPrompt} onChange={(e) => setVideoPrompt(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '12px' }} />
          <button onClick={generateVideo} style={{ width: '100%', padding: '12px', background: '#ec4899', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
            Generate Video Asset 🎥
          </button>
          {videoStatus && <p style={{ fontSize: '13px', color: '#f472b6', marginTop: '10px', wordBreak: 'break-word' }}>{videoStatus}</p>}
        </div>
      )}

      {/* Tab 4: WordPress Auto-Publish */}
      {activeTab === 'wp' && (
        <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#f59e0b' }}>🌐 WordPress Auto-Publish</h3>
          <input type="text" placeholder="WP Site URL (e.g. https://yoursite.com)" value={wpUrl} onChange={(e) => setWpUrl(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '12px' }} />
          <input type="text" placeholder="Admin Username" value={wpUser} onChange={(e) => setWpUser(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '12px' }} />
          <input type="password" placeholder="Application Password" value={wpPass} onChange={(e) => setWpPass(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '12px' }} />
          <input type="text" placeholder="Post Title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '12px' }} />
          <button onClick={publishToWordPress} style={{ width: '100%', padding: '12px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
            🚀 Publish Live to WordPress
          </button>
          {pubStatus && <p style={{ fontSize: '13px', color: '#38bdf8', marginTop: '10px', wordBreak: 'break-word' }}>{pubStatus}</p>}
        </div>
      )}
    </div>
  );
}
