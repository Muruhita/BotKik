import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1543995099292106772';
const DISCORD_REDIRECT_URI = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || 'https://bot-kik.vercel.app/api/auth';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

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
      {/* Параллакс-фон */}
      <div className="parallax-bg">
        {/* Слой 1: базовый градиент (медленно движется) */}
        <div className="layer1"></div>
        {/* Слой 2: крупные размытые круги */}
        <div className="layer2">
          <div className="circle circle1"></div>
          <div className="circle circle2"></div>
          <div className="circle circle3"></div>
        </div>
        {/* Слой 3: средние звёзды/частицы */}
        <div className="layer3">
          {[...Array(15)].map((_, i) => (
            <span key={i} className={`star star${i + 1}`}></span>
          ))}
        </div>
        {/* Слой 4: маленькие точки, двигаются быстрее */}
        <div className="layer4">
          {[...Array(20)].map((_, i) => (
            <span key={i} className={`dot dot${i + 1}`}></span>
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

        <button className="info-btn" onClick={() => setShowInfo(!showInfo)}>
          Что получает бот?
        </button>
        {showInfo && (
          <div className="info-box">
            <p>Бот Discord при авторизации получает только:</p>
            <ul>
              <li>ID</li>
              <li>@username (ваш коренной ник)</li>
              <li>Аватар</li>
              <li>Баннер</li>
            </ul>
            <p>Больше никакие данные не запрашиваются и не передаются.</p>
          </div>
        )}
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

        /* Параллакс-фон */
        .parallax-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        /* Слой 1: медленный градиент */
        .layer1 {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 20%, #1a1a3e, #0a0a0a 60%);
          animation: gradientShift 20s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(10px, -10px); }
          50% { transform: translate(-10px, 5px); }
          75% { transform: translate(5px, 10px); }
        }

        /* Слой 2: крупные размытые круги */
        .layer2 {
          position: absolute;
          inset: 0;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0.2;
          animation: slowMove 30s linear infinite;
        }

        .circle1 {
          width: 300px;
          height: 300px;
          background: #5865F2;
          top: 10%;
          left: 10%;
        }

        .circle2 {
          width: 200px;
          height: 200px;
          background: #FF69B4;
          bottom: 10%;
          right: 20%;
          animation-duration: 25s;
        }

        .circle3 {
          width: 150px;
          height: 150px;
          background: #00FFAA;
          top: 50%;
          left: 70%;
          animation-duration: 35s;
        }

        @keyframes slowMove {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(40px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(20px, 40px) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }

        /* Слой 3: средние звёзды */
        .layer3 {
          position: absolute;
          inset: 0;
        }

        .star {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.8);
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
          animation: starMove 15s linear infinite;
        }

        @keyframes starMove {
          0% { transform: translate(0, 0); opacity: 0.5; }
          50% { transform: translate(-30px, 20px); opacity: 1; }
          100% { transform: translate(0, 0); opacity: 0.5; }
        }

        .star1 { top: 10%; left: 10%; animation-duration: 12s; }
        .star2 { top: 20%; left: 80%; animation-duration: 15s; }
        .star3 { top: 70%; left: 30%; animation-duration: 18s; }
        .star4 { top: 50%; left: 90%; animation-duration: 14s; }
        .star5 { top: 30%; left: 50%; animation-duration: 16s; }
        .star6 { top: 80%; left: 60%; animation-duration: 20s; }
        .star7 { top: 15%; left: 40%; animation-duration: 13s; }
        .star8 { top: 60%; left: 15%; animation-duration: 17s; }
        .star9 { top: 40%; left: 75%; animation-duration: 19s; }
        .star10 { top: 90%; left: 20%; animation-duration: 11s; }
        .star11 { top: 5%; left: 65%; animation-duration: 14s; }
        .star12 { top: 45%; left: 5%; animation-duration: 16s; }
        .star13 { top: 25%; left: 25%; animation-duration: 18s; }
        .star14 { top: 65%; left: 85%; animation-duration: 12s; }
        .star15 { top: 75%; left: 45%; animation-duration: 15s; }

        /* Слой 4: маленькие быстрые точки */
        .layer4 {
          position: absolute;
          inset: 0;
        }

        .dot {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.6);
          animation: dotMove 5s linear infinite;
        }

        @keyframes dotMove {
          0% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(-15px, 10px); opacity: 1; }
          100% { transform: translate(0, 0); opacity: 0.3; }
        }

        .dot1 { top: 12%; left: 15%; animation-duration: 6s; }
        .dot2 { top: 25%; left: 85%; animation-duration: 7s; }
        .dot3 { top: 65%; left: 35%; animation-duration: 5s; }
        .dot4 { top: 55%; left: 95%; animation-duration: 8s; }
        .dot5 { top: 35%; left: 55%; animation-duration: 6.5s; }
        .dot6 { top: 85%; left: 65%; animation-duration: 7.5s; }
        .dot7 { top: 18%; left: 45%; animation-duration: 5.5s; }
        .dot8 { top: 60%; left: 10%; animation-duration: 6s; }
        .dot9 { top: 45%; left: 70%; animation-duration: 7s; }
        .dot10 { top: 92%; left: 30%; animation-duration: 5.5s; }
        .dot11 { top: 8%; left: 55%; animation-duration: 6.5s; }
        .dot12 { top: 40%; left: 5%; animation-duration: 7.5s; }
        .dot13 { top: 28%; left: 20%; animation-duration: 5s; }
        .dot14 { top: 70%; left: 80%; animation-duration: 8s; }
        .dot15 { top: 80%; left: 50%; animation-duration: 6s; }
        .dot16 { top: 15%; left: 70%; animation-duration: 5.5s; }
        .dot17 { top: 50%; left: 25%; animation-duration: 7s; }
        .dot18 { top: 75%; left: 15%; animation-duration: 6.5s; }
        .dot19 { top: 30%; left: 90%; animation-duration: 5s; }
        .dot20 { top: 10%; left: 30%; animation-duration: 8s; }

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

        .author {
          margin-top: 20px;
          font-size: 14px;
          color: #888;
        }

        .info-btn {
          margin-top: 10px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #aaa;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .info-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
          color: white;
        }

        .info-box {
          margin-top: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 10px 15px;
          text-align: left;
          color: #aaa;
          font-size: 13px;
        }

        .info-box ul {
          margin: 5px 0 5px 20px;
          padding: 0;
        }

        .info-box li {
          margin-bottom: 2px;
        }
      `}</style>
    </div>
  );
}
