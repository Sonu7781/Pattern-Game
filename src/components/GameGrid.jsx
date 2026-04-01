import React from 'react';

export default function GameGrid({ rows, cols, tiles, onTileClick, onTileHover }) {
  // `tiles` is a 2D array or an object map mapping string "r,c" to tile data.
  // We'll use a 2D array approach here for simplicity: grid[r][c] = { type, id, blinked }
  
  return (
    <div 
      className="game-grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`
      }}
    >
      {tiles.map((row, r) => 
        row.map((tile, c) => {
          
          let tileClass = 'tile-empty';
          if (tile.type === 'red') tileClass = 'tile-red';
          if (tile.type === 'blue') tileClass = 'tile-blue';
          if (tile.type === 'green') tileClass = 'tile-green';
          if (tile.type === 'collected') tileClass = 'tile-collected';

          // Danger blink
          if (tile.blink) tileClass += ' danger-blink';

          return (
            <div
              key={`${r}-${c}`}
              className={`tile ${tileClass}`}
              onClick={() => onTileClick(r, c)}
              onMouseEnter={() => onTileHover(r, c)}
            />
          );
        })
      )}
    </div>
  );
}
