import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ClaimForm() {
  const router = useRouter();
  const [myNickname, setMyNickname] = useState('');
  const [formData, setFormData] = useState({
    offenderName: '',
    proofLink: '',
    reason: ''
  });

  // Автоподстановка ника из профиля (но поле остаётся редактируемым)
  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.nickname) setMyNickname(data.nickname);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'claim', fullName: myNickname, ...formData })
    });

    if (res.ok) {
      alert('✅ Жалоба отправлена!');
      router.push('/dashboard');
    } else {
      const err = await res.json();
      alert('❌ ' + err.error);
    }
  };

  return (
    <Layout>
      <div className="form-page">
        <button onClick={() => router.push('/dashboard')} className="back-btn">← Назад к выбору</button>
        <div className="form-container">
          <h1>📢 Жалоба</h1>
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label>Ваши Имя Фамилия + Статик</label>
              <input 
                type="text" 
                value={myNickname} 
                onChange={(e) => setMyNickname(e.target.value)} 
                required
                placeholder="Введите ваше Имя Фамилия + Статик"
              />
            </div>

            <div className="form-group">
              <label>Имя Фамилия + Статик нарушителя</label>
              <input 
                type="text" 
                value={formData.offenderName} 
                onChange={(e) => setFormData({...formData, offenderName: e.target.value})} 
                required 
                placeholder="Например: Ivan Petrov | 123456" 
              />
            </div>

            <div className="form-group">
              <label>Доказательства (ссылка)</label>
              <input 
                type="url" 
                value={formData.proofLink} 
                onChange={(e) => setFormData({...formData, proofLink: e.target.value})} 
                required 
                placeholder="https://imgur.com/..." 
              />
            </div>

            <div className="form-group">
              <label>Причина жалобы</label>
              <textarea 
                value={formData.reason} 
                onChange={(e) => setFormData({...formData, reason: e.target.value})} 
                required 
                rows="4" 
                placeholder="Например: Он закафал меня без причины"
              />
            </div>

            <button type="submit" className="submit-btn">📤 Отправить жалобу</button>
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
        textarea { resize: vertical; }
        .submit-btn { width: 100%; padding: 15px; background: #fff; color: #000; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s; }
        .submit-btn:hover { background: #ccc; transform: translateY(-2px); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Layout>
  );
}
