import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
        setIsAdmin(data.user.id === '1018113109346504744');
        setLoading(false);
      })
      .catch(() => {
        router.push('/');
      });
  }, []);

  const tabs = [
    { name: 'Формы', path: '/dashboard', icon: '📝' },
    { name: 'Профиль', path: '/profile', icon: '👤' },
    { name: 'Справка', path: '/help', icon: '📖' },
    ...(isAdmin ? [{ name: 'Админ', path: '/admin', icon: '🛠️' }] : []),
  ];

  // Показываем загрузку, пока проверяем права
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Проверка авторизации...</p>
        <style jsx>{`
          .loading-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #0a0a0a;
            color: white;
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
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-logo">🏛️ FIB Forms</div>
        <div className="nav-tabs">
          {tabs.map(tab => (
            <button 
              key={tab.path} 
              className={`nav-tab ${router.pathname === tab.path ? 'active' : ''}`}
              onClick={() => router.push(tab.path)}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>
        <div className="nav-user">
          {user && <span>{user.username}</span>}
          <button onClick={async () => { await fetch('/api/logout', { method: 'POST' }); router.push('/'); }}>Выйти</button>
        </div>
      </nav>
      <main className="main-content">{children}</main>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background: #0a0a0a;
          color: white;
        }
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 30px;
          background: #1a1a1a;
          border-bottom: 1px solid #333;
          position: sticky;
          top: 0;
          z-index: 100;
          animation: slideDown 0.5s ease;
        }
        .nav-logo {
          font-size: 20px;
          font-weight: bold;
          color: #fff;
        }
        .nav-tabs {
          display: flex;
          gap: 10px;
        }
        .nav-tab {
          background: transparent;
          border: none;
          color: #aaa;
          padding: 8px 15px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }
        .nav-tab:hover {
          color: #fff;
          background: #333;
        }
        .nav-tab.active {
          color: #fff;
          background: #fff;
          color: #000;
          font-weight: bold;
        }
        .nav-user {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .nav-user span {
          color: #aaa;
          font-size: 14px;
        }
        .nav-user button {
          background: #444;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
        }
        .main-content {
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
