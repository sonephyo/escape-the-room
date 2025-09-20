import React, { useState, useEffect, useCallback } from 'react';
import { Character } from './Character';
import { Building } from './Building';
import { Tree } from './Tree';
import { Path } from './Path';
import { useKeyboard } from '../hooks/useKeyboard';
import { checkCollision, isWithinBounds } from '../utils/collision';
import { CORNELL_BUILDINGS, TREES, PATHS, MAP_BOUNDS } from '../data/cornellMap';
import { Character as CharacterType, Position } from '../types';

const MOVE_SPEED = 2;
const CHARACTER_SIZE = 24;

export const CornellMap: React.FC = () => {
  const [character, setCharacter] = useState<CharacterType>({
    position: { x: 100, y: 100 },
    direction: 'right',
    isMoving: false
  });

  const keys = useKeyboard();

  const moveCharacter = useCallback(() => {
    const newPosition: Position = { ...character.position };
    let newDirection = character.direction;
    let isMoving = false;

    // Check movement keys
    if (keys['w'] || keys['arrowup']) {
      newPosition.y -= MOVE_SPEED;
      newDirection = 'up';
      isMoving = true;
    }
    if (keys['s'] || keys['arrowdown']) {
      newPosition.y += MOVE_SPEED;
      newDirection = 'down';
      isMoving = true;
    }
    if (keys['a'] || keys['arrowleft']) {
      newPosition.x -= MOVE_SPEED;
      newDirection = 'left';
      isMoving = true;
    }
    if (keys['d'] || keys['arrowright']) {
      newPosition.x += MOVE_SPEED;
      newDirection = 'right';
      isMoving = true;
    }

    // Check bounds and collisions
    if (
      isMoving &&
      isWithinBounds(newPosition, CHARACTER_SIZE, MAP_BOUNDS) &&
      !checkCollision(newPosition, CHARACTER_SIZE, CORNELL_BUILDINGS)
    ) {
      setCharacter({
        position: newPosition,
        direction: newDirection,
        isMoving
      });
    } else if (character.isMoving !== isMoving) {
      setCharacter(prev => ({ ...prev, isMoving }));
    }
  }, [keys, character]);

  useEffect(() => {
    const gameLoop = setInterval(moveCharacter, 16); // 60 FPS
    return () => clearInterval(gameLoop);
  }, [moveCharacter]);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative flex items-center justify-center">
      {/* Game container */}
      <div 
        className="relative border-4 border-gray-600 shadow-2xl"
        style={{ 
          width: MAP_BOUNDS.width, 
          height: MAP_BOUNDS.height,
          background: `repeating-conic-gradient(
            from 0deg at 50% 50%,
            #90EE90 0deg 90deg,
            #98FB98 90deg 180deg,
            #90EE90 180deg 270deg,
            #98FB98 270deg 360deg
          )`,
          backgroundSize: '32px 32px',
          imageRendering: 'pixelated',
        }}
      >
        {/* Paths */}
        {PATHS.map((path, index) => (
          <Path 
            key={index} 
            x={path.x} 
            y={path.y} 
            width={path.width} 
            height={path.height} 
          />
        ))}

        {/* Trees */}
        {TREES.map((tree, index) => (
          <Tree key={index} x={tree.x} y={tree.y} />
        ))}

        {/* Buildings */}
        {CORNELL_BUILDINGS.map(building => (
          <Building key={building.id} building={building} />
        ))}

        {/* Character */}
        <Character character={character} />

        {/* Cornell University Title */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
          <div 
            className="bg-black text-white px-4 py-2 border-2 border-white"
            style={{ 
              fontFamily: 'monospace', 
              fontSize: '16px',
              imageRendering: 'pixelated',
              fontWeight: 'bold'
            }}
          >
            CORNELL UNIVERSITY
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 border-2 border-white">
        <p 
          className="text-center"
          style={{ 
            fontFamily: 'monospace', 
            fontSize: '12px',
            imageRendering: 'pixelated'
          }}
        >
          Use WASD or Arrow Keys to move around campus
        </p>
      </div>

      {/* Mini-map placeholder (top right) */}
      <div 
        className="absolute top-4 right-4 bg-gray-800 border-2 border-white"
        style={{ width: '120px', height: '80px' }}
      >
        <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 opacity-50"></div>
        <div 
          className="absolute top-1 left-1 text-white text-xs"
          style={{ fontFamily: 'monospace' }}
        >
          MAP
        </div>
      </div>
    </div>
  );
};