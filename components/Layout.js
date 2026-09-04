import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const ADMIN_IDS = ['1018113109346504744', '555380718566506506', '260076815970729985'];

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/');
          return;
        }
        setUser(data.user);
        setIsAdmin(ADMIN_IDS.includes(data.user.id));
      });
  }, []);

  const tabs = [
    { name: 'Формы', path: '/dashboard', icon: '📝' },
    { name: 'Профиль', path: '/profile', icon: '👤' },
    { name: 'Справка', path: '/help', icon: '📖' },
    ...(isAdmin ? [{ name: 'Админ', path: '/admin', icon: '🛠️' }] : []),
  ];

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-logo">
          <img src="/logo.png" alt="FIB Logo" className="nav-logo-img" />
          <span>FIB Forms</span>
        </div>
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

      <main key={router.pathname} className="main-content">
        {children}
      </main>

      {/* Футер с маленькими кнопками */}
      <footer className="footer">
        <a href="/terms" className="footer-link">Условия Пользования</a>
        <span className="footer-sep">•</span>
        <a href="/privacy" className="footer-link">Политика конфиденциальности</a>
        <span className="footer-sep">•</span>
        <span className="footer-author">Автор: @murkilanki</span>
      </footer>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background: #0a0a0a;
          color: white;
          display: flex;
          flex-direction: column;
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
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: bold;
          color: #fff;
        }
        .nav-logo-img {
          width: 28px;
          height: 28px;
          object-fit: contain;
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
          flex: 1;
          width: 100%;
          animation: fadeInUp 0.5s ease both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Футер */
        .footer {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          padding: 15px 20px;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 13px;
          color: #777;
          flex-wrap: wrap;
        }
        .footer-link {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 4px 10px;
          color: #aaa;
          text-decoration: none;
          transition: all 0.2s;
          font-size: 12px;
        }
        .footer-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.3);
        }
        .footer-sep {
          color: #555;
        }
        .footer-author {
          color: #888;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
