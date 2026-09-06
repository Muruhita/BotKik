import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

const ADMIN_IDS = ['1018113109346504744', '555380718566506506', '260076815970729985', '797111731864207360'];

export default function AdminPanel() {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [formsActive, setFormsActive] = useState(true);
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [stats, setStats] = useState(null); // статистика

  const loadData = async () => {
    const res = await fetch('/api/admin/list');
    const data = await res.json();
    setBannedUsers(data.bannedUsers || []);
    setFormsActive(data.formsActive);
  };

  const loadStats = async () => {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    if (data.total !== undefined) setStats(data);
  };

  useEffect(() => {
    loadData();
    loadStats();
    // Загружаем текущее объявление
    fetch('/api/announcement')
      .then(res => res.json())
      .then(data => {
        if (data.announcement) {
          setAnnouncement(data.announcement);
          setAnnouncementText(data.announcement);
        }
      })
      .catch(() => {});
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
    loadData();
  };

  const saveAnnouncement = async () => {
    const res = await fetch('/api/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: announcementText })
    });
    const data = await res.json();
    setAnnouncementMsg(data.message || data.error);
    setAnnouncement(announcementText.trim());
  };

  const clearAnnouncement = async () => {
    const res = await fetch('/api/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' })
    });
    const data = await res.json();
    setAnnouncementMsg(data.message || data.error);
    setAnnouncementText('');
    setAnnouncement('');
  };

  return (
    <Layout>
      <div className="admin-container">
        <h1>Админка</h1>

        {/* Секция объявления */}
        <div className="section">
          <h2>📢 Глобальное уведомление</h2>
          <textarea
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            rows="3"
            placeholder="Введите текст объявления (например, 'Завтра формы закрыты с 12:00 до 14:00')"
            className="announcement-textarea"
          />
          <div className="announcement-actions">
            <button onClick={saveAnnouncement} className="save-announcement-btn">💾 Сохранить</button>
            {announcement && (
              <button onClick={clearAnnouncement} className="clear-announcement-btn">🗑️ Удалить</button>
            )}
          </div>
          {announcementMsg && <p className="announcement-msg">{announcementMsg}</p>}
        </div>

        {/* Статистика */}
        <div className="section">
          <h2>📊 Статистика заявок</h2>
          {stats ? (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Всего заявок</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.today}</span>
                  <span className="stat-label">Сегодня</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.thisWeek}</span>
                  <span className="stat-label">За неделю</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.thisMonth}</span>
                  <span className="stat-label">За месяц</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.activeUsers}</span>
                  <span className="stat-label">Активных юзеров</span>
                </div>
              </div>
              {stats.types && Object.keys(stats.types).length > 0 && (
                <div className="types-stats">
                  <h3>По типам форм:</h3>
                  <ul>
                    {Object.entries(stats.types).map(([type, count]) => (
                      <li key={type}>{type}: <strong>{count}</strong></li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p>Загрузка статистики...</p>
          )}
        </div>

        {/* Глобальное управление заявками */}
        <div className="section">
          <h2>Управление заявками</h2>
          <button onClick={toggleForms} className={formsActive ? 'stop-btn' : 'start-btn'}>
            {formsActive ? '🚫 Остановить ВСЕ заявки' : '✅ Возобновить ВСЕ заявки'}
          </button>
          <p className="status-text">
            Текущий статус: {formsActive ? '🟢 Заявки открыты' : '🔴 Заявки остановлены'}
          </p>
        </div>

        {/* Разблокировать пользователя */}
        <div className="section">
          <h2>Разблокировать пользователя</h2>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Discord ID" />
          <button onClick={handleUnban}>Снять блокировку</button>
          {status && <p className="status-msg">{status}</p>}
        </div>

        {/* Список заблокированных */}
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
          max-width: 900px;
          margin: 0 auto;
        }
        .section {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 25px;
          border-radius: 15px;
          margin-bottom: 25px;
        }
        .section h2 {
          margin-bottom: 15px;
          font-size: 20px;
          color: #fff;
        }

        .announcement-textarea {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          color: white;
          padding: 12px;
          font-size: 16px;
          resize: vertical;
        }
        .announcement-actions {
          margin-top: 10px;
          display: flex;
          gap: 10px;
        }
        .save-announcement-btn {
          background: #5865F2;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        .clear-announcement-btn {
          background: #f44336;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        .announcement-msg {
          margin-top: 10px;
          color: #4CAF50;
        }

        /* Стили для статистики */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        .stat-card {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          padding: 15px;
          text-align: center;
        }
        .stat-value {
          display: block;
          font-size: 32px;
          font-weight: bold;
          color: #5865F2;
        }
        .stat-label {
          color: #aaa;
          font-size: 14px;
        }
        .types-stats {
          margin-top: 15px;
        }
        .types-stats h3 {
          color: #ccc;
          font-size: 16px;
          margin-bottom: 10px;
        }
        .types-stats ul {
          list-style: none;
          padding: 0;
        }
        .types-stats li {
          background: rgba(255,255,255,0.05);
          padding: 8px;
          border-radius: 8px;
          margin-bottom: 5px;
          color: #ccc;
        }
        .types-stats li strong {
          color: #fff;
        }

        input {
          width: 100%;
          padding: 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
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
          margin-right: 10px;
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
          color: #aaa;
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
          background: rgba(255,255,255,0.05);
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #ccc;
        }
      `}</style>
    </Layout>
  );
}
