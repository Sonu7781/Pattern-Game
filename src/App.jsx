import React from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import GameGrid from './components/GameGrid';
import { useGameEngine } from './hooks/useGameEngine';
import './index.css';

export default function App() {
  const gameState = useGameEngine(20, 15);
  
  return (
    <div className="app-container">
      {/* Sidebar Controls */}
      <Controls 
        rows={gameState.rows} setRows={gameState.setRows}
        cols={gameState.cols} setCols={gameState.setCols}
        pattern={gameState.pattern} setPattern={gameState.setPattern}
        status={gameState.status}
        startGame={() => gameState.startGame(gameState.pattern)}
        resetGame={gameState.resetGame}
      />
      
      {/* Main Game Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header 
          lives={gameState.lives}
          timeLeft={gameState.timeLeft}
          score={gameState.score}
          maxScore={gameState.maxScore}
          pattern={gameState.pattern}
        />

        <div className="grid-area">
          <GameGrid 
            rows={gameState.rows}
            cols={gameState.cols}
            tiles={gameState.grid}
            onTileClick={gameState.onTileClick}
            onTileHover={gameState.onTileHover}
          />
        </div>
      </div>

      {/* Game Overlays */}
      {gameState.status === 'over' && (
        <div className="overlay game-over">
          {gameState.pattern === 1 && gameState.score > 6 ? (
            <>
              <h1 style={{ color: 'var(--text-primary)', textShadow: 'none' }}>Round Over</h1>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Score: <strong style={{color: 'var(--neon-blue)'}}>{gameState.score}</strong> (Enough to advance!)</p>
              <div className="btn-group" style={{ gap: '1rem' }}>
                <button className="btn btn-outline" onClick={() => gameState.startGame(1)} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                  Replay Pattern 1
                </button>
                <button className="btn btn-primary" onClick={() => gameState.startGame(2)}>
                  Start Pattern 2
                </button>
              </div>
            </>
          ) : (
            <>
              <h1>Game Over</h1>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Score: <strong style={{color: 'var(--neon-blue)'}}>{gameState.score}</strong></p>
              <div className="btn-group" style={{ gap: '1rem' }}>
                <button className="btn btn-primary" onClick={() => gameState.startGame(gameState.pattern)}>
                  Replay Pattern
                </button>
                <button className="btn btn-outline" onClick={gameState.resetGame} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                  Main Menu
                </button>
              </div>
            </>
          )}
        </div>
      )}
      
      {gameState.status === 'victory' && (
        <div className="overlay victory">
          <h1>Victory!</h1>
          <p style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Score: <strong style={{color: 'var(--neon-blue)'}}>{gameState.score}</strong></p>
          <div className="btn-group" style={{ gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => gameState.startGame(gameState.pattern)}>
              Replay Pattern
            </button>
            <button className="btn btn-outline" onClick={gameState.resetGame} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
              Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
