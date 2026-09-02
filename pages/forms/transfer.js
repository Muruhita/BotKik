import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const DEPARTMENTS = [
  { id: 'cid', name: 'CID (Criminal Investigation Department)', emoji: '🚔' },
  { id: 'fa', name: 'FA (Free Agent)', emoji: '🆓' },
  { id: 'hrt', name: 'HRT (Hostage Rescue Team)', emoji: '🛡️' },
  { id: 'atf', name: 'ATF (Anti Terrorism Force)', emoji: '💥' },
  { id: 'af', name: 'AF (Air Force)', emoji: '✈️' },
  { id: 'ocu', name: 'OCU (Organized Crime Unit)', emoji: '⚖️' },
  { id: 'dea', name: 'DEA (Drug Enforcement Administration)', emoji: '💊' },
  { id: 'fna', name: 'FNA (Federal National Academy)', emoji: '📚' },
  { id: 'nsb', name: 'NSB (National Security Branch)', emoji: '🏛️' },
  { id: 'trainee', name: 'Trainee (Стажёр)', emoji: '📖' }
];

const RANKS = [
  { value: '1', label: '1' }, { value: '2', label: '2' },
  { value: '3', label: '3' }, { value: '4', label: '4' },
  { value: '5', label: '5' }, { value: '6', label: '6' },
  { value: '7', label: '7' }, { value: '8', label: '8' },
  { value: '9', label: '9' }, { value: '10', label: '10' }
];

const EXPERIENCE_OPTIONS = [
  'Нет опыта, но хочу попробовать',
  'Был средним составом в подобных отделах',
  'Занимал руководящую должность'
];

