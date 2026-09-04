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
      {/* Анимированный фон для всех страниц */}
      <div className="animated-bg">
        <div className="gradient-layer"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
        <div className="particles">
          {[...Array(30)].map((_, i) => (
            <span key={i} className={`particle p${i + 1}`}></span>
          ))}
        </div>
        <div className="grid-overlay"></div>
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
        }

        /* ===== Анимированный фон ===== */
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
          background: #0a0a0a;
        }

        .gradient-layer {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 20%, #1a1a3e, #0a0a0a 50%, #0a0a0a);
          animation: gradientShift 20s ease infinite;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
          animation: floatOrb 15s ease-in-out infinite;
        }
        .orb-1 {
          width: 400px;
          height: 400px;
          background: #5865F2;
          top: -10%;
          left: -10%;
        }
        .orb-2 {
          width: 300px;
          height: 300px;
          background: #FF69B4;
          bottom: -10%;
          right: -10%;
          animation-delay: -5s;
        }
        .orb-3 {
          width: 250px;
          height: 250px;
          background: #00FFAA;
          top: 40%;
          left: 40%;
          opacity: 0.25;
          animation-delay: -10s;
        }
        .orb-4 {
          width: 350px;
          height: 350px;
          background: #FFA500;
          bottom: 20%;
          left: 10%;
          opacity: 0.3;
          animation-delay: -7s;
        }

        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(50px, -60px) scale(1.1); }
          50% { transform: translate(-40px, 40px) scale(0.95); }
          75% { transform: translate(30px, 50px) scale(1.05); }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Частицы */
        .particles {
          position: absolute;
          inset: 0;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          animation: particleFloat linear infinite;
        }
        .p1 { top: 10%; left: 10%; animation-duration: 10s; }
        .p2 { top: 20%; left: 80%; animation-duration: 12s; animation-delay: 1s; }
        .p3 { top: 60%; left: 30%; animation-duration: 11s; animation-delay: 2s; }
        .p4 { top: 80%; left: 70%; animation-duration: 13s; animation-delay: 0.5s; }
        .p5 { top: 40%; left: 50%; animation-duration: 9s; animation-delay: 1.5s; }
        .p6 { top: 15%; left: 40%; animation-duration: 14s; animation-delay: 0.2s; }
        .p7 { top: 70%; left: 15%; animation-duration: 11.5s; animation-delay: 2.5s; }
        .p8 { top: 30%; left: 90%; animation-duration: 12.5s; animation-delay: 3s; }
        .p9 { top: 50%; left: 5%; animation-duration: 10.5s; animation-delay: 1.2s; }
        .p10 { top: 90%; left: 45%; animation-duration: 13.5s; animation-delay: 0.8s; }
        .p11 { top: 5%; left: 25%; animation-duration: 9.5s; animation-delay: 2.2s; }
        .p12 { top: 75%; left: 85%; animation-duration: 11.8s; animation-delay: 1.7s; }
        .p13 { top: 35%; left: 65%; animation-duration: 12.2s; animation-delay: 0.3s; }
        .p14 { top: 55%; left: 95%; animation-duration: 10.8s; animation-delay: 2.8s; }
        .p15 { top: 25%; left: 15%; animation-duration: 14.5s; animation-delay: 1.9s; }
        .p16 { top: 65%; left: 55%; animation-duration: 11.2s; animation-delay: 0.6s; }
        .p17 { top: 85%; left: 20%; animation-duration: 12.8s; animation-delay: 2.4s; }
        .p18 { top: 45%; left: 75%; animation-duration: 10.2s; animation-delay: 1.4s; }
        .p19 { top: 95%; left: 90%; animation-duration: 13.2s; animation-delay: 0.9s; }
        .p20 { top: 12%; left: 60%; animation-duration: 11.6s; animation-delay: 3.2s; }
        .p21 { top: 8%; left: 85%; animation-duration: 12s; animation-delay: 0.4s; }
        .p22 { top: 22%; left: 5%; animation-duration: 10s; animation-delay: 2.6s; }
        .p23 { top: 48%; left: 15%; animation-duration: 11s; animation-delay: 1.1s; }
        .p24 { top: 68%; left: 95%; animation-duration: 12.5s; animation-delay: 0.7s; }
        .p25 { top: 82%; left: 35%; animation-duration: 13s; animation-delay: 2.1s; }
        .p26 { top: 92%; left: 75%; animation-duration: 10s; animation-delay: 1.8s; }
        .p27 { top: 18%; left: 45%; animation-duration: 9s; animation-delay: 2.9s; }
        .p28 { top: 38%; left: 85%; animation-duration: 11.5s; animation-delay: 0.2s; }
        .p29 { top: 58%; left: 25%; animation-duration: 10.5s; animation-delay: 1.3s; }
        .p30 { top: 72%; left: 55%; animation-duration: 12s; animation-delay: 2.7s; }

        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0.8; }
          25% { transform: translateY(-40px) translateX(20px); opacity: 1; }
          50% { transform: translateY(-80px) translateX(-20px); opacity: 0.4; }
          75% { transform: translateY(-40px) translateX(15px); opacity: 0.9; }
          100% { transform: translateY(0) translateX(0); opacity: 0.8; }
        }

        /* Сетка */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(circle at center, black, transparent 80%);
          opacity: 0.5;
        }

        /* ===== Навбар ===== */
        .navbar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 30px;
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid #333;
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

        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
