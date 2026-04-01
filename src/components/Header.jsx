import React from 'react';

export default function Header({ lives, timeLeft, score, maxScore, pattern }) {
  return (
    <header className="app-header glass-panel">
      <div className="stat-item">
        <span className="stat-label">Pattern</span>
        <span className="stat-value">{pattern}</span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">Time Left</span>
        <span className={`stat-value ${timeLeft <= 10 ? 'danger' : ''}`}>
          {timeLeft}s
        </span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">Lives</span>
        <span className={`stat-value ${lives <= 2 ? 'danger' : 'safe'}`}>
          {lives}
        </span>
      </div>

      <div className="stat-item">
        <span className="stat-label">Tiles Collected</span>
        <span className="stat-value primary">
          {score} / {maxScore}
        </span>
      </div>
    </header>
  );
}
