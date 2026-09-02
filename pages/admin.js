import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) { router.push('/'); return; }
        setUser(data.user);
        
        const adminIds = (process.env.NEXT_PUBLIC_ADMIN_IDS || '').split(',');
        if (adminIds.includes(data.user.id)) {
          setIsAdmin(true);
          loadBlacklist();
        } else {
          router.push('/dashboard');
        }
        setLoading(false);
      });
  }, []);

  const loadBlacklist = async () => {
    const res = await fetch('/api/blacklist');
    const data = await res.json();
    setBlacklist(data.blacklist || []);
  };

  const unbanUser = async (userId) => {
    const res = await fetch('/api/unban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (res.ok) {
      alert('✅ Пользователь разблокирован!');
      loadBlacklist();
    } else {
      alert('❌ Ошибка разблокировки');
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <button onClick={() => router.push('/dashboard')} className="back-btn">
        ← Назад
      </button>

      <h1>🛡️ Админ-панель</h1>

      <div className="admin-section">
        <h2>📋 Заблокированные пользователи</h2>
        {blacklist.length === 0 ? (
          <p>Список пуст</p>
        ) : (
          <table className="blacklist-table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>ID</th>
                <th>Причина</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {blacklist.map((entry) => (
                <tr key={entry.userId}>
                  <td>{entry.username}</td>
                  <td>{entry.userId}</td>
                  <td>{entry.reason}</td>
                  <td>{new Date(entry.timestamp).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <button onClick={() => unbanUser(entry.userId)} className="unban-btn">
                      ✅ Разблокировать
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background: #0a1128;
          padding: 30px;
        }
        .back-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #e0e0ff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 20px;
        }
        h1 {
          color: #e0e0ff;
          margin-bottom: 30px;
        }
        .admin-section {
          background: rgba(26, 35, 126, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 30px;
          backdrop-filter: blur(10px);
        }
        h2 {
          color: #e0e0ff;
          margin-bottom: 20px;
        }
        .blacklist-table {
          width: 100%;
          border-collapse: collapse;
        }
        .blacklist-table th, .blacklist-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #b0b0d0;
        }
        .blacklist-table th {
          background: rgba(63, 81, 181, 0.3);
          font-weight: 600;
          color: #e0e0ff;
        }
        .unban-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
        }
        .unban-btn:hover {
          background: #45a049;
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #0a1128;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(63, 81, 181, 0.2);
          border-top-color: #3f51b5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-container p {
          color: #8888b0;
        }
      `}</style>
    </div>
  );
}