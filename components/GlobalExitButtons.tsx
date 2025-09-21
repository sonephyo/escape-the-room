// /components/GlobalExitButtons.tsx
'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function GlobalExitButtons() {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/?view=play', { scroll: false });
  };

  const goHomePlay = () => router.push('/?view=play', { scroll: false });

  return (
    <div className="fixed top-3 right-3 z-[9999] flex gap-2">
     
      <button
        onClick={goHomePlay}
        className="rounded-full px-3 py-1.5 text-sm font-bold bg-red-600/90 text-white hover:bg-red-600 shadow"
        aria-label="Close and return to main play"
      >
        × Close
      </button>
    </div>
  );
}
