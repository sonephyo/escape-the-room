// /components/CountrySelect.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { COUNTRIES, type CountryKey } from '@/game/countries';

const ORDER: CountryKey[] = ['france', 'spain', 'italy', 'japan', 'germany'];

export function CountrySelect({ onChoose }: { onChoose: (key: CountryKey) => void }) {
  const [idx, setIdx] = useState(0);
  const current = useMemo(() => ORDER[idx], [idx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % ORDER.length);
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + ORDER.length) % ORDER.length);
      if (e.key === 'Enter') onChoose(current);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, onChoose]);

  return (
    <div className="w-full max-w-6xl p-6 text-white">
      <h1 className="text-3xl font-bold mb-2">Choose your destination</h1>
      <p className="text-sm opacity-80 mb-6">Use ← / → then Enter, or click a card.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {ORDER.map((key, i) => {
          const cfg = COUNTRIES[key];
          const active = i === idx;
          return (
            <button
              key={key}
              onClick={() => onChoose(key)}
              className={`relative rounded-2xl overflow-hidden ring-2 transition-all
                ${active ? 'ring-emerald-400 scale-[1.02]' : 'ring-transparent hover:ring-emerald-600'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cfg.bg} alt={cfg.name} className="w-full aspect-[4/5] object-cover opacity-90" />
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-left">
                <div className="text-lg font-semibold">{cfg.name}</div>
                <div className="text-xs opacity-80">Language: {cfg.locale}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => onChoose(current)}
          className="px-4 py-2 rounded-xl bg-white text-black font-semibold hover:opacity-90"
        >
          Continue
        </button>
        <span className="text-sm opacity-80">Selected: {COUNTRIES[current].name}</span>
      </div>
    </div>
  );
}
