import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const DISCORD_CLIENT_ID = '1543995099292106772';
const DISCORD_REDIRECT_URI = 'https://bot-kik.vercel.app/api/auth';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          router.push('/dashboard');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDiscordLogin = () => {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify'
    });
    window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0a0a', color: 'white' }}>Загрузка...</div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div style={{ background: '#161616', padding: '50px', borderRadius: '20px', textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔰</div>
        <h1 style={{ color: 'white' }}>Majestic FIB Forms</h1>
        <p style={{ color: '#888', marginBottom: '30px' }}>Система подачи заявок FIB</p>
        <button onClick={handleDiscordLogin} style={{ background: '#5865F2', color: 'white', padding: '15px', borderRadius: '10px', border: 'none', width: '100%', cursor: 'pointer' }}>
          Войти через Discord
        </button>
      </div>
    </div>
  );
}