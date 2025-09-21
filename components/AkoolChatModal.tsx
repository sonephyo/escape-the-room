'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { ServerCharacter } from '@/types/server';
import { PERSONAS, DEFAULT_PERSONA } from '@/config/personas';
import { systemPromptForPersona } from '@/utils/akoolPrompt';

// TODO: change this import to match whatever your demo exposes
// e.g. import { StreamingAvatar } from '@/akool/StreamingAvatar';
type StreamingAvatarProps = {
  token: string;                  // session or API token (from /api/akool/session)
  faceUrl: string;                // or faceAssetId, depending on demo
  voiceId: string;
  systemPrompt: string;
  onEnd?: () => void;
};
const StreamingAvatar: React.FC<StreamingAvatarProps> = () => {
  // Placeholder; replace with demo component
  return (
    <div className="text-white">
      {/* Replace this with the actual avatar canvas/video from the demo */}
      <div className="w-[480px] h-[300px] bg-neutral-900 border-2 border-white flex items-center justify-center">
        <span style={{ fontFamily: 'monospace' }}>Streaming Avatar Placeholder</span>
      </div>
      <div className="mt-2 text-xs opacity-70" style={{ fontFamily: 'monospace' }}>
        (Hook up the demo’s StreamingAvatar here)
      </div>
    </div>
  );
};

type AkoolChatModalProps = {
  open: boolean;
  onClose: () => void;
  agent: {
    server: ServerCharacter;
    // include building if you want to show it in the header
    buildingName?: string;
  };
};

export const AkoolChatModal: React.FC<AkoolChatModalProps> = ({ open, onClose, agent }) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const name = (agent.server.name ?? 'Agent').toLowerCase();
  const persona = PERSONAS[name] ?? DEFAULT_PERSONA;

  const prompt = useMemo(() => {
    return systemPromptForPersona({
      name: agent.server.name ?? 'Agent',
      description: typeof agent.server.description === 'string' ? agent.server.description : undefined,
      building: agent.buildingName,
      puzzle: typeof agent.server.puzzle === 'string' ? agent.server.puzzle : undefined,
      solution: typeof agent.server.solution === 'string' ? agent.server.solution : undefined, // optional
    });
  }, [agent]);

  useEffect(() => {
    if (!open) return;

    // Create a fresh Akool session per opening
    (async () => {
      setErr(null);
      setSessionToken(null);
      try {
        const res = await fetch('/api/akool/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            persona: { faceUrl: persona.faceUrl, voiceId: persona.voiceId },
            systemPrompt: prompt,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        setSessionToken(data.sessionToken);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to start Akool session.';
        setErr(msg);
      }
    })();

    // Optional: teardown on close handled by avatar component’s cleanup
  }, [open, persona.faceUrl, persona.voiceId, prompt]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-black text-white border-2 border-white p-4 w-[560px]">
        <div className="mb-3 font-bold" style={{ fontFamily: 'monospace', fontSize: 16 }}>
          {agent.buildingName ? `${agent.buildingName} — ` : ''}{agent.server.name ?? 'Agent'}
        </div>

        {err && (
          <div className="mb-3 text-red-400" style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {err}
          </div>
        )}

        {!err && !sessionToken && (
          <div className="mb-3 opacity-80" style={{ fontFamily: 'monospace', fontSize: 12 }}>
            Starting voice chat…
          </div>
        )}

        {sessionToken && (
          <StreamingAvatar
            token={sessionToken}
            faceUrl={persona.faceUrl}
            voiceId={persona.voiceId}
            systemPrompt={prompt}
            onEnd={onClose}
          />
        )}

        <div className="mt-4 flex justify-end">
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
