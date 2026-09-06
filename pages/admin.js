import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

const ADMIN_IDS = ['1018113109346504744', '555380718566506506', '260076815970729985'];

const FORM_NAMES = {
  promotion: '📈 Запрос на повышение',
  transfer: '🔄 Перевод в отдел',
  report: '📋 Отчёт о повышении',
  highrank: '🌟 Отчёт (Хай Ранги)',
  resignation: '🚪 Увольнение',
  reinstatement: '🔁 Восстановление',
  transferToFib: '🏛️ Перевод в FIB',
  weaponRequest: '🔫 Спец Вооружение',
  leave: '🌴 Отпуск',
  withdrawal: '🚫 Снятие ЧС',
  hiring: '📝 Трудоустройство'
};

export default function AdminPanel() {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [formsActive, setFormsActive] = useState(true);
  const [formStatuses, setFormStatuses] = useState({});
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');

  const loadData = async () => {
    const res = await fetch('/api/admin/list');
    const data = await res.json();
    setBannedUsers(data.bannedUsers || []);
    setFormsActive(data.formsActive);
    setFormStatuses(data.formStatuses || {});
  };

  useEffect(() => {
    loadData();
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

  const toggleFormType = async (type, currentStatus) => {
    const res = await fetch('/api/admin/toggle-form-type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, status: !currentStatus })
    });
    const data = await res.json();
    setFormStatuses(prev => ({ ...prev, [type]: data.status }));
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

        {/* Остальные секции */}
        <div className="section">
          <h2>Глобальное управление заявками</h2>
          <button onClick={toggleForms} className={formsActive ? 'stop-btn' : 'start-btn'}>
            {formsActive ? '🚫 Остановить ВСЕ заявки' : '✅ Возобновить ВСЕ заявки'}
          </button>
          <p className="status-text">
            Текущий статус: {formsActive ? '🟢 Все заявки открыты' : '🔴 Все заявки остановлены'}
          </p>
        </div>

        <div className="section">
          <h2>⚙️ Управление отдельными формами</h2>
          <div className="forms-list">
            {Object.entries(FORM_NAMES).map(([type, name]) => (
              <div key={type} className="form-item">
                <span className="form-name">{name}</span>
                <button
                  className={formStatuses[type] === false ? 'form-off' : 'form-on'}
                  onClick={() => toggleFormType(type, formStatuses[type] !== false)}
                >
                  {formStatuses[type] === false ? '🔴 Выключена' : '🟢 Включена'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h2>Разблокировать пользователя</h2>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Discord ID" />
          <button onClick={handleUnban}>Снять блокировку</button>
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

        .forms-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .form-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.05);
          padding: 10px 15px;
          border-radius: 8px;
        }
        .form-name {
          color: #ccc;
          font-size: 15px;
        }
        .form-on, .form-off {
          padding: 8px 15px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          color: #fff;
          transition: all 0.2s;
        }
        .form-on {
          background: #4CAF50;
        }
        .form-on:hover {
          background: #45a049;
        }
        .form-off {
          background: #f44336;
        }
        .form-off:hover {
          background: #da190b;
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