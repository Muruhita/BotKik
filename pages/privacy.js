import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Privacy() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const goBack = () => router.push('/dashboard');

  // Данные ссылок
  const links = [
    { label: '📊 Памятка для ФИБ (Гугл Таблица)', url: 'https://docs.google.com/spreadsheets/d/1vghv-rV-7XVEzaZMvdLv2mj73LOb3IZgHOmEFeNYe5w/edit?gid=487155581#gid=487155581' },
    { label: '📁 sylphy (Гугл Таблица)', url: 'https://docs.google.com/spreadsheets/d/1G1wyJtcV4c2r_Oo7qvw0dl4tTBwaRy8TRONXtnCpNAE/edit?gid=0#gid=0' },
    { label: '📋 Гугл Таблица', url: 'https://docs.google.com/spreadsheets/d/1wtOzs-zYqVBF2JhCYstLs4Cn7hLMw1YMWdppgS_L0AQ/edit?gid=0#gid=0' },
    { label: '⚖️ Форум с законами Majestic RP', url: 'https://forum.majestic-rp.ru/forums/zakonodatel-naya-baza.1017/' }
  ];

  return (
    <Layout>
      <div className="privacy-page">
        {/* Анимированный фон */}
        <div className="animated-bg">
          <div className="gradient-overlay"></div>
          <div className="orb orb1"></div>
          <div className="orb orb2"></div>
          <div className="orb orb3"></div>
          <div className="particles">
            {[...Array(20)].map((_, i) => (
              <span key={i} className={`particle p${i + 1}`}></span>
            ))}
          </div>
        </div>

        {/* Контент */}
        <div className={`content ${visible ? 'show' : ''}`}>
          <h1 className="title">🔗 Полезные ссылки</h1>
          <p className="subtitle">Нажмите на нужную ссылку, чтобы открыть её в новой вкладке</p>

          <div className="links-list">
            {links.map((link, index) => (
              <a 
                key={index} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="link-card"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <button className="back-button" onClick={goBack}>← Вернуться на главную</button>
        </div>
      </div>

      <style jsx>{`
        .privacy-page {
          position: relative;
          min-height: 80vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
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

        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0.8; }
          25% { transform: translateY(-40px) translateX(20px); opacity: 1; }
          50% { transform: translateY(-80px) translateX(-20px); opacity: 0.4; }
          75% { transform: translateY(-40px) translateX(15px); opacity: 0.9; }
          100% { transform: translateY(0) translateX(0); opacity: 0.8; }
        }

        /* Контент */
        .content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 700px;
          width: 100%;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .content.show {
          opacity: 1;
          transform: translateY(0);
        }

        .title {
          font-size: 48px;
          color: white;
          margin-bottom: 16px;
          text-shadow: 0 4px 30px rgba(255,255,255,0.3);
          animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from { text-shadow: 0 4px 30px rgba(88,101,242,0.5); }
          to { text-shadow: 0 4px 30px rgba(255,105,180,0.7); }
        }

        .subtitle {
          font-size: 18px;
          color: #aaa;
          margin-bottom: 40px;
        }

        /* Ссылки */
        .links-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 40px;
        }

        .link-card {
          display: block;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 16px 24px;
          color: white;
          text-decoration: none;
          font-size: 18px;
          transition: all 0.3s ease;
          opacity: 0;
          animation: fadeInUp 0.6s ease forwards;
          backdrop-filter: blur(8px);
        }

        .link-card:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 30px rgba(255,255,255,0.15);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Кнопка назад */
        .back-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          margin-top: 20px;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: white;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(255,255,255,0.2);
        }
      `}</style>
    </Layout>
  );
}
