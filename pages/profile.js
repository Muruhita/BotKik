import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

const DEPARTMENTS = [
  { id: 'ib', name: 'IB (Intelligence Branch)' },
  { id: 'cid', name: 'CID (Criminal Investigation Department)' },
  { id: 'fa', name: 'FA (Free Agent)' },
  { id: 'hrt', name: 'HRT (Hostage Rescue Team)' },
  { id: 'atf', name: 'ATF (Anti Terrorism Force)' },
  { id: 'af', name: 'AF (Air Force)' },
  { id: 'ocu', name: 'OCU (Organized Crime Unit)' },
  { id: 'dea', name: 'DEA (Drug Enforcement Administration)' },
  { id: 'fna', name: 'FNA (Federal National Academy)' },
  { id: 'nsb', name: 'NSB (National Security Branch)' },
  { id: 'trainee', name: 'TR (Trainee)' }
];

const PRESETS = [
  { id: 'default', name: 'Стандарт', style: { background: '#161616', border: '1px solid #333' } },
  { id: 'blue', name: 'Синий', style: { background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', border: '1px solid #3b82f6' } },
  { id: 'purple', name: 'Фиолетовый', style: { background: 'linear-gradient(135deg, #4c1d95, #a855f7)', border: '1px solid #a855f7' } },
  { id: 'green', name: 'Зелёный', style: { background: 'linear-gradient(135deg, #065f46, #10b981)', border: '1px solid #10b981' } },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [department, setDepartment] = useState('');
  const [banned, setBanned] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [profileCustom, setProfileCustom] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatus(data.error);
          setLoading(false);
          return;
        }
        setUser(data.user);
        setNickname(data.nickname || '');
        setDepartment(data.department || '');
        setBanned(data.banned);
        if (data.profileCustom) {
          setProfileCustom(JSON.parse(data.profileCustom));
        }
        setLoading(false);
      })
      .catch(() => {
        setStatus('Ошибка загрузки профиля');
        setLoading(false);
      });

    fetch('/api/spam-status')
      .then(res => res.json())
      .then(data => {
        if (data.attemptsLeft !== undefined) setAttemptsLeft(data.attemptsLeft);
        if (data.isBanned !== undefined) setBanned(data.isBanned);
      })
      .catch(() => {});
  }, []);

  // Установка выбранного пресета или URL при загрузке
  useEffect(() => {
    if (profileCustom) {
      if (profileCustom.type === 'preset') {
        setSelectedPreset(profileCustom.presetId);
      } else if (profileCustom.type === 'image') {
        setImageUrl(profileCustom.url);
      }
    }
  }, [profileCustom]);

  const saveProfile = async () => {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, department })
    });
    const data = await res.json();
    setStatus(data.message || data.error);
  };

  const applyPreset = async (presetId) => {
    const custom = { type: 'preset', presetId };
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileCustom: custom })
    });
    const data = await res.json();
    if (data.message) {
      setProfileCustom(custom);
      setSelectedPreset(presetId);
      setStatus('Пресет применён!');
    } else {
      setStatus(data.error);
    }
  };

  const applyImage = async () => {
    if (!imageUrl.trim()) {
      setStatus('Введите URL картинки');
      return;
    }
    const custom = { type: 'image', url: imageUrl };
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileCustom: custom })
    });
    const data = await res.json();
    if (data.message) {
      setProfileCustom(custom);
      setStatus('Картинка применена!');
    } else {
      setStatus(data.error);
    }
  };

  const resetCustom = async () => {
    const custom = { type: 'preset', presetId: 'default' };
    await applyPreset('default');
    setImageUrl('');
    setSelectedPreset('default');
  };

  // Вычисляем стиль карточки
  let cardStyle = PRESETS[0].style;
  if (profileCustom) {
    if (profileCustom.type === 'preset') {
      const preset = PRESETS.find(p => p.id === profileCustom.presetId);
      if (preset) cardStyle = preset.style;
    } else if (profileCustom.type === 'image' && profileCustom.url) {
      cardStyle = {
        backgroundImage: `url(${profileCustom.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '1px solid #fff'
      };
    }
  }

  if (loading) return <p className="loading">Загрузка...</p>;

  return (
    <Layout>
      <div className="profile-container">
        <h1>Ваш профиль</h1>
        {user && (
          <div className="profile-card" style={cardStyle}>
            <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="Avatar" className="avatar" />
            <h2>{user.username}</h2>
            <p>Discord ID: {user.id}</p>
            <div className={`status ${banned ? 'banned' : 'active'}`}>
              {banned ? '⛔ Заблокирован' : '✅ Нет блокировки'}
            </div>

            <div className="spam-counter">
              🕐 Доступно заявок на этот час: <strong>{banned ? 0 : attemptsLeft}</strong>
            </div>

            <div className="field">
              <label>Игровой ник (Имя Фамилия + Статик):</label>
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Например: Name Surname | 123456" />
            </div>

            <div className="field">
              <label>Ваш отдел:</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="">-- Не выбран --</option>
                {DEPARTMENTS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <button onClick={saveProfile} className="save-btn">Сохранить данные</button>
            {status && <p className="status-msg">{status}</p>}

            <div className="customization">
              <h3>Настройка панели профиля</h3>
              <div className="preset-grid">
                {PRESETS.map(preset => (
                  <button key={preset.id} className={`preset-btn ${selectedPreset === preset.id ? 'active' : ''}`} onClick={() => applyPreset(preset.id)}>
                    <span className="preset-preview" style={{ background: preset.style.background }}></span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
              <div className="image-upload">
                <label>Или вставьте ссылку на картинку:</label>
                <div className="image-row">
                  <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                  <button onClick={applyImage} className="apply-btn">Применить</button>
                </div>
              </div>
              <button onClick={resetCustom} className="reset-btn">Сбросить кастомизацию</button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }
        h1 {
          margin-bottom: 30px;
          color: #fff;
        }
        .profile-card {
          border-radius: 20px;
          padding: 40px;
          color: #fff;
          position: relative;
          overflow: hidden;
        }
        .avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin-bottom: 20px;
          border: 3px solid rgba(255,255,255,0.5);
        }
        h2 {
          margin-bottom: 10px;
        }
        .status {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          margin: 15px 0;
        }
        .status.banned {
          background: #ff4444;
          color: white;
        }
        .status.active {
          background: #4CAF50;
          color: white;
        }
        .spam-counter {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          padding: 10px;
          margin: 15px 0;
          font-size: 14px;
        }
        .spam-counter strong {
          color: #fff;
        }
        .field {
          margin-bottom: 20px;
          text-align: left;
        }
        label {
          display: block;
          margin-bottom: 8px;
        }
        input, select {
          width: 100%;
          padding: 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          color: #fff;
          border-radius: 8px;
          box-sizing: border-box;
        }
        select option {
          background: #222;
        }
        .save-btn {
          width: 100%;
          padding: 12px;
          background: #fff;
          color: #000;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 10px;
        }
        .save-btn:hover {
          background: #ccc;
        }
        .status-msg {
          margin-top: 10px;
          color: #4CAF50;
          font-size: 14px;
        }
        .customization {
          margin-top: 30px;
          border-top: 1px solid rgba(255,255,255,0.3);
          padding-top: 20px;
        }
        .customization h3 {
          margin-bottom: 15px;
        }
        .preset-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .preset-btn {
          background: rgba(255,255,255,0.1);
          border: 2px solid transparent;
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #fff;
        }
        .preset-btn.active {
          border-color: #fff;
        }
        .preset-preview {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          margin-bottom: 5px;
        }
        .image-upload {
          margin-bottom: 20px;
          text-align: left;
        }
        .image-row {
          display: flex;
          gap: 10px;
        }
        .image-row input {
          flex: 1;
        }
        .apply-btn, .reset-btn {
          background: rgba(255,255,255,0.2);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 15px;
          border-radius: 8px;
          cursor: pointer;
        }
        .apply-btn:hover, .reset-btn:hover {
          background: rgba(255,255,255,0.3);
        }
        .reset-btn {
          width: 100%;
        }
      `}</style>
    </Layout>
  );
}
