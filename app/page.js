'use client';
import { useState } from 'react';

export default function Dashboard() {
  const [logs, setLogs] = useState('{ "success": true, "message": "Dashboard unlocked" }');
  
  // Article State
  const [articleTopic, setArticleTopic] = useState('Future of AI Automation');
  const [articleContent, setArticleContent] = useState('');
  const [articleLoading, setArticleLoading] = useState(false);

  // Media State
  const [mediaPrompt, setMediaPrompt] = useState('Futuristic automated agent dashboard, cinematic lighting, 4k');
  const [mediaStatus, setMediaStatus] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [audioText, setAudioText] = useState('Welcome to OmniRoute automated video production system.');
  
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

  // Real AI Article Generation using Pollinations Text API (Free & Fast)
  const generateRealArticle = async () => {
    if (!articleTopic) return;
    setArticleLoading(true);
    setArticleContent('🤖 AI is writing your article...');
    try {
      const prompt = `Write a detailed, engaging, and professional blog post about: "${articleTopic}". Include headings, bullet points, and an introduction/conclusion.`;
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
      const text = await res.text();
      setArticleContent(text);
    } catch (err) {
      setArticleContent('❌ Error generating article: ' + err.message);
    }
    setArticleLoading(false);
  };

  const generateVisualAndAudio = () => {
    setMediaStatus('🎨 Generating visuals via Pollinations.ai & preparing Edge-TTS audio script...');
    const encodedPrompt = encodeURIComponent(mediaPrompt);
    const generatedImg = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    setImageUrl(generatedImg);
    setMediaStatus('✅ Visual asset generated via Pollinations.ai & Audio script ready!');
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
          content: `${articleContent || logs}\n\n${imageUrl ? `<img src="${imageUrl}" alt="AI Visual" />` : ''}`,
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
      <h1 style={{ fontSize: '22px', marginBottom: '6px' }}>🤖 OmniRoute Media Suite</h1>
      <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>Agent, AI Articles, Media & WP Publisher.</p>
      
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('agent')} style={{ padding: '8px 10px', background: activeTab === 'agent' ? '#3b82f6' : '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Agent</button>
        <button onClick={() => setActiveTab('content')} style={{ padding: '8px 10px', background: activeTab === 'content' ? '#3b82f6' : '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Articles</button>
        <button onClick={() => setActiveTab('media')} style={{ padding: '8px 10px', background: activeTab === 'media' ? '#3b82f6' : '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Media</button>
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

      {/* Tab 2: Real AI Articles Generator */}
      {activeTab === 'content' && (
        <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#10b981' }}>📝 AI Article Writer</h3>
          
          <label style={{ fontSize: '12px', color: '#94a3b8' }}>Enter Article Topic / Title:</label>
          <input 
            type="text" 
            value={articleTopic} 
            onChange={(e) => setArticleTopic(e.target.value)} 
            style={{ width: '100%', padding: '10px', marginBottom: '10px', marginTop: '4px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '12px' }} 
          />

          <button 
            onClick={generateRealArticle} 
            style={{ width: '100%', padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '14px' }}
          >
            {articleLoading ? "Writing Article..." : "Generate AI Article ✨"}
          </button>

          {articleContent && (
            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid #10b981' }}>
              <p style={{ whiteSpace: 'pre-wrap', color: '#f1f5f9', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{articleContent}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Media Generator */}
      {activeTab === 'media' && (
        <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#ec4899' }}>🎨 Pollinations Visuals & Edge-TTS Audio</h3>
          
          <label style={{ fontSize: '12px', color: '#94a3b8' }}>Visual Prompt:</label>
          <input type="text" value={mediaPrompt} onChange={(e) => setMediaPrompt(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', marginTop: '4px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '12px' }} />

          <label style={{ fontSize: '12px', color: '#94a3b8' }}>Voiceover Script:</label>
          <textarea value={audioText} onChange={(e) => setAudioText(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', marginTop: '4px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '12px', height: '60px' }} />

          <button onClick={generateVisualAndAudio} style={{ width: '100%', padding: '12px', background: '#ec4899', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
            Generate Media Assets 🎬
          </button>

          {mediaStatus && <p style={{ fontSize: '13px', color: '#f472b6', marginTop: '8px', wordBreak: 'break-word' }}>{mediaStatus}</p>}

          {imageUrl && (
            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#38bdf8', marginBottom: '6px' }}>Generated Visual Preview:</p>
              <img src={imageUrl} alt="Pollinations AI" style={{ maxWidth: '100%', borderRadius: '6px', border: '1px solid #334155' }} />
            </div>
          )}
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
