// 'use client';

// import { useState } from 'react';
// import { StartScreen } from '../components/StartScreen';
// import { CornellMap } from '../components/CornellMap';
// import type { ServerCharacter } from '../types/server';

// type GameState = 'home' | 'playing';

// export default function Page() {
//   const [state, setState] = useState<GameState>('home');
//   const [n, setN] = useState<number>(1);
//   const [characters, setCharacters] = useState<ServerCharacter[]>([]);

//   const handleStart = (chosenN: number, chars: ServerCharacter[]) => {
//     setN(chosenN);
//     setCharacters(chars);
//     setState('playing');
//   };

//   return state === 'home' ? (
//     <StartScreen onStart={handleStart} />
//   ) : (
//     <CornellMap n={n} characters={characters} />
//   );
// }

'use client';

import { useState } from 'react';
import { StartScreen } from '@/components/StartScreen';
import {CountryScene} from '@/components/CountryScene';
import type { CountryKey } from '@/game/countries';

type Screen = 'home' | 'world';

export default function Page() {
  const [screen, setScreen] = useState<Screen>('home');
  const [worldCountry, setWorldCountry] = useState<CountryKey | null>(null);

  const handleSelectCountry = (country: CountryKey) => {
    setWorldCountry(country);
    setScreen('world');
  };

  if (screen === 'home') {
    return <StartScreen onSelect={handleSelectCountry} />;
  }

  // world screen
  return worldCountry ? <CountryScene country={worldCountry} /> : null;
}
