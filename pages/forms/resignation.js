import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function ResignationForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', screenshot: '' });

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(res => res.json()),
      fetch('/api/profile').then(res => res.json())
    ]).then(([meData, profileData]) => {
      if (!meData.user) {
        router.push('/');
        return;
      }
      setUser(meData.user);
      if (profileData.nickname) {
        setFormData(prev => ({ ...prev, fullName: profileData.nickname }));
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'resignation',
          fullName: formData.fullName,
          screenshot: formData.screenshot
        })
      });
      if (res.ok) { alert('✅ Заявление успешно отправлено!'); router.push('/dashboard'); }
      else { const err = await res.json(); throw new Error(err.error || 'Ошибка'); }
    } catch (error) { alert('❌ ' + error.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Загрузка...</p></div>;

  return (
    <Layout>
      <div className="form-page">
        <button onClick={() => router.push('/dashboard')} className="back-btn">← Назад к выбору</button>
        <div className="form-container">
          <h1>📋 Заявление на увольнение</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Имя Фамилия + Статик *</label>
              <input type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="Например: Sanya Suspect 270726" />
            </div>
            <div className="form-group">
              <label>Скриншот планшета *</label>
              <textarea required value={formData.screenshot} onChange={(e) => setFormData({...formData, screenshot: e.target.value})} rows="4" placeholder="Вставьте ссылку на скриншот планшета..." />
            </div>
            <div className="form-group">
              <label>Discord ID</label>
              <input type="text" value={`${user.username} (${user.id})`} disabled className="disabled-input" />
            </div>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? '⏳ Отправка...' : '📤 Отправить заявление'}
            </button>
          </form>
        </div>
      </div>
      <style jsx>{`
        .form-page { min-height: calc(100vh - 60px); padding: 30px; }
        .back-btn { background: rgba(255, 255, 255, 0.08); color: #aaa; border: 1px solid rgba(255, 255, 255, 0.15); padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-bottom: 20px; transition: all 0.3s; font-size: 14px; }
        .back-btn:hover { background: rgba(255, 255, 255, 0.15); color: white; transform: translateY(-2px); }
        .form-container { max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border-radius: 20px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.1); animation: fadeIn 0.5s ease; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); }
        h1 { color: white; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; color: #888; margin-bottom: 8px; }
        input, textarea { width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); color: white; border-radius: 8px; box-sizing: border-box; }
        .disabled-input { opacity: 0.5; cursor: not-allowed; }
        .submit-btn { width: 100%; padding: 15px; background: #fff; color: #000; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s; }
        .submit-btn:hover { background: #ccc; transform: translateY(-2px); }
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #0a0a0a; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-container p { color: #888; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Layout>
  );
}
