// 'use client';

// import React, { useState } from 'react';
// import { MAP_BOUNDS } from '../data/cornellMap';
// import type { ServerCharacter } from '../types/server';
// import { toCharactersArray, errorFromPayload } from '../types/server';

// type StartScreenProps = {
//   onStart: (n: number, characters: ServerCharacter[]) => void;
// };

// const VIEWPORT_WIDTH = MAP_BOUNDS.width - 300;
// const VIEWPORT_HEIGHT = MAP_BOUNDS.height - 200;

// export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
//   const [phase, setPhase] = useState<'intro' | 'config'>('intro');
//   const [n, setN] = useState<number>(1);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState<string | null>(null);

//   const handlePlay = () => setPhase('config');

//   const handleStart = async () => {
//     if (n < 1 || n > 10) {
//       setErr('Choose between 1 and 10 characters.');
//       return;
//     }
//     setErr(null);
//     setLoading(true);
//     try {
//       const url = new URL('/api/get_n_random_chars', window.location.origin);
// url.searchParams.set('n', String(n));


//       const res = await fetch(url.toString(), {   
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' },
//       });

//       let json: unknown = undefined;
//       try {
//         json = await res.json();
//       } catch {
//         // OK if empty
//       }

//       if (!res.ok) {
//         const msg = errorFromPayload(json) ?? `HTTP ${res.status}`;
//         throw new Error(msg);
//       }

//       const characters = toCharactersArray(json);
//       onStart(n, characters);
//     } catch (e: unknown) {
//       const message = e instanceof Error ? e.message : 'Failed to start. Check /api/getchar.';
//       setErr(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
//       <div
//         className="relative border-4 border-gray-600 shadow-2xl flex items-center justify-center"
//         style={{
//           width: VIEWPORT_WIDTH,
//           height: VIEWPORT_HEIGHT,
//           background: `repeating-conic-gradient(
//             from 0deg at 50% 50%,
//             #1a1a1a 0deg 90deg,
//             #111 90deg 180deg,
//             #1a1a1a 180deg 270deg,
//             #111 270deg 360deg
//           )`,
//           backgroundSize: '32px 32px',
//           imageRendering: 'pixelated',
//         }}
//       >
//         <div className="absolute top-6 left-1/2 -translate-x-1/2">
//           <div
//             className="bg-black/70 text-white px-4 py-2 border-2 border-white"
//             style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold' }}
//           >
//             CORNELL QUEST
//           </div>
//         </div>

//         {phase === 'intro' ? (
//           <button
//             onClick={handlePlay}
//             className="px-8 py-3 border-2 border-white text-white bg-black hover:bg-white hover:text-black transition-all"
//             style={{ fontFamily: 'monospace', fontSize: 16 }}
//           >
//             ▶ PLAY
//           </button>
//         ) : (
//           <div className="bg-black/75 border-2 border-white p-4 text-white w-[360px]">
//             <div className="mb-2" style={{ fontFamily: 'monospace', fontSize: 14 }}>
//               Choose number of characters (n)
//             </div>
//             <div className="flex items-center gap-3">
//               <input
//                 type="number"
//                 min={1}
//                 max={10}
//                 value={n}
//                 onChange={(e) => setN(Math.max(1, Math.min(10, Number(e.target.value))))}
//                 className="w-20 bg-black border-2 border-white text-white text-center py-1 outline-none"
//                 style={{ fontFamily: 'monospace' }}
//               />
//               <button
//                 onClick={handleStart}
//                 disabled={loading}
//                 className="px-4 py-2 border-2 border-white bg-black hover:bg-white hover:text-black transition-all disabled:opacity-60"
//                 style={{ fontFamily: 'monospace' }}
//               >
//                 {loading ? 'Starting…' : 'Start Game'}
//               </button>
//             </div>
//             {err && (
//               <div className="mt-3 text-red-400" style={{ fontFamily: 'monospace', fontSize: 12 }}>
//                 {err}
//               </div>
//             )}
//             <button
//               onClick={() => setPhase('intro')}
//               className="mt-4 text-gray-300 underline"
//               style={{ fontFamily: 'monospace', fontSize: 12 }}
//             >
//               ◀ Back
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


'use client';

import React, { useState } from 'react';
import { CountrySelect } from '@/components/CountrySelect';
import type { CountryKey } from '@/game/countries';

export function StartScreen({ onSelect }: { onSelect: (country: CountryKey) => void }) {
  const [phase, setPhase] = useState<'intro' | 'world'>('intro');

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      <div
        className="relative border-4 border-gray-600 shadow-2xl flex items-center justify-center"
        style={{ width: 980, height: 620, background: '#101010' }}
      >
        {phase === 'intro' && (
          <div className="text-center text-white">
            <div className="text-3xl font-bold mb-2">Escape the Room — Language Edition</div>
            <div className="opacity-80 mb-6">Pick a country, walk to places, practice with an AI native.</div>
            <button
              onClick={() => setPhase('world')}
              className="px-4 py-2 border-2 border-white bg-black text-white hover:bg-white hover:text-black"
            >
              Start
            </button>
          </div>
        )}

        {phase === 'world' && (
          <div className="w-full h-full flex items-center justify-center">
            <CountrySelect onChoose={(country) => onSelect(country)} />
          </div>
        )}
      </div>
    </div>
  );
}
