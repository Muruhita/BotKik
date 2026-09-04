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
      {/* ОГРОМНЫЙ АНИМИРОВАННЫЙ ФОН */}
      <div className="animated-bg">
        <div className="bg-gradient"></div>
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>
      </div>

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
          position: relative;
          overflow: hidden;
        }

        /* ОСНОВНОЙ ФОН */
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -1;
          overflow: hidden;
        }

        .bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0a0a1a, #1a1a3e, #2d1b69, #0a0a1a);
          background-size: 400% 400%;
          animation: gradientMove 15s ease infinite;
        }

        /* СВЕТЯЩИЕСЯ ШАРЫ */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          mix-blend-mode: screen; /* Заставляет светиться поверх черного */
        }

        .orb1 {
          width: 500px;
          height: 500px;
          background: #5865F2;
          top: -10%;
          left: -10%;
          animation: float1 12s ease-in-out infinite;
        }

        .orb2 {
          width: 400px;
          height: 400px;
          background: #FF69B4;
          bottom: -10%;
          right: -10%;
          animation: float2 15s ease-in-out infinite;
        }

        .orb3 {
          width: 350px;
          height: 350px;
          background: #00FFAA;
          top: 40%;
          left: 40%;
          opacity: 0.3;
          animation: float3 18s ease-in-out infinite;
        }

        /* АНИМАЦИИ ШАРОВ */
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(40px, -50px); }
          50% { transform: translate(-30px, 30px); }
          75% { transform: translate(20px, 50px); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-60px, -30px); }
          66% { transform: translate(50px, 40px); }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 50px) scale(1.2); }
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* ===== Навбар ===== */
        .navbar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 30px;
          background: rgba(0, 0, 0, 0.8);
          border-bottom: 1px solid #333;
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
        .nav-user button {
          background: #444;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
        }
        .main-content {
          position: relative;
          z-index: 10;
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
