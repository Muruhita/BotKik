import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminPanel() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        // Проверяем, что пользователь - админ (твой ID)
        if (!data.user || data.user.id !== '1018113109346504744') {
          router.push('/');
          return;
        }
        setIsAdmin(true);
      });
  }, []);

  const handleUnban = async () => {
    if (!userId.trim()) {
      setStatus('⚠️ Введите Discord ID пользователя');
      return;
    }

    const res = await fetch('/api/admin/unban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    setStatus(data.message || data.error || 'Ошибка');
  };

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0a1a', color: 'white' }}>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#0a0a1a', minHeight: '100vh', color: 'white' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '15px' }}>
        <h1 style={{ marginBottom: '20px' }}>🛠️ Админ Панель</h1>
        <p style={{ color: '#8b8ba7', marginBottom: '20px' }}>Введите Discord ID пользователя для снятия блокировки (антиспам/банворд)</p>
        <input 
          type="text" 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Discord ID (например, 1018113109346504744)"
          style={{ 
            padding: '12px', marginBottom: '15px', width: '100%', boxSizing: 'border-box',
            background: '#111', color: 'white', border: '1px solid #444', borderRadius: '8px'
          }}
        />
        <button 
          onClick={handleUnban}
          style={{ 
            padding: '12px 20px', background: '#4CAF50', color: 'white', 
            border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '16px'
          }}
        >
          🔓 Снять блокировку
        </button>
        {status && <p style={{ marginTop: '20px', color: status.includes('✅') ? '#4CAF50' : '#FF4444' }}>{status}</p>}
      </div>
    </div>
  );
}
