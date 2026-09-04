import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const DISCORD_CLIENT_ID = '1543995099292106772';
const DISCORD_REDIRECT_URI = 'https://bot-kik.vercel.app/api/auth';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (router.query.error) {
      setError('Ошибка авторизации. Попробуйте снова.');
    }
    
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          router.push('/dashboard');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router.query]);

  const handleDiscordLogin = () => {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify',
      prompt: 'none'
    });
    
    window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        minHeight: '100vh', background: '#0a0a1a', color: 'white', fontSize: '20px'
      }}>
        Няшка...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)',
        borderRadius: '24px', padding: '50px 40px', textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', maxWidth: '420px', width: '90%'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔰</div>
        <h1 style={{ color: 'white', fontSize: '32px', marginBottom: '10px', fontWeight: 700 }}>
          FIB Forms
        </h1>
        <p style={{ color: '#8b8ba7', marginBottom: '35px', fontSize: '16px' }}>
          Система подачи заявок FIB
        </p>
        
        {error && (
          <div style={{
            background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.3)',
            color: '#ff4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <button onClick={handleDiscordLogin} style={{
          display: 'inline-flex', alignItems: 'center', gap: '12px',
          background: '#5865F2', color: 'white', padding: '14px 32px',
          borderRadius: '12px', border: 'none', fontWeight: 600, fontSize: '16px',
          cursor: 'pointer', width: '100%', justifyContent: 'center'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.33-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.31.61.67 1.19 1.07 1.74.02.02.06.03.07.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" fill="white"/>
          </svg>
          Авторизация через Discord
        </button>
      </div>
    </div>
  );
}
