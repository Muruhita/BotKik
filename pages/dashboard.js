import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Список ID администраторов (добавь сюда второй ID)
const ADMIN_IDS = [
  '1018113109346504744', // Твой ID
  '555380718566506506'   // ID второго админа (замени на реальный)
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/');
          return;
        }
        setUser(data.user);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  // Проверяем, является ли пользователь админом из списка
  const isAdmin = user && ADMIN_IDS.includes(user.id);

  return (
    <div className="dashboard">
      <div className="header">
        <h1>🏛️ Majestic FIB Forms</h1>
        <div className="user-info">
          <img 
            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
            alt="Avatar" 
            className="avatar"
          />
          <span>{user.username}</span>
          
          {/* Кнопка админ-панели (видна только админам из списка) */}
          {isAdmin && (
            <button onClick={() => router.push('/admin')} className="admin-btn">
              🛠️ Админ-панель
            </button>
          )}

          <button onClick={handleLogout} className="logout-btn">Выйти</button>
        </div>
      </div>

      <div className="cards-grid">
        <div className="card" onClick={() => router.push('/forms/promotion')}>
          <div className="card-icon">📈</div>
          <h3>Запрос на повышение</h3>
          <p>Подать запрос на повышение</p>
        </div>

        <div className="card" onClick={() => router.push('/forms/transfer')}>
          <div className="card-icon">🔄</div>
          <h3>Перевод в отдел</h3>
          <p>Подать заявку на перевод в другой отдел</p>
        </div>

        <div className="card" onClick={() => router.push('/forms/report')}>
          <div className="card-icon">📋</div>
          <h3>Отчёт о повышении</h3>
          <p>Подать отчёт о повышении для своего отдела</p>
        </div>

        <div className="card" onClick={() => router.push('/forms/high-rank-report')}>
          <div className="card-icon">🌟</div>
          <h3>Отчёт на повышение (Хай Ранги)</h3>
          <p>Повышение для старшего состава</p>
        </div>

        <div className="card" onClick={() => router.push('/forms/resignation')}>
          <div className="card-icon">🚪</div>
          <h3>Заявление на увольнение</h3>
          <p>Подать заявление на увольнение из FIB</p>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%);
          padding: 30px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto 40px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .header h1 {
          color: white;
          font-size: 28px;
          margin: 0;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #8b8ba7;
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
        .logout-btn {
          background: rgba(255, 255, 255, 0.08);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .admin-btn {
          background: rgba(88, 101, 242, 0.3);
          color: white;
          border: 1px solid #5865F2;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        .admin-btn:hover {
          background: rgba(88, 101, 242, 0.6);
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 30px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }
        .card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.06);
          border-color: #5865F2;
          box-shadow: 0 10px 30px rgba(88, 101, 242, 0.15);
        }
        .card-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .card h3 {
          color: white;
          font-size: 18px;
          margin-bottom: 10px;
        }
        .card p {
          color: #8b8ba7;
          font-size: 14px;
          margin: 0;
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #0a0a1a;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(88, 101, 242, 0.2);
          border-top-color: #5865F2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-container p {
          color: #8b8ba7;
        }
      `}</style>
    </div>
  );
}