const RATING_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export default function TransferForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    rank: '',
    currentDepartment: '',
    targetDepartment: '',
    reason: '',
    cidWhatIs: '',
    cidExperience: '',
    cidExamples: '',
    cidServers: '',
    cidKnowledge: '',
    cidLawKnowledge: '',
    faRules: '',
    faPrevious: ''
  });

  const targetDept = formData.targetDepartment;
  const currentDept = formData.currentDepartment;
  const rankNum = parseInt(formData.rank);

  const showCidFields = targetDept === 'cid';
  const showFaFields = targetDept === 'fa';
  const isSameDepartment = currentDept && targetDept && currentDept === targetDept;
  const isFaRankValid = targetDept !== 'fa' || (targetDept === 'fa' && rankNum >= 5);
  const isCidComplete = !showCidFields || (
    formData.cidWhatIs.trim() &&
    formData.cidExperience &&
    formData.cidExamples.trim() &&
    formData.cidServers.trim() &&
    formData.cidKnowledge &&
    formData.cidLawKnowledge
  );
  const isFaComplete = !showFaFields || (
    formData.faRules.trim() &&
    formData.faPrevious.trim()
  );

  const isFormValid = () => {
    if (!formData.fullName.trim()) return false;
    if (!formData.rank) return false;
    if (!formData.currentDepartment) return false;
    if (!formData.targetDepartment) return false;
    if (!formData.reason.trim()) return false;
    if (isSameDepartment) return false;
    if (!isFaRankValid) return false;
    if (!isCidComplete) return false;
    if (!isFaComplete) return false;
    return true;
  };

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/');
          return;
        }
        setUser(data.user);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      if (isSameDepartment) {
        alert('❌ Нельзя перевестись в тот же отдел!');
        return;
      }
      if (!isFaRankValid) {
        alert('❌ Для перевода в FA необходим ранг 5 или выше!');
        return;
      }
      alert('❌ Пожалуйста, заполните все обязательные поля!');
      return;
    }

    setSubmitting(true);
    
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'transfer',
          targetDepartment: formData.targetDepartment,
          fullName: formData.fullName,
          rank: formData.rank,
          currentDepartment: formData.currentDepartment,
          reason: formData.reason,
          cidWhatIs: formData.cidWhatIs,
          cidExperience: formData.cidExperience,
          cidExamples: formData.cidExamples,
          cidServers: formData.cidServers,
          cidKnowledge: formData.cidKnowledge,
          cidLawKnowledge: formData.cidLawKnowledge,
          faRules: formData.faRules,
          faPrevious: formData.faPrevious
        })
      });

      if (res.ok) {
        alert('✅ Заявка на перевод успешно отправлена!');
        router.push('/dashboard');
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Ошибка отправки');
      }
    } catch (error) {
      alert('❌ Ошибка при отправке заявки: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="form-page">
      <button onClick={() => router.push('/dashboard')} className="back-btn">
        ← Назад к выбору
      </button>
      
      <div className="form-container">
        <h1>🔄 Перевод в отдел</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя Фамилия + Статик *</label>
            <input 
              type="text" 
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Например: Sanya Suspect 270726"
            />
          </div>

          <div className="form-group">
            <label>Ваш ранг *</label>
            <select
              required
              value={formData.rank}
              onChange={(e) => setFormData({...formData, rank: e.target.value})}
              className="select-input"
            >
              <option value="">-- Выберите ранг --</option>
              {RANKS.map(rank => (
                <option key={rank.value} value={rank.value}>{rank.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ваш текущий отдел *</label>
            <select
              required
              value={formData.currentDepartment}
              onChange={(e) => setFormData({...formData, currentDepartment: e.target.value})}
              className="select-input"
            >
              <option value="">-- Выберите текущий отдел --</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.emoji} {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Желаемый отдел *</label>
            <select
              required
              value={formData.targetDepartment}
              onChange={(e) => {
                setFormData({
                  ...formData, 
                  targetDepartment: e.target.value,
                  cidWhatIs: '',
                  cidExperience: '',
                  cidExamples: '',
                  cidServers: '',
                  cidKnowledge: '',
                  cidLawKnowledge: '',
                  faRules: '',
                  faPrevious: ''
                });
              }}
              className="select-input"
            >
              <option value="">-- Выберите желаемый отдел --</option>
              {DEPARTMENTS
                .filter(dept => dept.id !== 'trainee')
                .map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.emoji} {dept.name}
                  </option>
                ))}
            </select>
          </div>

          {isSameDepartment && (
            <div className="warning-box error">
              <span className="warning-icon">❌</span>
              <span className="warning-text">Нельзя перевестись в тот же отдел!</span>
            </div>
          )}

          {targetDept === 'fa' && !isFaRankValid && (
            <div className="warning-box error">
              <span className="warning-icon">❌</span>
              <span className="warning-text">Для перевода в FA необходим ранг 5 или выше!</span>
            </div>
          )}

          <div className="form-group">
            <label>Причина перевода *</label>
            <textarea 
              required
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              placeholder="Опишите причину перевода..."
              rows="4"
            />
          </div>

          {showCidFields && (
            <div className="extra-fields cid-fields">
              <h3>📋 Дополнительные вопросы для CID</h3>
              
              <div className="form-group">
                <label>Чем занимается CID/DB? *</label>
                <textarea 
                  required
                  value={formData.cidWhatIs}
                  onChange={(e) => setFormData({...formData, cidWhatIs: e.target.value})}
                  placeholder="Опишите, чем занимается отдел CID/DB..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Ваш опыт работы в CID/DB? *</label>
                <select
                  required
                  value={formData.cidExperience}
                  onChange={(e) => setFormData({...formData, cidExperience: e.target.value})}
                  className="select-input"
                >
                  <option value="">-- Выберите вариант --</option>
                  {EXPERIENCE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Примеры работ *</label>
                <textarea 
                  required
                  value={formData.cidExamples}
                  onChange={(e) => setFormData({...formData, cidExamples: e.target.value})}
                  placeholder="Приведите примеры ваших работ в CID/DB..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>На каких серверах до этого вы были в отделах CID/DB? *</label>
                <textarea 
                  required
                  value={formData.cidServers}
                  onChange={(e) => setFormData({...formData, cidServers: e.target.value})}
                  placeholder="Укажите серверы, где вы работали в CID/DB..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Ваши знания от 1-10 по работе отдела CID? *</label>
                <select
                  required
                  value={formData.cidKnowledge}
                  onChange={(e) => setFormData({...formData, cidKnowledge: e.target.value})}
                  className="select-input"
                >
                  <option value="">-- Оцените знания --</option>
                  {RATING_OPTIONS.map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ваши знания от 1-10 по законке? *</label>
                <select
                  required
                  value={formData.cidLawKnowledge}
                  onChange={(e) => setFormData({...formData, cidLawKnowledge: e.target.value})}
                  className="select-input"
                >
                  <option value="">-- Оцените знания --</option>
                  {RATING_OPTIONS.map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {showFaFields && (
            <div className="extra-fields fa-fields">
              <h3>📋 Дополнительные вопросы для FA</h3>
              
              <div className="form-group">
                <label>Насколько хорошо вы знаете правила ПОИП? *</label>
                <textarea 
                  required
                  value={formData.faRules}
                  onChange={(e) => setFormData({...formData, faRules: e.target.value})}
                  placeholder="Опишите ваши знания правил ПОИП..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Были ли вы раньше в отделе FA? *</label>
                <textarea 
                  required
                  value={formData.faPrevious}
                  onChange={(e) => setFormData({...formData, faPrevious: e.target.value})}
                  placeholder="Расскажите о вашем предыдущем опыте в FA..."
                  rows="3"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Discord ID</label>
            <input 
              type="text" 
              value={`${user.username} (${user.id})`}
              disabled 
              className="disabled-input" 
            />
          </div>

          <button type="submit" className="submit-btn" disabled={submitting || !isFormValid()}>
            {submitting ? '⏳ Отправка...' : '📤 Отправить заявку'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .form-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%);
          padding: 30px;
        }
        .back-btn {
          background: rgba(255, 255, 255, 0.08);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 20px;
          transition: all 0.2s;
          font-size: 14px;
        }
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .form-container {
          max-width: 600px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        h1 {
          color: white;
          margin-bottom: 30px;
          font-size: 28px;
        }
        h3 {
          color: white;
          margin-bottom: 20px;
          font-size: 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 10px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          color: #8b8ba7;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
        }
        input, textarea, .select-input {
          width: 100%;
          padding: 12px 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: white;
          font-size: 15px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .select-input {
          appearance: none;
          cursor: pointer;
        }
        .select-input option {
          background: #1a1a3e;
          color: white;
        }
        input:focus, textarea:focus, .select-input:focus {
          outline: none;
          border-color: #5865F2;
          background: rgba(255, 255, 255, 0.08);
        }
        .disabled-input {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.03);
        }
        textarea {
          resize: vertical;
          min-height: 100px;
        }
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #5865F2;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 10px;
        }
        .submit-btn:hover:not(:disabled) {
          background: #4752C4;
          transform: translateY(-1px);
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #0a0a1a;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(88, 101, 242, 0.2);
          border-top-color: #5865F2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-container p {
          color: #8b8ba7;
        }

        .warning-box {
          border-radius: 10px;
          padding: 14px 18px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .warning-box.error {
          background: rgba(244, 67, 54, 0.15);
          border: 1px solid #F44336;
        }
        .warning-icon {
          font-size: 22px;
          flex-shrink: 0;
        }
        .warning-text {
          color: #EF9A9A;
          font-size: 14px;
          line-height: 1.4;
        }

        .extra-fields {
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          animation: fadeIn 0.3s ease-in-out;
        }
        .cid-fields {
          background: rgba(33, 150, 243, 0.08);
          border: 1px solid rgba(33, 150, 243, 0.25);
        }
        .fa-fields {
          background: rgba(76, 175, 80, 0.08);
          border: 1px solid rgba(76, 175, 80, 0.25);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}