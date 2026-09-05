import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1543995099292106772';
const DISCORD_REDIRECT_URI = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || 'https://bot-kik.vercel.app/api/auth';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          router.push('/dashboard');
          return;
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDiscordLogin = () => {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify'
    });
    window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0a0a', color: 'white', fontSize: '18px' }}>
        Загрузка...
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Анимированный фон */}
      <div className="animated-bg">
        <div className="gradient-overlay"></div>
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>
        <div className="particles">
          {[...Array(30)].map((_, i) => (
            <span key={i} className={`particle p${i + 1}`}></span>
          ))}
        </div>
      </div>

      {/* Контент */}
      <div className={`auth-content ${visible ? 'show' : ''}`}>
        <div className="logo-container">
          <img src="/logo.png" alt="FIB Logo" className="logo" />
        </div>
        <h1 className="title">Majestic FIB Forms</h1>
        <p className="subtitle">Система подачи заявок FIB</p>
        <button className="discord-btn" onClick={handleDiscordLogin}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '10px' }}>
            <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.33-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.31.61.67 1.19 1.07 1.74.02.02.06.03.07.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" fill="white"/>
          </svg>
          Войти через Discord
        </button>
        <p className="author">Автор: @muruh1ta</p>
      </div>

      <style jsx>{`
        .auth-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
        }

        /* Анимированный фон */
        .animated-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a3e 50%, #0a0a0a 100%);
          background-size: 400% 400%;
          animation: gradientShift 12s ease infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: float 10s ease-in-out infinite;
        }

        .orb1 {
          width: 400px;
          height: 400px;
          background: #5865F2;
          top: -10%;
          left: -10%;
        }

        .orb2 {
          width: 300px;
          height: 300px;
          background: #FF69B4;
          bottom: -10%;
          right: -10%;
          animation-delay: -3s;
        }

        .orb3 {
          width: 200px;
          height: 200px;
          background: #00FFAA;
          top: 30%;
          left: 60%;
          animation-delay: -6s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 30px) scale(0.95); }
          75% { transform: translate(15px, 40px) scale(1.05); }
        }

        .particles {
          position: absolute;
          inset: 0;
        }

        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          animation: particleFloat linear infinite;
        }

        .p1 { top: 10%; left: 10%; animation-duration: 8s; }
        .p2 { top: 20%; left: 80%; animation-duration: 10s; animation-delay: 1s; }
        .p3 { top: 60%; left: 30%; animation-duration: 9s; animation-delay: 2s; }
        .p4 { top: 80%; left: 70%; animation-duration: 11s; animation-delay: 0.5s; }
        .p5 { top: 40%; left: 50%; animation-duration: 7s; animation-delay: 1.5s; }
        .p6 { top: 15%; left: 40%; animation-duration: 12s; animation-delay: 0.2s; }
        .p7 { top: 70%; left: 15%; animation-duration: 9.5s; animation-delay: 2.5s; }
        .p8 { top: 30%; left: 90%; animation-duration: 10.5s; animation-delay: 3s; }
        .p9 { top: 50%; left: 5%; animation-duration: 8.5s; animation-delay: 1.2s; }
        .p10 { top: 90%; left: 45%; animation-duration: 11.5s; animation-delay: 0.8s; }
        .p11 { top: 5%; left: 25%; animation-duration: 7.5s; animation-delay: 2.2s; }
        .p12 { top: 75%; left: 85%; animation-duration: 9.8s; animation-delay: 1.7s; }
        .p13 { top: 35%; left: 65%; animation-duration: 10.2s; animation-delay: 0.3s; }
        .p14 { top: 55%; left: 95%; animation-duration: 8.8s; animation-delay: 2.8s; }
        .p15 { top: 25%; left: 15%; animation-duration: 12.5s; animation-delay: 1.9s; }
        .p16 { top: 65%; left: 55%; animation-duration: 9.2s; animation-delay: 0.6s; }
        .p17 { top: 85%; left: 20%; animation-duration: 10.8s; animation-delay: 2.4s; }
        .p18 { top: 45%; left: 75%; animation-duration: 8.2s; animation-delay: 1.4s; }
        .p19 { top: 95%; left: 90%; animation-duration: 11.2s; animation-delay: 0.9s; }
        .p20 { top: 12%; left: 60%; animation-duration: 9.6s; animation-delay: 3.2s; }
        .p21 { top: 8%; left: 85%; animation-duration: 10s; animation-delay: 0.4s; }
        .p22 { top: 22%; left: 5%; animation-duration: 12s; animation-delay: 2.6s; }
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

        /* Контент */
        .auth-content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 40px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .auth-content.show {
          opacity: 1;
          transform: translateY(0);
        }

        .logo-container {
          margin-bottom: 20px;
        }

        .logo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          box-shadow: 0 0 30px rgba(88, 101, 242, 0.6);
        }

        .title {
          font-size: 36px;
          font-weight: 800;
          color: white;
          margin-bottom: 8px;
          text-shadow: 0 4px 30px rgba(88, 101, 242, 0.5);
          animation: titleGlow 2s ease-in-out infinite alternate;
        }

        @keyframes titleGlow {
          from { text-shadow: 0 4px 30px rgba(88, 101, 242, 0.5); }
          to { text-shadow: 0 4px 30px rgba(255, 105, 180, 0.7); }
        }

        .subtitle {
          font-size: 18px;
          color: #aaa;
          margin-bottom: 30px;
        }

        .discord-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #5865F2;
          color: white;
          padding: 15px 30px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(88, 101, 242, 0.4);
        }

        .discord-btn:hover {
          background: #4752C4;
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(88, 101, 242, 0.6);
        }

        .discord-btn:active {
          transform: translateY(-1px);
        }

        /* Автор */
        .author {
          margin-top: 20px;
          font-size: 14px;
          color: #888;
        }
      `}</style>
    </div>
  );
}
