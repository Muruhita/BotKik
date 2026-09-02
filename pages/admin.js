import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminPanel() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        // Проверяем, что это админ (твой ID)
        if (!data.user || data.user.id !== '1018113109346504744') {
          router.push('/'); // Если не админ, отправляем на главную
          return;
        }
        setIsAdmin(true);
        setLoading(false);
      })
      .catch(() => {
        router.push('/');
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0a1a', color: 'white' }}>
        <p>Проверка прав...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%)', padding: '30px' }}>
      <button onClick={() => router.push('/dashboard')} style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', fontSize: '14px' }}>
        ← Назад в дашборд
      </button>

      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h1 style={{ color: 'white', marginBottom: '20px', fontSize: '28px' }}>🛠️ Админ Панель</h1>
        <p style={{ color: '#8b8ba7', marginBottom: '30px', fontSize: '16px' }}>Введите Discord ID пользователя для снятия блокировки (антиспам или банворд).</p>
        
        <input 
          type="text" 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Discord ID (например, 1018113109346504744)"
          style={{ 
            padding: '14px', marginBottom: '20px', width: '100%', boxSizing: 'border-box',
            background: 'rgba(255, 255, 255, 0.05)', color: 'white', 
            border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', fontSize: '16px'
          }}
        />
        
        <button 
          onClick={handleUnban}
          style={{ 
            padding: '14px 20px', background: '#4CAF50', color: 'white', 
            border: 'none', borderRadius: '10px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: '600'
          }}
        >
          🔓 Снять блокировку
        </button>

        {status && (
          <p style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', textAlign: 'center', color: status.includes('✅') ? '#4CAF50' : '#FF4444', fontSize: '14px' }}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
