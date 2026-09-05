import Layout from '../components/Layout';
import { useState, useEffect, useRef } from 'react';

export default function Terms() {
  const [gameState, setGameState] = useState('idle'); // idle | playing | finished
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [target, setTarget] = useState({ x: 0, y: 0, visible: true });
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const timerRef = useRef(null);
  const boardRef = useRef(null);
  const scoreRef = useRef(0); // Чтобы всегда иметь актуальный счет при сохранении

  // Загрузка таблицы лидеров при открытии страницы
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Ошибка загрузки лидерборда:', error);
    }
  };

  const startGame = () => {
    setScore(0);
    scoreRef.current = 0; // Сбрасываем ref
    setTimeLeft(15);
    setGameState('playing');
    setShowLeaderboard(false);
    moveTarget();
  };

  // Сохранение результата (вызывается и при ручном завершении, и при истечении времени)
  const saveScore = async (finalScore) => {
    try {
      const meRes = await fetch('/api/me');
      const meData = await meRes.json();
      if (meData.user) {
        const res = await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: meData.user.id, username: meData.user.username, score: finalScore })
        });
        if (res.ok) {
          // Успешно сохранили - обновляем таблицу
          await fetchLeaderboard();
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения результата:', error);
    }
    setShowLeaderboard(true);
  };

  const stopGame = () => {
    clearInterval(timerRef.current);
    setGameState('finished');
    saveScore(scoreRef.current);
  };

  const moveTarget = () => {
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const x = Math.random() * (rect.width - 50);
    const y = Math.random() * (rect.height - 50);
    setTarget({ x, y, visible: true });
  };

  const catchTarget = (e) => {
    e.stopPropagation();
    const newScore = scoreRef.current + 1;
    scoreRef.current = newScore;
    setScore(newScore);
    setTarget(prev => ({ ...prev, visible: false }));
    setTimeout(() => {
      moveTarget();
      setTarget(prev => ({ ...prev, visible: true }));
    }, 150);
  };

  const handleBoardClick = () => {};

  // Таймер
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameState('finished');
          // Сохраняем результат при естественном истечении времени
          saveScore(scoreRef.current); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const getRating = (s) => {
    if (s >= 15) return '🏆 Легенда FIB!';
    if (s >= 10) return '🔥 Отличный агент!';
    if (s >= 5) return '👍 Неплохо!';
    return '🐢 Ты медленный...';
  };

  return (
    <Layout>
      <div className="game-container">
        <h1>🎮 Мини-игра</h1>
        <p className="description">Поймай агента FIB! Кликай по значку 🔍, пока не вышло время.</p>

        {gameState === 'idle' && (
          <button className="start-btn" onClick={startGame}>Начать игру</button>
        )}

        {gameState === 'playing' && (
          <div className="game-area">
            <div className="game-info">
              <span>⏱ Осталось: {timeLeft} сек.</span>
              <span>⭐ Очки: {score}</span>
            </div>
            <div ref={boardRef} className="game-board" onClick={handleBoardClick}>
              {target.visible && (
                <div className="target" style={{ left: target.x, top: target.y }} onClick={catchTarget}>
                  🔍
                </div>
              )}
            </div>
            <button className="reset-btn" onClick={stopGame}>Завершить досрочно</button>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="game-results">
            <p className="final-score">Ты поймал {score} агентов!</p>
            <p className="rating">{getRating(score)}</p>
            <button className="start-btn" onClick={startGame}>Сыграть ещё раз</button>
          </div>
        )}

        {/* Таблица лидеров */}
        <div className="leaderboard-section">
          <button className="toggle-leaderboard" onClick={() => setShowLeaderboard(!showLeaderboard)}>
            {showLeaderboard ? 'Скрыть таблицу лидеров' : 'Показать таблицу лидеров'}
          </button>
          {showLeaderboard && (
            <div className="leaderboard">
              <h3>🏆 Топ игроков</h3>
              <table>
                <thead>
                  <tr>
                    <th>Место</th>
                    <th>Игрок</th>
                    <th>Очки</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 ? (
                    <tr><td colSpan="3">Пока нет результатов</td></tr>
                  ) : (
                    leaderboard.map((entry, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{entry.username}</td>
                        <td>{entry.score}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .game-container {
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
          padding: 30px;
          background: #161616;
          border: 1px solid #333;
          border-radius: 20px;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        h1 {
          color: white;
          margin-bottom: 10px;
        }
        .description {
          color: #888;
          margin-bottom: 30px;
        }
        .start-btn {
          background: #5865F2;
          color: white;
          border: none;
          padding: 15px 40px;
          font-size: 18px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .start-btn:hover {
          background: #4752C4;
          transform: scale(1.05);
        }
        .game-area {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        .game-info {
          display: flex;
          justify-content: space-between;
          width: 100%;
          color: #aaa;
          font-size: 18px;
          font-weight: bold;
        }
        .game-board {
          position: relative;
          width: 100%;
          height: 300px;
          background: #0a0a0a;
          border: 2px solid #333;
          border-radius: 12px;
          overflow: hidden;
          cursor: crosshair;
        }
        .target {
          position: absolute;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          cursor: pointer;
          user-select: none;
          transition: transform 0.1s;
        }
        .target:hover {
          transform: scale(1.2);
        }
        .reset-btn {
          background: #444;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }
        .reset-btn:hover {
          background: #555;
        }
        .game-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        .final-score {
          color: white;
          font-size: 28px;
          margin: 0;
        }
        .rating {
          color: #FFD700;
          font-size: 24px;
          margin: 0;
        }

        .leaderboard-section {
          margin-top: 30px;
          width: 100%;
        }
        .toggle-leaderboard {
          background: transparent;
          border: 1px solid #444;
          color: #aaa;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .toggle-leaderboard:hover {
          background: #222;
          color: white;
        }
        .leaderboard {
          background: #0f0f0f;
          border-radius: 12px;
          padding: 20px;
          margin-top: 15px;
        }
        .leaderboard h3 {
          color: white;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 10px;
          border-bottom: 1px solid #333;
          color: #aaa;
          text-align: center;
        }
        th {
          color: white;
        }
        tr:last-child td {
          border-bottom: none;
        }
      `}</style>
    </Layout>
  );
}
