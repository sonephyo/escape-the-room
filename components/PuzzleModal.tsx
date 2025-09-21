'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PERSONAS } from '@/config/akoolPersonas';
import { AkoolPersonaModal } from '@/components/AkoolPersonaModal';

type SubmitResult = { correct: boolean; message: string };

type PuzzleModalProps = {
  open: boolean;
  onClose: () => void;

  // Used to reset state when switching between agents
  agentId: string;

  agentName: string;         // e.g. "Aristotle"
  buildingName: string;      // e.g. "Goldwin Smith Hall"
  puzzle: string;

  onSubmit: (answer: string) => SubmitResult;

  // Optional: if you still want parent to know chat was clicked
  onChat?: () => void;
};

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  open,
  onClose,
  agentId,
  agentName,
  buildingName,
  puzzle,
  onSubmit,
  onChat,
}) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [solvedNow, setSolvedNow] = useState(false);

  // Local Akool chat modal state
  const [personaOpen, setPersonaOpen] = useState(false);

  // Try exact match first, then case-insensitive fallback
  const persona = useMemo(() => {
    if (PERSONAS[agentName]) return PERSONAS[agentName];
    const key = Object.keys(PERSONAS).find(
      k => k.toLowerCase() === agentName.toLowerCase()
    );
    return key ? PERSONAS[key] : undefined;
  }, [agentName]);

  // Reset fields whenever modal opens or agent changes
  useEffect(() => {
    if (open) {
      setAnswer('');
      setFeedback(null);
      setSubmitting(false);
      setSolvedNow(false);
    }
  }, [open, agentId]);

  if (!open) return null;

  const handleClose = () => {
    setAnswer('');
    setFeedback(null);
    setSubmitting(false);
    setSolvedNow(false);
    setPersonaOpen(false);
    onClose();
  };

  const handleSubmit = () => {
    if (submitting || solvedNow) return;
    setSubmitting(true);
    const res = onSubmit(answer.trim());
    setFeedback(res.message);
    if (res.correct) {
      setSolvedNow(true);
      // show success briefly, then close
      setTimeout(handleClose, 1000);
    } else {
      setSubmitting(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const openPersona = () => {
    if (!persona) return;
    onChat?.(); // optional: notify parent
    setPersonaOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70" onClick={handleClose} />
        <div className="relative bg-black text-white border-2 border-white p-4 w-[560px]">
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
              onKeyDown={onKeyDown}
              className="flex-1 bg-black border-2 border-white px-2 py-1 outline-none"
              placeholder="Type your answer…"
              style={{ fontFamily: 'monospace' }}
              autoFocus
              disabled={submitting || solvedNow}
            />
            <button
              onClick={handleSubmit}
              disabled={submitting || solvedNow}
              className="border-2 border-white px-3 py-1 hover:bg-white hover:text-black transition-all disabled:opacity-60"
              style={{ fontFamily: 'monospace' }}
            >
              {solvedNow ? '✔' : submitting ? 'Checking…' : 'Submit'}
            </button>
          </div>

          {feedback && (
            <div className="mt-3" style={{ fontFamily: 'monospace', fontSize: 12 }}>
              {feedback} {solvedNow ? 'Closing…' : ''}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={openPersona}
              className="border-2 border-white px-3 py-1 hover:bg-white hover:text-black transition-all disabled:opacity-60"
              style={{ fontFamily: 'monospace' }}
              disabled={!persona}
              title={persona ? '' : 'Persona not configured for this agent'}
            >
              Chat with {agentName}
            </button>

            <button
              onClick={handleClose}
              className="border-2 border-white px-3 py-1 hover:bg-white hover:text-black transition-all"
              style={{ fontFamily: 'monospace' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Akool live persona modal */}
      {persona && (
        <AkoolPersonaModal
          open={personaOpen}
          onClose={() => setPersonaOpen(false)}
          persona={persona}
          // If you proxy via /api, remove these two and adjust the component as noted.
          openapiHost={process.env.NEXT_PUBLIC_AKOOL_HOST!}
          openapiToken={process.env.NEXT_PUBLIC_AKOOL_TOKEN!}
          sessionMinutes={10}
        />
      )}
    </>
  );
};
