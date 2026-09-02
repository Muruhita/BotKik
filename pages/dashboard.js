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
          background: #0a1128;
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
          background: linear-gradient(45deg, #0a1128, #1a237e, #0a1128, #1a237e);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
          z-index: 0;
          opacity: 0.5;
        }
        
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
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
          background: rgba(26, 35, 126, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .header h1 {
          color: #e0e0ff;
          font-size: 28px;
          margin: 0;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #b0b0d0;
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
        .logout-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #e0e0ff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.2);
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
          background: rgba(26, 35, 126, 0.6);
          padding: 10px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .tab-btn {
          background: transparent;
          color: #b0b0d0;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.3s;
        }
        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .tab-btn.active {
          background: #3f51b5;
          color: white;
          box-shadow: 0 4px 15px rgba(63, 81, 181, 0.3);
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
          background: rgba(26, 35, 126, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 30px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          backdrop-filter: blur(10px);
        }
        .card:hover {
          transform: translateY(-5px);
          background: rgba(63, 81, 181, 0.9);
          border-color: #3f51b5;
          box-shadow: 0 10px 30px rgba(63, 81, 181, 0.3);
        }
        .card-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .card h3 {
          color: #e0e0ff;
          font-size: 18px;
          margin-bottom: 10px;
        }
        .card p {
          color: #8888b0;
          font-size: 14px;
          margin: 0;
        }

        .profile-tab-content, .help-content, .admin-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          margin: 0 auto;
        }
        .profile-card {
          background: rgba(26, 35, 126, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 30px;
          backdrop-filter: blur(10px);
        }
        .profile-content h3 {
          color: #e0e0ff;
          margin-bottom: 20px;
        }
        .profile-info p {
          color: #b0b0d0;
          margin-bottom: 10px;
        }
        .profile-info strong {
          color: #e0e0ff;
        }
        .profile-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          vertical-align: middle;
        }
        .profile-edit {
          margin-top: 20px;
        }
        .profile-edit label {
          display: block;
          color: #b0b0d0;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .profile-edit input {
          width: 100%;
          padding: 12px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #e0e0ff;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .save-profile-btn {
          background: #3f51b5;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          width: 100%;
        }
        .save-profile-btn:hover {
          background: #283593;
        }

        .ban-info {
          margin-top: 20px;
          background: rgba(244, 67, 54, 0.2);
          border: 1px solid rgba(244, 67, 54, 0.5);
          border-radius: 16px;
          padding: 20px;
        }
        .ban-info h3 {
          color: #ff8a80;
          margin-bottom: 15px;
        }
        .ban-info p {
          color: #ef9a9a;
          margin-bottom: 8px;
        }

        .help-content {
          background: rgba(26, 35, 126, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 30px;
          backdrop-filter: blur(10px);
        }
        .help-content h3 {
          color: #e0e0ff;
          margin-bottom: 20px;
        }
        .help-text {
          color: #b0b0d0;
          line-height: 1.8;
          font-size: 15px;
        }

        .admin-btn {
          display: block;
          background: #dc3545;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin: 0 auto;
          transition: all 0.3s;
        }
        .admin-btn:hover {
          background: #c82333;
          transform: translateY(-2px);
        }

        .footer {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 40px auto 0;
          padding: 20px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .footer a {
          color: #8888b0;
          text-decoration: none;
          margin: 0 10px;
          transition: color 0.2s;
        }
        .footer a:hover {
          color: #3f51b5;
        }
        .footer span {
          color: #6666a0;
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
