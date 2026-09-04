import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();

  const forms = [
    { title: 'Запрос на повышение', icon: '📈', path: '/forms/promotion', desc: 'Подать запрос' },
    { title: 'Перевод в отдел', icon: '🔄', path: '/forms/transfer', desc: 'Перевестись' },
    { title: 'Отчёт о повышении', icon: '📋', path: '/forms/report', desc: 'Отчёт для отдела' },
    { title: 'Отчёт на повышение (Хай Ранги)', icon: '🌟', path: '/forms/high-rank-report', desc: 'Для старшего состава' },
    { title: 'Заявление на увольнение', icon: '🚪', path: '/forms/resignation', desc: 'Уволиться' },
    { title: 'Восстановление', icon: '🔁', path: '/forms/reinstatement', desc: 'Вернуться в FIB' },
    { title: 'Перевод в FIB', icon: '🏛️', path: '/forms/transfer-to-fib', desc: 'Перевестись в FIB' },
    { title: 'Спец Вооружение', icon: '🔫', path: '/forms/weapon-request', desc: 'Запросить оружие' },
    { title: 'Снятие ЧС', icon: '🚫', path: '/forms/withdrawal', desc: 'Снять ЧС' },
  ];

  return (
    <Layout>
      <div className="dashboard-wrapper">
        {/* Фон с частицами и градиентом */}
        <div className="animated-bg">
          <div className="gradient-orb orb1"></div>
          <div className="gradient-orb orb2"></div>
          <div className="gradient-orb orb3"></div>
          <div className="particles">
            {[...Array(20)].map((_, i) => (
              <span key={i} className={`particle p${i + 1}`}></span>
            ))}
          </div>
        </div>

        <h1 className="page-title">📝 Формы</h1>
        
        <div className="cards-grid">
          {forms.map((form, index) => (
            <div 
              key={index} 
              className="card" 
              onClick={() => router.push(form.path)}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className="card-icon">{form.icon}</div>
              <h3>{form.title}</h3>
              <p>{form.desc}</p>
              <div className="card-glow"></div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dashboard-wrapper {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
        }

        /* ===== Анимированный фон ===== */
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          background: radial-gradient(circle at 20% 20%, #1a1a3e, #0a0a0a 60%);
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.4;
          animation: floatOrb 12s ease-in-out infinite;
        }

        .orb1 {
          width: 450px;
          height: 450px;
          background: #5865F2;
          top: -15%;
          left: -10%;
        }

        .orb2 {
          width: 350px;
          height: 350px;
          background: #FF69B4;
          bottom: -10%;
          right: -10%;
          animation-delay: -4s;
        }

        .orb3 {
          width: 250px;
          height: 250px;
          background: #00FFAA;
          top: 50%;
          left: 50%;
          opacity: 0.2;
          animation-delay: -8s;
        }

        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(40px, -50px) scale(1.1); }
          50% { transform: translate(-30px, 30px) scale(0.95); }
          75% { transform: translate(20px, 40px) scale(1.05); }
        }

        /* Частицы */
        .particles {
          position: absolute;
          inset: 0;
        }

        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.7);
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
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
          25% { transform: translateY(-30px) translateX(20px); opacity: 1; }
          50% { transform: translateY(-60px) translateX(-20px); opacity: 0.6; }
          75% { transform: translateY(-30px) translateX(15px); opacity: 0.9; }
          100% { transform: translateY(0) translateX(0); opacity: 0.8; }
        }

        /* ===== Заголовок ===== */
        .page-title {
          font-size: 40px;
          font-weight: 800;
          text-align: center;
          color: #fff;
          margin-bottom: 40px;
          text-shadow: 0 4px 30px rgba(0,0,0,0.5);
          animation: titleGlow 3s ease-in-out infinite alternate;
        }

        @keyframes titleGlow {
          from { text-shadow: 0 4px 30px rgba(88, 101, 242, 0.5); }
          to { text-shadow: 0 4px 30px rgba(255, 105, 180, 0.7); }
        }

        /* ===== Карточки ===== */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
          cursor: pointer;
          text-align: center;
          overflow: hidden;
          backdrop-filter: blur(10px);
          transform-style: preserve-3d;
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease, border-color 0.4s ease;
          opacity: 0;
          animation: cardIn 0.6s ease forwards;
        }

        .card:hover {
          transform: perspective(800px) rotateX(8deg) rotateY(-8deg) translateY(-10px);
          border-color: #5865F2;
          box-shadow: 0 20px 40px rgba(88, 101, 242, 0.4);
        }

        .card-icon {
          font-size: 56px;
          margin-bottom: 16px;
          transition: transform 0.3s ease;
          transform: translateZ(30px);
        }

        .card:hover .card-icon {
          transform: scale(1.2) rotate(8deg) translateZ(50px);
        }

        .card h3 {
          font-size: 18px;
          color: #fff;
          margin-bottom: 8px;
          transform: translateZ(20px);
        }

        .card p {
          font-size: 14px;
          color: #aaa;
          transform: translateZ(15px);
        }

        /* Свечение внутри карточки */
        .card-glow {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(88,101,242,0.3), transparent 70%);
          top: -30px;
          right: -30px;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .card:hover .card-glow {
          opacity: 1;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(40px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </Layout>
  );
}
