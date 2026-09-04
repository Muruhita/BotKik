import Layout from './Layout';

export default function FormLayout({ children }) {
  return (
    <Layout>
      <div className="form-page">
        {/* Анимированный фон */}
        <div className="animated-bg">
          <div className="gradient-layer"></div>
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="form-content">
          {children}
        </div>
      </div>

      <style jsx>{`
        .form-page {
          min-height: calc(100vh - 60px);
          padding: 30px;
          position: relative;
          overflow: hidden;
        }

        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -1;
          overflow: hidden;
        }

        .gradient-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0a0a0a 20%, #1a1a3e 50%, #0a0a0a 80%);
          animation: gradientShift 12s ease infinite;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: float 10s infinite ease-in-out;
        }
        .orb-1 {
          width: 400px;
          height: 400px;
          background: #3b82f6;
          top: -100px;
          left: -100px;
        }
        .orb-2 {
          width: 300px;
          height: 300px;
          background: #9333ea;
          top: 50%;
          right: -100px;
          animation-delay: -3s;
        }
        .orb-3 {
          width: 200px;
          height: 200px;
          background: #ffffff;
          bottom: -50px;
          left: 50%;
          opacity: 0.1;
          animation-delay: -6s;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -50px) scale(1.1); }
        }

        .form-content {
          position: relative;
          z-index: 10;
          max-width: 600px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  );
}