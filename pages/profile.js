import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [banned, setBanned] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setError('Превышено время ожидания. Проверьте подключение к Redis.');
    }, 8000); // Если через 8 секунд нет ответа, показываем ошибку

    fetch('/api/profile')
      .then(async res => {
        const data = await res.json();
        clearTimeout(timer); // Сбрасываем таймер, если ответ пришел

        if (!res.ok) {
          setError(data.error || 'Ошибка загрузки');
          setLoading(false);
          return;
        }

        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }

        setUser(data.user);
        setNickname(data.nickname || '');
        setBanned(data.banned);
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timer);
        setError('Не удалось подключиться к серверу');
        setLoading(false);
      });

    return () => clearTimeout(timer);
  }, []);

  const saveNickname = async () => {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname })
    });
    const data = await res.json();
    setStatus(data.message || data.error);
  };

  return (
    <Layout>
      <div className="profile-container">
        <h1>👤 Профиль</h1>
        
        {/* Загрузка */}
        {loading && <p className="loading-text">Загрузка данных...</p>}

        {/* Ошибка */}
        {!loading && error && (
          <div className="error-box">
            <p>⚠️ {error}</p>
            <p style={{ fontSize: '14px', color: '#888' }}>Убедитесь, что на Vercel задана переменная REDIS_URL</p>
          </div>
        )}

        {/* Профиль */}
        {!loading && !error && user && (
          <div className="profile-card">
            <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="Avatar" className="avatar" />
            <h2>{user.username}</h2>
            <p>Discord ID: {user.id}</p>
            <div className={`status ${banned ? 'banned' : 'active'}`}>
              {banned ? '⛔ Заблокирован' : '✅ Активен'}
            </div>
            <div className="nickname-section">
              <label>Ваш игровой ник (Имя Фамилия + Статик):</label>
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Например: Sanya Suspect 270726" />
              <button onClick={saveNickname}>Сохранить</button>
              {status && <p className="status-msg">{status}</p>}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 500px;
          margin: 0 auto;
          text-align: center;
        }
        h1 {
          margin-bottom: 30px;
          color: white;
        }
        .loading-text {
          color: #888;
          font-size: 18px;
        }
        .error-box {
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid #ff4444;
          padding: 20px;
          border-radius: 12px;
          color: #ff8080;
          font-size: 16px;
        }
        .profile-card {
          background: #161616;
          border: 1px solid #333;
          padding: 40px;
          border-radius: 20px;
          animation: fadeIn 0.5s ease;
        }
        .avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin-bottom: 20px;
          border: 2px solid #555;
        }
        h2 {
          color: white;
          margin-bottom: 10px;
        }
        .profile-card > p {
          color: #888;
          margin-bottom: 10px;
        }
        .status {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          margin: 15px 0;
        }
        .status.banned {
          background: #ff4444;
          color: white;
        }
        .status.active {
          background: #4CAF50;
          color: white;
        }
        .nickname-section {
          margin-top: 30px;
          text-align: left;
        }
        .nickname-section label {
          display: block;
          margin-bottom: 10px;
          color: #aaa;
        }
        input {
          width: 100%;
          padding: 12px;
          background: #222;
          border: 1px solid #444;
          color: white;
          border-radius: 8px;
          margin-bottom: 15px;
          box-sizing: border-box;
        }
        button {
          width: 100%;
          padding: 12px;
          background: #fff;
          color: #000;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        button:hover {
          background: #ccc;
        }
        .status-msg {
          margin-top: 10px;
          color: #4CAF50;
          font-size: 14px;
          text-align: center;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </Layout>
  );
}
