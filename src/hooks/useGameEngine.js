import { useState, useEffect, useRef, useCallback } from 'react';

const initializeEmptyGrid = (rows, cols) => {
  return Array.from({ length: rows }, () => 
    Array.from({ length: cols }, () => ({ type: 'empty' }))
  );
};

export const useGameEngine = (initialRows, initialCols) => {
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  const [pattern, setPattern] = useState(1);
  const [status, setStatus] = useState('idle'); // idle, playing, over, victory
  
  const [lives, setLives] = useState(5);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);

  const [grid, setGrid] = useState(() => initializeEmptyGrid(initialRows, initialCols));
  
  // Game state refs for interval logic to avoid dependencies
  const gameState = useRef({
    rows,
    cols,
    pattern,
    status,
    movingReds: [], // {id, r, c, pathIndex?}
    staticBlues: [], // {r, c, collected}
    lives: 5,
    timeLeft: 30,
    score: 0,
    maxScore: 0,
    tickCount: 0,
    grid: null, // used for fast collision check
  });

  // Sync refs when state changes from user input (before start)
  useEffect(() => {
    if (status === 'idle') {
      gameState.current.rows = rows;
      gameState.current.cols = cols;
      gameState.current.pattern = pattern;
      const initialGrid = initializeEmptyGrid(rows, cols);
      gameState.current.grid = initialGrid;
      setGrid(initialGrid);
    }
  }, [rows, cols, pattern, status]);

  const generatePattern1 = () => {
    const { rows, cols } = gameState.current;
    
    let blues = [];
    let movingReds = []; // Generated mathematically on render for pattern 1

    // Place Blue tiles statically following a lattice structure interspersed with red path
    for (let r = 0; r < rows - 1; r++) {
      let m = ((r % cols) + cols) % cols;
      let c1 = m < cols / 2 ? Math.floor(m) : cols - 1 - Math.floor(m);
      let c2 = cols - 1 - c1;
      
      if (m === 1 || m === cols - 2) {
        if (c1 + 1 < cols) blues.push({ r, c: c1 + 1, collected: false });
        if (c2 - 1 >= 0 && c1 + 1 !== c2 - 1) blues.push({ r, c: c2 - 1, collected: false });
      } else if (m === 2 || m === cols - 3) {
        if (c1 + 2 < cols) blues.push({ r, c: c1 + 2, collected: false });
        if (c2 - 2 >= 0 && c1 + 2 !== c2 - 2) blues.push({ r, c: c2 - 2, collected: false });
      } else if (m === Math.floor(cols / 2) || m === Math.floor(cols / 2) - 1) {
        if (c1 - 2 >= 0) blues.push({ r, c: c1 - 2, collected: false });
        if (c2 + 2 < cols && c2 + 2 !== c1 - 2) blues.push({ r, c: c2 + 2, collected: false });
      }
    }

    return { movingReds, blues };
  };

  const generatePattern2 = () => {
    const { rows, cols } = gameState.current;
    let blues = [];
    let movingReds = [];
    let redId = 0;

    // Pattern 2: Clockwise movement. A rectangular path around the perimeter.
    const path = [];
    
    // Top (Left to Right)
    for (let c = 1; c <= cols - 2; c++) path.push({ r: 0, c });
    // Right (Top to Bottom)
    for (let r = 1; r <= rows - 1; r++) path.push({ r, c: cols - 2 });
    // Bottom (Right to Left)
    for (let c = cols - 3; c >= 1; c--) path.push({ r: rows - 1, c }); 
    // Left (Bottom to Top)
    for (let r = rows - 2; r >= 1; r--) path.push({ r, c: 1 });

    // Populate moving reds as continuous "trains" on the 4 sides of the path
    const trainLength = Math.min(5, Math.max(1, Math.floor(path.length / 8)));
    const stops = [0, Math.floor(path.length * 0.25), Math.floor(path.length * 0.5), Math.floor(path.length * 0.75)];
    
    stops.forEach(startIndex => {
      for (let i = 0; i < trainLength; i++) {
        movingReds.push({ 
          id: redId++, 
          path, 
          // offset backward so the front of train is at startIndex
          pathIndex: (startIndex - i + path.length) % path.length 
        });
      }
    });

    const centerR = Math.floor(rows / 2);
    
    // Define Blue tiles statically
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Top row all blue points
        if (r === 0) {
          blues.push({ r, c, collected: false });
        // Vertical blue dot lines
        } else if (c === 2 || c === cols - 3) {
          if (r >= 1 && r <= rows - 3) {
             // Leave center empty so it doesn't overlap the green/red box
             if (r < centerR - 2 || r > centerR + 1) {
               blues.push({ r, c, collected: false });
             }
          }
        // Bottom row scattered blue points
        } else if (r === rows - 1) {
          if (c < 3 || c > cols - 4) {
             blues.push({ r, c, collected: false });
          }
        }
      }
    }

    return { movingReds, blues };
  };

  const startGame = useCallback((startPattern = pattern) => {
    const { rows, cols } = gameState.current;
    setStatus('playing');
    setPattern(startPattern);
    
    const { movingReds, blues } = startPattern === 1 ? generatePattern1() : generatePattern2();
    
    gameState.current = {
      ...gameState.current,
      pattern: startPattern,
      status: 'playing',
      lives: 5,
      timeLeft: 30,
      score: 0,
      maxScore: blues.length,
      movingReds,
      staticBlues: blues,
      tickCount: 0
    };

    setLives(5);
    setTimeLeft(30);
    setScore(0);
    setMaxScore(blues.length);
    renderGridFromState();
  }, [pattern]);

  const resetGame = () => {
    setStatus('idle');
  };

  const handleLoss = () => {
    gameState.current.status = 'over';
    setStatus('over');
  };

  const handleWin = () => {
    if (gameState.current.pattern === 1) {
      // Transition to Pattern 2
      startGame(2);
    } else {
      // Complete game victory
      gameState.current.status = 'victory';
      setStatus('victory');
    }
  };

  const loseLife = (r, c) => {
    if (gameState.current.status !== 'playing') return;
    
    gameState.current.lives -= 1;
    setLives(gameState.current.lives);
    
    // Trigger visual red flash on grid for a short time
    setGrid(prev => {
      const g = [...prev.map(row => [...row])];
      if (g[r] && g[r][c]) {
        g[r][c] = { ...g[r][c], blink: true };
      }
      return g;
    });

    if (gameState.current.lives <= 0) {
      handleLoss();
    }
  };

  const onTileHover = (r, c) => {
    if (gameState.current.status !== 'playing') return;
    
    // Use the internally cached grid representing the exact current visual frame for collision
    if (
      gameState.current.grid &&
      gameState.current.grid[r] &&
      gameState.current.grid[r][c] &&
      gameState.current.grid[r][c].type === 'red'
    ) {
      loseLife(r, c);
    }
  };

  const onTileClick = (r, c) => {
    if (gameState.current.status !== 'playing') return;
    
    const blueIndex = gameState.current.staticBlues.findIndex(b => b.r === r && b.c === c && !b.collected);
    
    if (blueIndex !== -1) {
      gameState.current.staticBlues[blueIndex].collected = true;
      gameState.current.score += 1;
      setScore(gameState.current.score);
      renderGridFromState();

      if (gameState.current.score >= gameState.current.maxScore) {
        handleWin();
      }
    }
  };

  const renderGridFromState = () => {
    const { rows, cols, pattern, movingReds, staticBlues, tickCount } = gameState.current;
    const newGrid = initializeEmptyGrid(rows, cols);

    // Render Pattern specific static environmental elements
    if (pattern === 2) {
      // Green U-Shaped Outline Wall
      for (let r = 1; r <= rows - 2; r++) {
         newGrid[r][0] = { type: 'green' };
         newGrid[r][cols - 1] = { type: 'green' };
      }
      for (let c = 0; c < cols; c++) {
         newGrid[rows - 2][c] = { type: 'green' };
      }
      
      // Central 4x4 Hollow Green Box containing 2x2 Static Red block
      const centerR = Math.floor(rows / 2);
      const centerC = Math.floor(cols / 2);
      
      // Safety bounds to prevent crashing on extremely small grids (min is 10x10 so these are safe)
      if (centerR >= 2 && centerC >= 2) {
        newGrid[centerR - 1][centerC - 1] = { type: 'red' };
        newGrid[centerR - 1][centerC] = { type: 'red' };
        newGrid[centerR][centerC - 1] = { type: 'red' };
        newGrid[centerR][centerC] = { type: 'red' };
        
        for (let i = -2; i <= 1; i++) {
           newGrid[centerR - 2][centerC + i] = { type: 'green' }; // top
           newGrid[centerR + 1][centerC + i] = { type: 'green' }; // bottom
           newGrid[centerR + i][centerC - 2] = { type: 'green' }; // left
           newGrid[centerR + i][centerC + 1] = { type: 'green' }; // right
        }
      }
    } else {
      // Pattern 1: Green bottom row
      for (let c = 0; c < cols; c++) {
        newGrid[rows - 1][c] = { type: 'green' };
      }
    }

    // Render Blue points
    staticBlues.forEach(b => {
      // Don't render blue if it hasn't been collected yet
      if (b.collected) {
        newGrid[b.r][b.c] = { type: 'collected' };
      } else {
        newGrid[b.r][b.c] = { type: 'blue' };
      }
    });

    // Render Red Danger zones
    if (pattern === 1) {
      // Mathematically procedural falling double-helix/diamond lattice
      for (let r = 0; r < rows - 1; r++) {
        // By subtracting tickCount, the pattern effectively shifts down (y increases) over time
        let virtualR = r - tickCount;
        let m = ((virtualR % cols) + cols) % cols;
        let c1 = m < cols / 2 ? Math.floor(m) : cols - 1 - Math.floor(m);
        let c2 = cols - 1 - c1;
        
        newGrid[r][c1] = { type: 'red' };
        newGrid[r][c2] = { type: 'red' };
      }
    } else if (pattern === 2) {
      // Pattern 2 features dynamic trains moving around the perimeter
      movingReds.forEach(red => {
        const p = red.path[red.pathIndex];
        if (p && p.r >= 0 && p.r < rows && p.c >= 0 && p.c < cols) {
          newGrid[p.r][p.c] = { type: 'red' };
        }
      });
    }

    gameState.current.grid = newGrid; // Sync collision grid reference to actual render
    setGrid(newGrid);
  };

  // Main Game Loop for Movement
  useEffect(() => {
    let loop;
    if (status === 'playing') {
      const currentSpeed = pattern === 1 ? 550 : 300;
      loop = setInterval(() => {
        const s = gameState.current;
        if (s.status !== 'playing') return;
        
        s.tickCount += 1;

        if (s.pattern === 2) {
          s.movingReds.forEach(red => {
            red.pathIndex = (red.pathIndex + 1) % red.path.length;
          });
        }

        renderGridFromState();
      }, currentSpeed); // 550ms for Pattern 1, 300ms for Pattern 2
    }
    return () => clearInterval(loop);
  }, [status, pattern]);

  // Game Loop for Timer
  useEffect(() => {
    let timerLoop;
    if (status === 'playing') {
      timerLoop = setInterval(() => {
        const s = gameState.current;
        if (s.status !== 'playing') return;
        
        s.timeLeft -= 1;
        setTimeLeft(s.timeLeft);
        
        if (s.timeLeft <= 0) {
          handleLoss();
        }
      }, 1000);
    }
    return () => clearInterval(timerLoop);
  }, [status]);

  return {
    rows, setRows,
    cols, setCols,
    pattern, setPattern,
    status,
    grid,
    lives,
    timeLeft,
    score,
    maxScore,
    startGame,
    resetGame,
    onTileHover,
    onTileClick
  };
};
