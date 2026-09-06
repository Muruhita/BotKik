import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Members() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.users) {
          setUsers(data.users);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка участников...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="page-title">👥 Участники</h1>
      
      {users.length === 0 ? (
        <p className="empty-text">Пока нет ни одного участника с заполненным профилем.</p>
      ) : (
        <div className="members-grid">
          {users.map(user => {
            // Определяем стиль карточки в зависимости от кастомизации
            let cardStyle = { background: '#161616', border: '1px solid #333' };
            
            if (user.profileCustom) {
              if (user.profileCustom.type === 'preset') {
                const presets = {
                  blue: { background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', border: '1px solid #3b82f6' },
                  purple: { background: 'linear-gradient(135deg, #4c1d95, #a855f7)', border: '1px solid #a855f7' },
                  green: { background: 'linear-gradient(135deg, #065f46, #10b981)', border: '1px solid #10b981' }
                };
                cardStyle = presets[user.profileCustom.presetId] || cardStyle;
              } else if (user.profileCustom.type === 'image') {
                cardStyle = {
                  backgroundImage: `url(${user.profileCustom.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid #fff'
                };
              }
            }

            return (
              <div key={user.userId} className="member-card" style={cardStyle}>
                <div className="member-avatar-container">
                  {user.avatar ? (
                    <img src={`https://cdn.discordapp.com/avatars/${user.userId}/${user.avatar}.png`} alt="Avatar" className="member-avatar" />
                  ) : (
                    <div className="member-avatar-placeholder">?</div>
                  )}
                </div>
                <h3>{user.nickname}</h3>
                <p className="member-username">{user.username}</p>
                <div className="member-info">
                  <span className="member-department">🏢 {user.department}</span>
                  <span className={`member-status ${user.banned ? 'banned' : 'active'}`}>
                    {user.banned ? '⛔ Бан' : '✅ Активен'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .page-title {
          font-size: 32px;
          margin-bottom: 30px;
          text-align: center;
          color: #fff;
        }
        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .member-card {
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          color: #fff;
          position: relative;
          overflow: hidden;
          min-height: 220px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .member-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .member-avatar-container {
          margin-bottom: 15px;
        }
        .member-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.5);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .member-avatar-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: bold;
          border: 3px solid rgba(255,255,255,0.5);
        }
        h3 {
          font-size: 18px;
          margin-bottom: 5px;
          text-shadow: 0 2px 5px rgba(0,0,0,0.5);
        }
        .member-username {
          font-size: 13px;
          color: rgba(255,255,255,0.8);
          margin-bottom: 10px;
        }
        .member-info {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        .member-department {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 12px;
        }
        .member-status {
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 12px;
        }
        .member-status.active {
          background: rgba(76,175,80,0.3);
          border: 1px solid #4CAF50;
        }
        .member-status.banned {
          background: rgba(255,68,68,0.3);
          border: 1px solid #ff4444;
        }
        .empty-text {
          text-align: center;
          color: #888;
          font-size: 18px;
          margin-top: 50px;
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
}
