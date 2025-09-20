/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/AkoolPersonaModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAgora } from '@/lib/akool/AgoraProvider';
import { setAvatarParams, sendMessageToAvatar } from '@/lib/akool/agoraHelper';
import type { RTCClient } from '@/lib/akool/rtcTypes';
import type { Persona } from '@/config/akoolPersonas';

type Props = {
  open: boolean;
  onClose: () => void;
  persona: Persona & { fallbackAvatarIds?: string[] };
  openapiHost: string;   // required in live mode
  openapiToken: string;  // required in live mode
  sessionMinutes?: number;
};

type Credentials = {
  agora_app_id: string;
  agora_channel: string;
  agora_token: string;
  agora_uid: number;
};

const MOCK = process.env.NEXT_PUBLIC_AKOOL_MODE === 'mock';

/* -----------------------------
 * Portal wrapper (prevents clipping)
 * ----------------------------- */
function PortalFrame({
  open,
  onClose,
  children,
  z = 1000,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  z?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: z }} aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-[min(92vw,900px)] max-h-[88vh] overflow-hidden rounded-2xl border border-white/20 bg-neutral-950 shadow-2xl">
        {children}
      </div>
    </div>,
    document.body
  );
}

/* -----------------------------
 * Mock helpers (no Akool credits)
 * ----------------------------- */
function useMockPersona(enabled: boolean, personaName: string) {
  const [joined, setJoined] = useState(false);
  const [connected, setConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => {
      setJoined(true);
      setConnected(true);
      setLog((L) => [...L, `[system] Connected to ${personaName} (mock)`]);
    }, 300);
    return () => {
      clearTimeout(t);
      setJoined(false);
      setConnected(false);
      setMicEnabled(false);
    };
  }, [enabled, personaName]);

  // mock speech loop for fun
  const send = (text: string) => {
    if (!text.trim()) return;
    setLog((L) => [...L, `you: ${text}`]);
    const hint = `I am ${personaName}. I’ll guide you without revealing the answer. Think step by step and look for contradictions.`;
    setTimeout(() => setLog((L) => [...L, `agent: ${hint}`]), 400);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(hint);
      u.rate = 1.0; u.pitch = 1.0; u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  return { joined, connected, micEnabled, setMicEnabled, log, send };
}

/* -----------------------------
 * Live helpers (Akool/Agora)
 * ----------------------------- */
function isJson(resp: Response) {
  return (resp.headers.get('content-type') || '').toLowerCase().includes('application/json');
}

async function createAkoolSession(
  host: string,
  token: string,
  body: Record<string, unknown>
): Promise<{ sessionId: string; creds: Credentials }> {
  const resp = await fetch(`${host}/api/open/v4/liveAvatar/session/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  if (!isJson(resp)) {
    const txt = await resp.text();
    throw new Error(`Unexpected response ${resp.status}: ${txt.slice(0, 200)}`);
  }
  const json = await resp.json();
  if (json.code !== 1000) throw new Error(json.msg || 'Akool session error');

  const data = json.data || {};
  const creds: Credentials = data.credentials || data.stream_urls || data.agora || {};
  return { sessionId: data._id ?? '', creds };
}

async function closeAkoolSession(host: string, token: string, sessionId: string) {
  try {
    if (!sessionId) return;
    await fetch(`${host}/api/open/v4/liveAvatar/session/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ session_id: sessionId }),
    });
  } catch {
    // best-effort
  }
}

/* -----------------------------
 * Component
 * ----------------------------- */
