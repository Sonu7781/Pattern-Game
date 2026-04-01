import React from 'react';

export default function Controls({
  rows,
  setRows,
  cols,
  setCols,
  pattern,
  setPattern,
  status,
  startGame,
  resetGame
}) {
  const isPlaying = status === 'playing';

  return (
    <aside className="controls-sidebar glass-panel">
      <h2 className="panel-title">Game Settings</h2>

      <div className="input-group">
        <label htmlFor="rows">Rows (Min 10)</label>
        <input
          id="rows"
          type="number"
          min="10"
          value={rows}
          onChange={(e) => setRows(Math.max(10, parseInt(e.target.value) || 10))}
          disabled={isPlaying}
          className="styled-input"
        />
      </div>

      <div className="input-group">
        <label htmlFor="cols">Columns (Min 10)</label>
        <input
          id="cols"
          type="number"
          min="10"
          value={cols}
          onChange={(e) => setCols(Math.max(10, parseInt(e.target.value) || 10))}
          disabled={isPlaying}
          className="styled-input"
        />
      </div>

      <div className="input-group">
        <label>Pattern Select</label>
        <div className="btn-group">
          <button
            className={`btn btn-outline ${pattern === 1 ? 'active' : ''}`}
            onClick={() => setPattern(1)}
            disabled={isPlaying}
          >
            Pattern 1
          </button>
          <button
            className={`btn btn-outline ${pattern === 2 ? 'active' : ''}`}
            onClick={() => setPattern(2)}
            disabled={isPlaying}
          >
            Pattern 2
          </button>
        </div>
      </div>

      <div className="input-group" style={{ marginTop: 'auto' }}>
        {status === 'idle' ? (
          <button className="btn btn-primary" onClick={startGame}>
            Start Game
          </button>
        ) : (
          <button className="btn btn-danger" onClick={resetGame}>
            Abort / Restart
          </button>
        )}
      </div>
    </aside>
  );
}
