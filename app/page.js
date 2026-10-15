'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  
  useEffect(() => {
    // Auto-bypass login and redirect straight to dashboard or main view
    localStorage.setItem('auth', 'true');
  }, []);

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Agent Room Unlocked 🚀</h2>
      <p>Redirecting to dashboard...</p>
      <button 
        onClick={() => window.location.reload()} 
        style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Open Dashboard Now
      </button>
    </div>
  );
}
