import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function Hosting() {
  const router = useRouter();

  const hosts = [
    { name: 'Дроп', url: 'https://dropmefiles.com' },
    { name: 'Япикс', url: 'https://yapx.ru/upload' },
    { name: 'Фотора', url: 'https://fotora.ru' },
    { name: 'Гугл Диск', url: 'https://drive.google.com/drive/' },
    { name: 'Imgur', url: 'https://imgur.com/upload' },
    { name: 'Imgbb', url: 'https://ru.imgbb.com' },
    { name: 'Яндекс Диск', url: 'https://disk.yandex.ru/client/recent' },
  ];

  return (
    <Layout>
      <div className="hosting-container">
        <h1>Фотохостинги</h1>
        <p className="description">Список доступных сервисов для загрузки скриншотов и изображений:</p>

        <div className="hosts-list">
          {hosts.map((host, index) => (
            <a 
              key={index} 
              href={host.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="host-link"
            >
              {host.name} — <span className="host-url">{host.url}</span>
            </a>
          ))}
        </div>

        <button className="back-button" onClick={() => router.push('/dashboard')}>← Вернуться на главную</button>
      </div>

      <style jsx>{`
        .hosting-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 30px;
          text-align: center;
        }
        h1 {
          color: #fff;
          margin-bottom: 10px;
        }
        .description {
          color: #aaa;
          margin-bottom: 30px;
        }
        .hosts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 30px;
        }
        .host-link {
          display: block;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 14px 20px;
          color: #fff;
          text-decoration: none;
          font-size: 16px;
          transition: all 0.3s ease;
          text-align: left;
        }
        .host-link:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }
        .host-url {
          color: #aaa;
          font-size: 14px;
        }
        .back-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          padding: 12px 24px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .back-button:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: #fff;
          transform: translateY(-2px);
        }
      `}</style>
    </Layout>
  );
}
