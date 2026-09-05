import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

const DEPARTMENTS = [
  { id: 'ib', name: 'IB (Intelligence Branch)' },
  { id: 'cid', name: 'CID (Criminal Investigation)' },
  { id: 'fa', name: 'FA (Free Agent)' },
  { id: 'hrt', name: 'HRT (Hostage Rescue)' },
  { id: 'atf', name: 'ATF (Anti Terrorism)' },
  { id: 'af', name: 'AF (Air Force)' },
  { id: 'ocu', name: 'OCU (Organized Crime)' },
  { id: 'dea', name: 'DEA (Drug Enforcement)' },
  { id: 'fna', name: 'FNA (Academy)' },
  { id: 'nsb', name: 'NSB (National Security)' },
  { id: 'trainee', name: 'Trainee (Стажёр)' }
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [department, setDepartment] = useState('');
  const [banned, setBanned] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

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
        setLoading(false);
      })
      .catch(() => {
        setStatus('Ошибка загрузки профиля');
        setLoading(false);
      });

    fetch('/api/spam-status')
      .then(res => res.json())
      .then(data => {
        if (data.attemptsLeft !== undefined) {
          setAttemptsLeft(data.attemptsLeft);
        }
      })
      .catch(() => {});
  }, []);

  const saveProfile = async () => {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, department })
    });
    const data = await res.json();
    setStatus(data.message || data.error);
  };

  if (loading) return <p className="loading">Загрузка...</p>;

  return (
    <Layout>
      <div className="profile-container">
        <h1>👤 Профиль</h1>
        {user && (
          <div className="profile-card">
            <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="Avatar" className="avatar" />
            <h2>{user.username}</h2>
            <p>Discord ID: {user.id}</p>
            <div className={`status ${banned ? 'banned' : 'active'}`}>
              {banned ? '⛔ Заблокирован' : '✅ Активен'}
            </div>

            <div className="spam-counter">
              🕐 Доступно заявок в этом часе: <strong>{banned ? 0 : attemptsLeft}</strong>
            </div>

            <div className="field">
              <label>Игровой ник (Имя Фамилия + Статик):</label>
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Например: Sanya Suspect 270726" />
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

            <button onClick={saveProfile} className="save-btn">Сохранить</button>
            {status && <p className="status-msg">{status}</p>}
          </div>
        )}
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 500px;
          margin: 0 auto;
          text-align: center;
        }
        h1 {
          margin-bottom: 30px;
          color: white;
        }
        .profile-card {
          background: #161616;
          border: 1px solid #333;
          padding: 40px;
          border-radius: 20px;
        }
        .avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin-bottom: 20px;
        }
        h2 {
          color: white;
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
          background: rgba(88, 101, 242, 0.1);
          border: 1px solid rgba(88, 101, 242, 0.3);
          border-radius: 10px;
          padding: 10px;
          margin: 15px 0;
          color: #aaa;
          font-size: 14px;
        }
        .spam-counter strong {
          color: white;
        }
        .field {
          margin-bottom: 20px;
          text-align: left;
        }
        label {
          display: block;
          color: #aaa;
          margin-bottom: 8px;
        }
        input, select {
          width: 100%;
          padding: 12px;
          background: #222;
          border: 1px solid #444;
          color: white;
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
        .loading {
          color: #aaa;
          text-align: center;
          padding: 40px;
        }
      `}</style>
    </Layout>
  );
}
