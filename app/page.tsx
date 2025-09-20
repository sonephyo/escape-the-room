'use client';

import { useState } from 'react';
import { StartScreen } from '../components/StartScreen';
import { CornellMap } from '../components/CornellMap';
import type { ServerCharacter } from '../types/server';

type GameState = 'home' | 'playing';

export default function Page() {
  const [state, setState] = useState<GameState>('playing');
  const [n, setN] = useState<number>(1);
  const [characters, setCharacters] = useState<ServerCharacter[]>([]);

  const handleStart = (chosenN: number, chars: ServerCharacter[]) => {
    setN(chosenN);
    setCharacters(chars);
    setState('playing');
  };

  return state === 'home' ? (
    <StartScreen onStart={handleStart} />
  ) : (
    <CornellMap n={n} characters={characters} />
  );
}
