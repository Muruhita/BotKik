import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forms');
  const [profileNickname, setProfileNickname] = useState('');
  const [blacklistInfo, setBlacklistInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) { router.push('/'); return; }
        setUser(data.user);
        
        // Проверяем админа
        const adminIds = (process.env.NEXT_PUBLIC_ADMIN_IDS || '').split(',');
        setIsAdmin(adminIds.includes(data.user.id));
        
        // Загружаем профиль
        fetch('/api/profile')
          .then(res => res.json())
          .then(profileData => {
            if (profileData.profile?.nickname) {
              setProfileNickname(profileData.profile.nickname);
            }
          })
          .catch(() => {});
        
        // Проверяем блокировку
        fetch('/api/blacklist')
          .then(res => res.json())
          .then(blacklistData => {
            const entry = blacklistData.blacklist?.find(e => e.userId === data.user.id);
            if (entry) setBlacklistInfo(entry);
          })
          .catch(() => {});
        
        setLoading(false);
      });
  }, []);

  const saveProfile = async () => {
    if (!profileNickname.trim()) {
      alert('Ник не может быть пустым!');
      return;
    }
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: profileNickname.trim() })
    });
    if (res.ok) alert('✅ Ник сохранён!');
    else alert('❌ Ошибка сохранения');
  };

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

  return (
    <div className="dashboard">
      <div className="animated-bg"></div>
      
      <div className="header">
        <h1>🏛️ Majestic FIB Forms</h1>
        <div className="user-info">
          <img 
            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
            alt="Avatar" 
            className="avatar"
          />
          <span>{user.username}</span>
          <button onClick={handleLogout} className="logout-btn">Выйти</button>
        </div>
      </div>

      {/* Переключатели вкладок */}
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'forms' ? 'active' : ''}`}
          onClick={() => setActiveTab('forms')}
        >
          📋 Формы
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Профиль
        </button>
        <button 
          className={`tab-btn ${activeTab === 'help' ? 'active' : ''}`}
          onClick={() => setActiveTab('help')}
        >
          ❓ Справка
        </button>
        {isAdmin && (
          <button 
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            🛡️ Админ
          </button>
        )}
      </div>

      {/* Содержимое вкладок */}
      {activeTab === 'forms' && (
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

          <div className="card" onClick={() => router.push('/forms/reinstatement')}>
            <div className="card-icon">🔄</div>
            <h3>Восстановление</h3>
            <p>Подать заявку на восстановление</p>
          </div>

          <div className="card" onClick={() => router.push('/forms/transfer-to-fib')}>
            <div className="card-icon">🏛️</div>
            <h3>Перевод в FIB</h3>
            <p>Подать заявку на перевод в FIB</p>
          </div>

          <div className="card" onClick={() => router.push('/forms/hiring')}>
            <div className="card-icon">📝</div>
            <h3>Трудоустройство</h3>
            <p>Подать заявку на трудоустройство</p>
          </div>

          <div className="card" onClick={() => router.push('/forms/weapon-request')}>
            <div className="card-icon">🔫</div>
            <h3>Спец вооружение</h3>
            <p>Запросить специальное вооружение</p>
          </div>

          <div className="card" onClick={() => router.push('/forms/leave')}>
            <div className="card-icon">🏖️</div>
            <h3>Отпуск</h3>
            <p>Подать заявление на отпуск</p>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="profile-tab-content">
          <div className="profile-card">
            <div className="profile-content">
              <h3>👤 Мой профиль</h3>
              <div className="profile-info">
                <p><strong>Discord ID:</strong> {user.id}</p>
                <p><strong>Никнейм:</strong> {user.username}</p>
                <p><strong>Аватар:</strong> <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} className="profile-avatar" /></p>
              </div>
            </div>
            <div className="profile-edit">
              <label>Ник + статик (будет автоподставляться)</label>
              <input 
                type="text" 
                value={profileNickname}
                onChange={(e) => setProfileNickname(e.target.value)}
                placeholder="Например: Sanya Suspect 270726"
              />
              <button onClick={saveProfile} className="save-profile-btn">Сохранить</button>
            </div>
          </div>

          {blacklistInfo && (
            <div className="ban-info">
              <h3>⛔ Активная блокировка</h3>
              <p><strong>Причина:</strong> {blacklistInfo.reason}</p>
              <p><strong>Дата:</strong> {new Date(blacklistInfo.timestamp).toLocaleDateString('ru-RU')}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'help' && (
        <div className="help-content">
          <h3>❓ Справка</h3>
          <div className="help-text">
            <p>
              заявку сначала оставляем -⁠✅┃отчёт-на-повышение-trainee<br />
              после одобрения отдела @FNA | Federal National Academy вашего отчета , вы пишите сюда - ⁠├📈・запрос-на-повышение
            </p>
          </div>
        </div>
      )}

      {activeTab === 'admin' && isAdmin && (
        <div className="admin-content">
          <button onClick={() => router.push('/admin')} className="admin-btn">
            🛡️ Перейти в админ-панель
          </button>
        </div>
      )}

      {/* Футер */}
      <footer className="footer">
        <a href="/terms">Условия пользования</a>
        <span>•</span>
        <a href="/privacy">Пользовательское соглашение</a>
      </footer>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: #020b1a;
          padding: 30px;
          position: relative;
          overflow: hidden;
        }
        
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #020b1a, #0a1f4d, #020b1a, #071a3d, #020b1a);
          background-size: 500% 500%;
          animation: gradientBG 20s ease infinite;
          z-index: 0;
          opacity: 0.8;
        }
        
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 0%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 100%; }
          100% { background-position: 0% 50%; }
        }

        .header {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto 30px;
          padding: 20px;
          background: rgba(2, 11, 26, 0.7);
          backdrop-filter: blur(15px);
          border-radius: 16px;
          border: 1px solid rgba(80, 120, 255, 0.15);
          animation: fadeInDown 0.6s ease;
        }
        .header h1 {
          color: #e0e8ff;
          font-size: 28px;
          margin: 0;
          text-shadow: 0 2px 10px rgba(80, 120, 255, 0.3);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #8fa3c7;
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #3b82f6;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
        }
        .logout-btn {
          background: rgba(59, 130, 246, 0.15);
          color: #8fa3c7;
          border: 1px solid rgba(59, 130, 246, 0.3);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
          color: #ff8080;
          transform: translateY(-2px);
        }

        .tabs {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 30px;
          max-width: 1200px;
          margin: 0 auto 30px;
          background: rgba(2, 11, 26, 0.8);
          padding: 10px;
          border-radius: 12px;
          border: 1px solid rgba(80, 120, 255, 0.15);
          animation: fadeInUp 0.6s ease 0.1s both;
        }
        .tab-btn {
          background: transparent;
          color: #6b7f9e;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }
        .tab-btn:hover {
          background: rgba(59, 130, 246, 0.1);
          color: #93b8ff;
        }
        .tab-btn.active {
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
          color: white;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
        }

        .cards-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .card {
          background: rgba(2, 11, 26, 0.8);
          border: 1px solid rgba(80, 120, 255, 0.15);
          border-radius: 16px;
          padding: 30px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
          backdrop-filter: blur(10px);
          animation: fadeInUp 0.5s ease both;
        }
        .card:nth-child(1) { animation-delay: 0.1s; }
        .card:nth-child(2) { animation-delay: 0.2s; }
        .card:nth-child(3) { animation-delay: 0.3s; }
        .card:nth-child(4) { animation-delay: 0.4s; }
        .card:nth-child(5) { animation-delay: 0.5s; }
        .card:nth-child(6) { animation-delay: 0.6s; }
        .card:nth-child(7) { animation-delay: 0.7s; }
        .card:nth-child(8) { animation-delay: 0.8s; }
        .card:nth-child(9) { animation-delay: 0.9s; }
        .card:nth-child(10) { animation-delay: 1s; }
        
        .card:hover {
          transform: translateY(-8px) scale(1.02);
          background: rgba(30, 58, 138, 0.9);
          border-color: #3b82f6;
          box-shadow: 0 15px 40px rgba(59, 130, 246, 0.3);
        }
        .card-icon {
          font-size: 48px;
          margin-bottom: 15px;
          transition: transform 0.3s ease;
        }
        .card:hover .card-icon {
          transform: scale(1.2) rotate(5deg);
        }
        .card h3 {
          color: #93b8ff;
          font-size: 18px;
          margin-bottom: 10px;
          transition: color 0.3s ease;
        }
        .card:hover h3 {
          color: #ffffff;
        }
        .card p {
          color: #4a5f7a;
          font-size: 14px;
          margin: 0;
          transition: color 0.3s ease;
        }
        .card:hover p {
          color: #6b8caf;
        }

        .profile-tab-content, .help-content, .admin-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          margin: 0 auto;
          animation: fadeInUp 0.5s ease;
        }
        .profile-card {
          background: rgba(2, 11, 26, 0.8);
          border: 1px solid rgba(80, 120, 255, 0.15);
          border-radius: 16px;
          padding: 30px;
          backdrop-filter: blur(10px);
        }
        .profile-content h3 {
          color: #93b8ff;
          margin-bottom: 20px;
        }
        .profile-info p {
          color: #6b7f9e;
          margin-bottom: 10px;
          font-size: 15px;
        }
        .profile-info strong {
          color: #a0b4d4;
        }
        .profile-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          vertical-align: middle;
          border: 2px solid #3b82f6;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
        }
        .profile-edit {
          margin-top: 20px;
        }
        .profile-edit label {
          display: block;
          color: #6b7f9e;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .profile-edit input {
          width: 100%;
          padding: 12px;
          background: rgba(2, 11, 26, 0.6);
          border: 1px solid rgba(80, 120, 255, 0.2);
          border-radius: 8px;
          color: #e0e8ff;
          font-size: 14px;
          margin-bottom: 10px;
          transition: border-color 0.3s ease;
        }
        .profile-edit input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
        }
        .save-profile-btn {
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          width: 100%;
          transition: all 0.3s ease;
        }
        .save-profile-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(59, 130, 246, 0.4);
        }

        .ban-info {
          margin-top: 20px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 16px;
          padding: 20px;
          animation: shake 0.5s ease;
        }
        .ban-info h3 {
          color: #ff8080;
          margin-bottom: 15px;
        }
        .ban-info p {
          color: #ffa0a0;
          margin-bottom: 8px;
        }

        .help-content {
          background: rgba(2, 11, 26, 0.8);
          border: 1px solid rgba(80, 120, 255, 0.15);
          border-radius: 16px;
          padding: 30px;
          backdrop-filter: blur(10px);
        }
        .help-content h3 {
          color: #93b8ff;
          margin-bottom: 20px;
        }
        .help-text {
          color: #8fa3c7;
          line-height: 1.8;
          font-size: 15px;
        }

        .admin-btn {
          display: block;
          background: linear-gradient(135deg, #dc3545, #ff4757);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin: 0 auto;
          transition: all 0.3s ease;
        }
        .admin-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(255, 71, 87, 0.4);
        }

        .footer {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 40px auto 0;
          padding: 20px;
          text-align: center;
          border-top: 1px solid rgba(80, 120, 255, 0.1);
          animation: fadeInUp 0.6s ease;
        }
        .footer a {
          color: #4a5f7a;
          text-decoration: none;
          margin: 0 10px;
          transition: color 0.3s ease;
        }
        .footer a:hover {
          color: #93b8ff;
        }
        .footer span {
          color: #3a4a65;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #020b1a;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(59, 130, 246, 0.2);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-container p {
          color: #4a5f7a;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
