import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

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
      });
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        setIsAdmin(data.user && data.user.id === '1018113109346504744');
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
        <h1>📖 Справка</h1>
        <div className="content-box">
          {editMode ? (
            <>
              <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} rows="10" />
              <button onClick={saveContent}>Сохранить</button>
            </>
          ) : (
            <p>{content}</p>
          )}
        </div>
        {isAdmin && !editMode && (
          <button onClick={() => setEditMode(true)}>✏️ Редактировать</button>
        )}
      </div>

      <style jsx>{`
        .help-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .content-box {
          background: #161616;
          border: 1px solid #333;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 20px;
        }
        textarea {
          width: 100%;
          background: #222;
          color: white;
          border: 1px solid #444;
          border-radius: 8px;
          padding: 15px;
          box-sizing: border-box;
        }
        button {
          padding: 10px 20px;
          background: #fff;
          color: #000;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        button:hover {
          background: #ccc;
        }
      `}</style>
    </Layout>
  );
}