import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

const ADMIN_IDS = ['1018113109346504744', '555380718566506506', '260076815970729985'];

export default function Help() {
  const [content, setContent] = useState('Загрузка...');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    fetch('/api/help')
      .then(res => res.json())
      .then(data => {
        setContent(data.content || 'Информация пока не заполнена.');
        setNewContent(data.content || '');
      })
      .catch(() => {
        setContent('Не удалось загрузить справку.');
      });

    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        setIsAdmin(data.user && ADMIN_IDS.includes(data.user.id));
      });
  }, []);

  const saveContent = async () => {
    const res = await fetch('/api/help', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent })
    });
    const data = await res.json();
    if (data.message) {
      setContent(newContent);
      setEditMode(false);
    }
  };

  return (
    <Layout>
      <div className="help-container">
        <h1>Справка</h1>

        <div className="content-box">
          {editMode ? (
            <>
              <div className="edit-header">
                <span>Режим редактирования (Shift+Enter — новый абзац)</span>
              </div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows="12"
                placeholder="Введите текст справки. Используйте Shift+Enter для переноса строки."
                className="edit-textarea"
              />
              <div className="edit-actions">
                <button className="save-btn" onClick={saveContent}>💾 Сохранить</button>
                <button className="cancel-btn" onClick={() => setEditMode(false)}>Отмена</button>
              </div>
            </>
          ) : (
            <div className="view-mode">
              {/* Самое важное: inline style whiteSpace: 'pre-line' сохраняет все переносы строк! */}
              <div className="content-text" style={{ whiteSpace: 'pre-line', lineHeight: '1.7', fontSize: '16px', color: '#e0e0e0' }}>
                {content}
              </div>
              {isAdmin && (
                <button className="edit-btn" onClick={() => setEditMode(true)}>
                   Редактировать
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .help-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #fff;
          text-align: center;
          margin-bottom: 30px;
          font-size: 36px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
          animation: fadeIn 0.5s ease;
        }

        .content-box {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          padding: 30px;
          position: relative;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          transition: border-color 0.3s ease;
          animation: slideUp 0.5s ease;
        }

        .content-box:hover {
          border-color: rgba(255, 255, 255, 0.3);
        }

        .view-mode {
          min-height: 150px;
        }

        .content-text {
          word-break: break-word;
        }

        .edit-header {
          color: #aaa;
          font-size: 13px;
          margin-bottom: 15px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 10px;
        }

        .edit-textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: #fff;
          padding: 15px;
          font-size: 16px;
          line-height: 1.6;
          resize: vertical;
          min-height: 200px;
          outline: none;
          transition: border-color 0.3s;
        }

        .edit-textarea:focus {
          border-color: #5865F2;
        }

        .edit-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .save-btn {
          background: #5865F2;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .save-btn:hover {
          background: #4752C4;
          transform: translateY(-2px);
        }

        .cancel-btn {
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        .edit-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .edit-btn:hover {
          background: rgba(255,255,255,0.2);
          border-color: white;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  );
}
