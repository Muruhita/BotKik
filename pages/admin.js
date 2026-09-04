import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [formsActive, setFormsActive] = useState(true);
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');

  const loadData = async () => {
    const res = await fetch('/api/admin/list');
    const data = await res.json();
    setBannedUsers(data.bannedUsers || []);
    setFormsActive(data.formsActive);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUnban = async () => {
    if (!userId.trim()) return;
    const res = await fetch('/api/admin/unban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    setStatus(data.message || data.error);
    loadData();
  };

  const toggleForms = async () => {
    const res = await fetch('/api/admin/toggle-forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: !formsActive })
    });
    const data = await res.json();
    setFormsActive(data.formsActive);
  };

  return (
    <Layout>
      <div className="admin-container">
        <h1>🛠️ Админ Панель</h1>
        
        <div className="section">
          <h2>Управление заявками</h2>
          <button onClick={toggleForms} className={formsActive ? 'stop-btn' : 'start-btn'}>
            {formsActive ? '🚫 Остановить подачу заявок' : '✅ Возобновить подачу заявок'}
          </button>
          <p className="status-text">
            Текущий статус: {formsActive ? '🟢 Прием заявок открыт' : '🔴 Прием заявок остановлен'}
          </p>
        </div>

        <div className="section">
          <h2>Разблокировать пользователя</h2>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Discord ID" />
          <button onClick={handleUnban}>🔓 Снять блокировку</button>
          {status && <p className="status-msg">{status}</p>}
        </div>

        <div className="section">
          <h2>Список заблокированных</h2>
          <div className="banned-list">
            {bannedUsers.length === 0 ? (
              <p>Нет заблокированных пользователей.</p>
            ) : (
              bannedUsers.map(user => (
                <div key={user.userId} className="banned-item">
                  <span>ID: {user.userId}</span>
                  <span>Причина: {user.reason}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .section {
          background: #161616;
          border: 1px solid #333;
          padding: 25px;
          border-radius: 15px;
          margin-bottom: 25px;
        }
        .section h2 {
          margin-bottom: 15px;
          font-size: 20px;
        }
        input {
          width: 100%;
          padding: 12px;
          background: #222;
          border: 1px solid #444;
          color: white;
          border-radius: 8px;
          margin-bottom: 10px;
          box-sizing: border-box;
        }
        button {
          padding: 12px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
        }
        .stop-btn {
          background: #ff4444;
          color: white;
        }
        .start-btn {
          background: #4CAF50;
          color: white;
        }
        .status-text {
          margin-top: 10px;
          font-size: 14px;
        }
        .status-msg {
          margin-top: 10px;
          color: #4CAF50;
        }
        .banned-list {
          max-height: 300px;
          overflow-y: auto;
        }
        .banned-item {
          background: #222;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }
      `}</style>
    </Layout>
  );
}