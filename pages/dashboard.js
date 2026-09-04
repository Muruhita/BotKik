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
    { title: 'Отпуск', icon: '🌴', path: '/forms/leave', desc: 'Взять отпуск' },
    { title: 'Снятие ЧС', icon: '🚫', path: '/forms/withdrawal', desc: 'Снять ЧС' },
  ];

  return (
    <Layout>
      <h1 className="page-title">📝 Формы</h1>
      <div className="cards-grid">
        {forms.map((form, index) => (
          <div key={index} className="card" onClick={() => router.push(form.path)} style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="card-icon">{form.icon}</div>
            <h3>{form.title}</h3>
            <p>{form.desc}</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .page-title {
          font-size: 32px;
          margin-bottom: 30px;
          text-align: center;
          color: #fff;
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        .card {
          background: #161616;
          border: 1px solid #333;
          border-radius: 16px;
          padding: 30px;
          cursor: pointer;
          transition: all 0.4s ease;
          text-align: center;
          opacity: 0;
          animation: fadeInUp 0.6s ease forwards;
        }
        .card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: #fff;
          box-shadow: 0 15px 40px rgba(255,255,255,0.1);
        }
        .card-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .card h3 {
          color: white;
          font-size: 18px;
          margin-bottom: 10px;
        }
        .card p {
          color: #888;
          font-size: 14px;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  );
}