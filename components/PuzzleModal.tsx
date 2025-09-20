'use client';

import React, { useState } from 'react';

type PuzzleModalProps = {
  open: boolean;
  onClose: () => void;
  agentName: string;
  buildingName: string;
  puzzle: string;
  onSubmit: (answer: string) => { correct: boolean; message: string };
  onChat: () => void;
};

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  open, onClose, agentName, buildingName, puzzle, onSubmit, onChat
}) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = () => {
    const res = onSubmit(answer);
    setFeedback(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-black text-white border-2 border-white p-4 w-[520px]">
        <div className="mb-3 font-bold" style={{ fontFamily: 'monospace', fontSize: 16 }}>
          {buildingName} — {agentName}
        </div>
        <div className="mb-4" style={{ fontFamily: 'monospace', fontSize: 14, lineHeight: '1.4' }}>
          {puzzle}
        </div>
        <div className="flex gap-2">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="flex-1 bg-black border-2 border-white px-2 py-1 outline-none"
            placeholder="Type your answer…"
            style={{ fontFamily: 'monospace' }}
          />
          <button
            onClick={handleSubmit}
            className="border-2 border-white px-3 py-1 hover:bg-white hover:text-black transition-all"
            style={{ fontFamily: 'monospace' }}
          >
            Submit
          </button>
        </div>

        {feedback && (
          <div className="mt-3" style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {feedback}
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={onChat}
            className="border-2 border-white px-3 py-1 hover:bg-white hover:text-black transition-all"
            style={{ fontFamily: 'monospace' }}
          >
            Chat with agent
          </button>
          <button
            onClick={onClose}
            className="border-2 border-white px-3 py-1 hover:bg-white hover:text-black transition-all"
            style={{ fontFamily: 'monospace' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