export function AkoolPersonaModal({
  open,
  onClose,
  persona,
  openapiHost,
  openapiToken,
  sessionMinutes = 10,
}: Props) {
  if (!open) return null;

  if (MOCK) {
    return (
      <PortalFrame open={open} onClose={onClose}>
        <MockPanel onClose={onClose} persona={persona} />
      </PortalFrame>
    );
  }

  const { client } = useAgora();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [connected, setConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [reloadKey, setReloadKey] = useState(0);
  const localTracksRef = useRef<any[]>([]);
  const avatarCandidates = [persona.avatarId, ...(persona.fallbackAvatarIds ?? [])].filter(Boolean) as string[];

  useEffect(() => {
    if (!open || !client) return;
    let cancelled = false;

    const start = async () => {
      setJoining(true);
      setError(null);

      try {
        const validCandidate = avatarCandidates.find(id => typeof id === 'string' && id.trim().length > 0);
        if (!validCandidate) throw new Error('Persona missing avatarId.');

        let lastErr: unknown = null;
        let creds: Credentials | null = null;
        let sid = '';

        for (const avtr of avatarCandidates) {
          try {
            const { sessionId, creds: c } = await createAkoolSession(openapiHost, openapiToken, {
              avatar_id: avtr,
              duration: sessionMinutes * 60,
              ...(persona.voiceId ? { voice_id: persona.voiceId } : {}),
              ...(persona.language ? { language: persona.language } : {}),
              ...(persona.modeType != null ? { mode_type: persona.modeType } : {}),
              ...(persona.backgroundUrl ? { background_url: persona.backgroundUrl } : {}),
              ...(persona.voiceParams ? { voice_params: persona.voiceParams } : {}),
            });
            sid = sessionId;
            creds = c;
            break;
          } catch (e: any) {
            lastErr = e;
            const msg = String(e?.message || '');
            if (/busy|lock_session|in use|Data directory not found/i.test(msg)) continue;
            throw e;
          }
        }

        if (!creds) {
          const msg = String((lastErr as any)?.message || 'All candidate avatars are busy/unavailable.');
          throw new Error(msg);
        }
        if (cancelled) return;

        setSessionId(sid);

        client.on('user-published', async (user: any, mediaType: 'video' | 'audio') => {
          try {
            const track = await client.subscribe(user, mediaType);
            if (mediaType === 'video') track.play('akool-remote-video', { fit: 'contain' });
            else track.play();
          } catch (e) {
            console.error('subscribe/play failed', e);
          }
        });

        client.on('connection-state-change', (_c: string, state: string) => {
          setConnected(state === 'CONNECTED');
        });

        await client.join(
          creds.agora_app_id,
          creds.agora_channel,
          creds.agora_token,
          creds.agora_uid
        );
        if (cancelled) return;

        setJoined(true);
        setConnected(true);

        await setAvatarParams(client as RTCClient, {
          vid: persona.voiceId,
          lang: persona.language ?? 'en',
          mode: persona.modeType ?? 2,
          bgurl: persona.backgroundUrl,
          vparams: persona.voiceParams,
        });

        await sendMessageToAvatar(
          client as RTCClient,
          `sys-${Date.now()}`,
          `[SYSTEM INSTRUCTIONS]\n${persona.systemPrompt}\n(Do not reveal puzzle answers. Keep replies brief.)`
        );
      } catch (e: any) {
        const msg = String(e?.message || e);
        setError(msg);
      } finally {
        if (!cancelled) setJoining(false);
      }
    };

    start();

    return () => {
      cancelled = true;

      const tracks = localTracksRef.current;
      localTracksRef.current = [];
      (async () => {
        for (const t of tracks) {
          try { await client.unpublish(t); } catch {}
          try { t.stop?.(); t.close?.(); } catch {}
        }
      })();

      try { client.removeAllListeners?.(); } catch {}
      (async () => { try { await client.leave?.(); } catch {} })();

      if (sessionId) closeAkoolSession(openapiHost, openapiToken, sessionId);

      setMicEnabled(false);
      setJoined(false);
      setConnected(false);
      setSessionId('');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client, persona, openapiHost, openapiToken, sessionMinutes, reloadKey]);

  const toggleMic = async () => {
    if (!client) return;
    try {
      if (!micEnabled) {
        if (typeof (client as any).setClientRole === 'function') {
          await (client as any).setClientRole('host');
        }
        const { default: AgoraRTC } = await import('agora-rtc-sdk-ng');
        const mic = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish(mic);
        localTracksRef.current.push(mic);
        setMicEnabled(true);
      } else {
        const audio =
          localTracksRef.current.find((t) => (t as any).trackMediaType === 'audio') ??
          localTracksRef.current[0];
        if (audio) {
          try { await client.unpublish(audio); } catch {}
          try { audio.stop?.(); audio.close?.(); } catch {}
          localTracksRef.current = localTracksRef.current.filter((t) => t !== audio);
        }
        if (typeof (client as any).setClientRole === 'function') {
          await (client as any).setClientRole('audience');
        }
        setMicEnabled(false);
      }
    } catch (e) {
      console.error('mic toggle failed', e);
    }
  };

  return (
    <PortalFrame open={open} onClose={onClose}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2 text-white font-mono">
          <div>Chatting with: <b>{persona.name}</b> ({persona.building})</div>
          <div className="flex gap-2">
            {error && (
              <button className="border border-white/30 px-2 py-1" onClick={() => setReloadKey((k) => k + 1)}>
                Retry
              </button>
            )}
            <button className="border border-white/30 px-2 py-1" onClick={onClose}>End</button>
          </div>
        </div>

        {error && <div className="mb-3 text-red-400 font-mono text-sm">{error}</div>}

        {!client ? (
          <div className="text-white font-mono">Loading voice chat…</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Video */}
            <div className="border border-white/20 rounded-xl h-[420px] overflow-hidden flex items-center justify-center">
              <div id="akool-remote-video" className="w-full h-full bg-black" />
            </div>

            {/* BIG MIC PANEL */}
            <div className="flex flex-col items-center justify-center gap-4">
              <button
                type="button"
                aria-pressed={micEnabled}
                onClick={toggleMic}
                disabled={!joined || joining}
                className={[
                  'relative w-36 h-36 rounded-full border-4 flex items-center justify-center select-none',
                  'transition-all duration-150 ease-out',
                  !joined || joining
                    ? 'opacity-60 cursor-not-allowed border-white/20 bg-neutral-800'
                    : micEnabled
                    ? 'bg-red-600/80 border-red-300 shadow-[0_0_0_8px_rgba(239,68,68,0.25)] animate-pulse'
                    : 'bg-neutral-800 border-white/20 hover:bg-neutral-700'
                ].join(' ')}
                title={micEnabled ? 'Mute mic' : (joined ? 'Enable mic' : 'Joining…')}
              >
                {/* Mic icon */}
                <svg viewBox="0 0 24 24" className="w-14 h-14 text-white" fill="currentColor" aria-hidden="true">
                  <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z"></path>
                  <path d="M19 11a1 1 0 1 1 2 0 9 9 0 0 1-8 8v3h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3a9 9 0 0 1-8-8 1 1 0 1 1 2 0 7 7 0 1 0 14 0z"></path>
                </svg>
              </button>

              <div className="text-white/80 font-mono text-sm">
                {joined
                  ? (connected
                      ? (micEnabled ? 'Listening… tap to mute' : 'Tap to talk')
                      : 'Joining…')
                  : (joining ? 'Starting…' : (error ? 'Error' : 'Idle'))}
              </div>

              <div className="text-white/50 font-mono text-xs text-center">
                Your voice is sent to the persona while the mic is on.
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalFrame>
  );
}

/* -----------------------------
 * Mock-only panel (same UI)
 * ----------------------------- */
function MockPanel({ onClose, persona }: { onClose: () => void; persona: Persona }) {
  const { joined, connected, micEnabled, setMicEnabled } = useMockPersona(true, persona.name);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2 text-white font-mono">
        <div>Chatting with: <b>{persona.name}</b> ({persona.building}) — MOCK</div>
        <button className="border border-white/30 px-2 py-1" onClick={onClose}>End</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-white/20 rounded-xl h-[420px] overflow-hidden flex items-center justify-center">
          <video
            className="w-full h-full object-contain bg-black"
            src="/mock-avatar.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <button
            type="button"
            aria-pressed={micEnabled}
            onClick={() => setMicEnabled((m) => !m)}
            className={[
              'relative w-36 h-36 rounded-full border-4 flex items-center justify-center select-none',
              'transition-all duration-150 ease-out',
              micEnabled
                ? 'bg-red-600/80 border-red-300 shadow-[0_0_0_8px_rgba(239,68,68,0.25)] animate-pulse'
                : 'bg-neutral-800 border-white/20 hover:bg-neutral-700'
            ].join(' ')}
            title={micEnabled ? 'Mute mic' : 'Enable mic'}
          >
            <svg viewBox="0 0 24 24" className="w-14 h-14 text-white" fill="currentColor" aria-hidden="true">
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z"></path>
              <path d="M19 11a1 1 0 1 1 2 0 9 9 0 0 1-8 8v3h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3a9 9 0 0 1-8-8 1 1 0 1 1 2 0 7 7 0 1 0 14 0z"></path>
            </svg>
          </button>

          <div className="text-white/80 font-mono text-sm">
            {joined ? (connected ? (micEnabled ? 'Listening… tap to mute' : 'Tap to talk') : 'Joining…') : 'Starting…'}
          </div>

          <div className="text-white/50 font-mono text-xs text-center">
            Mock mode: no network calls. Great for QA.
          </div>
        </div>
      </div>
    </div>
  );
}
