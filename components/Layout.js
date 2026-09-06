import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ParticleBackground from './ParticleBackground';

const ADMIN_IDS = ['1018113109346504744', '555380718566506506', '260076815970729985'];

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') setIsLight(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isLight ? 'light' : 'dark';
    setIsLight(!isLight);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('light', !isLight);
  };

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
      <ParticleBackground />
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
          <button className="theme-toggle" onClick={toggleTheme}>
            {isLight ? '🌙' : '☀️'}
          </button>
          <button onClick={async () => { await fetch('/api/logout', { method: 'POST' }); router.push('/'); }}>Выйти</button>
        </div>
      </nav>

      <main key={router.pathname} className="main-content">
        {children}
      </main>

      <footer className="footer">
        <a href="/terms" className="footer-link">Условия</a>
        <span className="footer-sep">•</span>
        <a href="/privacy" className="footer-link">Справка</a>
        <span className="footer-sep">•</span>
        <span className="footer-author">Автор: @muruh1ta</span>
      </footer>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          position: relative;
        }

        .app-container > :global(.p5Canvas) {
          position: fixed !important;
          top: 0;
          left: 0;
          z-index: 0;
        }

        .navbar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 30px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: bold;
          color: var(--text);
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
          color: var(--text-secondary);
          padding: 8px 15px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }
        .nav-tab:hover {
          color: var(--text);
          background: var(--bg-tertiary);
        }
        .nav-tab.active {
          color: var(--button-text);
          background: var(--button-bg);
          font-weight: bold;
        }
        .nav-user {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .nav-user button {
          background: var(--bg-tertiary);
          color: var(--text);
          border: 1px solid var(--border);
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
        }
        .nav-user .theme-toggle {
          background: transparent;
          border: none;
          font-size: 20px;
          padding: 4px;
        }
        .main-content {
          position: relative;
          z-index: 10;
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeInUp 0.5s ease both;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .footer {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          padding: 15px 20px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
        }
        .footer-link {
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 4px 10px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s;
          font-size: 12px;
        }
        .footer-link:hover {
          background: var(--bg-tertiary);
          color: var(--text);
        }
        .footer-sep {
          color: var(--text-secondary);
        }
        .footer-author {
          color: var(--text-secondary);
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
