'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Character } from './Character';
import { Building } from './Building';
import { Tree } from './Tree';
import { Path } from './Path';
import { useKeyboard } from '../hooks/useKeyboard';
import { checkCollision, isWithinBounds } from '../utils/collision';
import { CORNELL_BUILDINGS, TREES, PATHS, MAP_BOUNDS } from '../data/cornellMap';
import { Character as CharacterType, Position } from '../types';
import type { ServerCharacter } from '../types/server';

type CornellMapProps = {
  n: number;
  characters: ServerCharacter[];
};

const MOVE_SPEED = 5;
const CHARACTER_SIZE = 24;

const VIEWPORT_WIDTH = MAP_BOUNDS.width - 300;
const VIEWPORT_HEIGHT = MAP_BOUNDS.height - 200;

function buildingCenters(): Position[] {
  return CORNELL_BUILDINGS.map(b => ({
    x: b.position.x + b.width / 2,
    y: b.position.y + b.height / 2,
  }));
}

function adaptServerToCharacter(sc: ServerCharacter, fallback: Position): CharacterType {
  const pos = sc.position ?? fallback;
  return {
    position: { x: pos.x, y: pos.y },
    direction: 'down',
    isMoving: false,
  };
}

export const CornellMap: React.FC<CornellMapProps> = ({ n, characters }) => {
  const [character, setCharacter] = useState<CharacterType>({
    position: { x: 100, y: 100 },
    direction: 'right',
    isMoving: false,
  });

  const npcAgents: CharacterType[] = useMemo(() => {
    const centers = buildingCenters();
    const list = (characters && characters.length ? characters : []).slice(0, n);
    const needed = Math.max(0, n - list.length);
    const fillers: ServerCharacter[] = Array.from({ length: needed }).map((_, i) => ({
      id: `filler-${i}`,
      position: centers[(i % centers.length)],
    }));
    const merged = [...list, ...fillers];
    return merged.map((sc, i) => adaptServerToCharacter(sc, centers[i % centers.length]));
  }, [characters, n]);

  const keys = useKeyboard();

  const moveCharacter = useCallback(() => {
    const newPosition: Position = { ...character.position };
    let newDirection = character.direction;
    let isMoving = false;

    if (keys['w'] || keys['arrowup']) { newPosition.y -= MOVE_SPEED; newDirection = 'up'; isMoving = true; }
    if (keys['s'] || keys['arrowdown']) { newPosition.y += MOVE_SPEED; newDirection = 'down'; isMoving = true; }
    if (keys['a'] || keys['arrowleft']) { newPosition.x -= MOVE_SPEED; newDirection = 'left'; isMoving = true; }
    if (keys['d'] || keys['arrowright']) { newPosition.x += MOVE_SPEED; newDirection = 'right'; isMoving = true; }

    if (
      isMoving &&
      isWithinBounds(newPosition, CHARACTER_SIZE, MAP_BOUNDS) &&
      !checkCollision(newPosition, CHARACTER_SIZE, CORNELL_BUILDINGS)
    ) {
      setCharacter({ position: newPosition, direction: newDirection, isMoving });
    } else if (character.isMoving !== isMoving) {
      setCharacter(prev => ({ ...prev, isMoving }));
    }
  }, [keys, character]);

  useEffect(() => {
    const gameLoop = setInterval(moveCharacter, 16);
    return () => clearInterval(gameLoop);
  }, [moveCharacter]);

  const rawCamX = character.position.x - VIEWPORT_WIDTH / 2;
  const rawCamY = character.position.y - VIEWPORT_HEIGHT / 2;
  const maxCamX = Math.max(0, MAP_BOUNDS.width - VIEWPORT_WIDTH);
  const maxCamY = Math.max(0, MAP_BOUNDS.height - VIEWPORT_HEIGHT);
  const cameraX = Math.min(Math.max(rawCamX, 0), maxCamX);
  const cameraY = Math.min(Math.max(rawCamY, 0), maxCamY);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative flex items-center justify-center">
      <div
        className="relative border-4 border-gray-600 shadow-2xl"
        style={{
          width: VIEWPORT_WIDTH,
          height: VIEWPORT_HEIGHT,
          overflow: 'hidden',
          position: 'relative',
          background: 'black',
        }}
      >
        <div
          className="absolute"
          style={{
            width: MAP_BOUNDS.width,
            height: MAP_BOUNDS.height,
            transform: `translate3d(${-cameraX}px, ${-cameraY}px, 0)`,
            transition: 'transform 0.05s linear',
            willChange: 'transform',
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
          {PATHS.map((p, i) => <Path key={i} x={p.x} y={p.y} width={p.width} height={p.height} />)}
          {TREES.map((t, i) => <Tree key={i} x={t.x} y={t.y} />)}
          {CORNELL_BUILDINGS.map(b => <Building key={b.id} building={b} />)}

          {npcAgents.map((agent, i) => (
            <Character key={`npc-${i}`} character={agent} />
          ))}

          <Character character={character} />
        </div>

        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
          <div
            className="bg-black text-white px-4 py-2 border-2 border-white"
            style={{ fontFamily: 'monospace', fontSize: '16px', imageRendering: 'pixelated', fontWeight: 'bold' }}
          >
            CORNELL UNIVERSITY
          </div>
        </div>

        <div className="absolute top-4 right-4 z-30">
          <div
            className="bg-black text-white px-3 py-1 border-2 border-white"
            style={{ fontFamily: 'monospace', fontSize: '12px', imageRendering: 'pixelated' }}
          >
            Agents: {n}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 border-2 border-white">
        <p className="text-center" style={{ fontFamily: 'monospace', fontSize: '12px', imageRendering: 'pixelated' }}>
          Use WASD or Arrow Keys to move around campus
        </p>
      </div>
    </div>
  );
};
