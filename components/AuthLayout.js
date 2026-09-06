import ParticleBackground from './ParticleBackground';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-wrapper">
      {/* Фон с частицами */}
      <ParticleBackground />
      
      {/* Контент (кнопка входа, логотип и т.д.) */}
      <div className="auth-content">
        {children}
      </div>

      <style jsx>{`
        .auth-wrapper {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
        }

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
        }
      `}</style>
    </div>
  );
}
