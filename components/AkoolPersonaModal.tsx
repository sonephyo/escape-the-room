/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/AkoolPersonaModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAgora } from '@/lib/akool/AgoraProvider';
import { setAvatarParams, sendMessageToAvatar } from '@/lib/akool/agoraHelper';
import type { RTCClient } from '@/lib/akool/rtcTypes';
import type { Persona } from '@/config/akoolPersonas';
import StableModal from '@/components/ui/StableModal';


type Props = {
  open: boolean;
  onClose: () => void;
  persona: Persona & { fallbackAvatarIds?: string[] };
  openapiHost: string;   // live only
  openapiToken: string;  // live only
  sessionMinutes?: number;
};

type Credentials = {
  agora_app_id: string;
  agora_channel: string;
  agora_token: string;
  agora_uid: number;
};

const MOCK = process.env.NEXT_PUBLIC_AKOOL_MODE === 'mock';

// -----------------------------
// Mock helpers (no credits)
// -----------------------------
function useMockPersona(
  enabled: boolean,
  personaName: string,
  onClose: () => void
) {
  const [joined, setJoined] = useState(false);
  const [connected, setConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled) return;
    // simulate “start session”
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

  const send = (text: string) => {
    setLog((L) => [...L, `you: ${text}`]);
    // simulate persona typing back
    const hint = `I am ${personaName}. I’ll guide you without revealing the answer. Think step by step and look for contradictions.`;
    setTimeout(() => setLog((L) => [...L, `agent: ${hint}`]), 400);
    // optional: voice via Web Speech API (still free)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(hint);
      u.rate = 1.0; u.pitch = 1.0; u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  return {
    joined, connected, micEnabled, setMicEnabled, log, send,
  };
}

// -----------------------------
// Live helpers (real Akool/Agora)
// -----------------------------
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
  if (json.code !== 1000) {
    throw new Error(json.msg || 'Akool session error');
  }
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
    // ignore
  }
}

// -----------------------------
// Component
// -----------------------------
export function AkoolPersonaModal({
  open,
  onClose,
  persona,
  openapiHost,
  openapiToken,
  sessionMinutes = 10,
}: Props) {
    <StableModal open={open} onClose={onClose} zIndex={60}>

  // MOCK PATH — never touches Akool or Agora
  if (MOCK) {
    return <AkoolPersonaModalMock open={open} onClose={onClose} persona={persona} />;
  }

  // LIVE PATH
  const { client } = useAgora();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [connected, setConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const localTracksRef = useRef<any[]>([]);
  const avatarCandidates = [persona.avatarId, ...(persona.fallbackAvatarIds ?? [])].filter(Boolean);

  useEffect(() => {
    if (!open || !client) return;

    let cancelled = false;

    const start = async () => {
      setJoining(true);
      setError(null);

      try {
        const nextId = avatarCandidates.find(id => typeof id === 'string' && id.trim().length > 0);
        if (!nextId) throw new Error('Persona missing avatarId.');


        // try primary + fallbacks if busy
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
            if (/busy|lock_session|in use|Data directory not found/i.test(msg)) {
              continue;
            }
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
            if (mediaType === 'video') {
              track.play('akool-remote-video', { fit: 'contain' });
            } else {
              track.play();
            }
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
        if (/busy|lock_session|in use/i.test(msg)) {
          alert('This avatar is currently in use. Try again shortly or configure a fallback avatar.');
        }
        onClose();
      } finally {
        if (!cancelled) setJoining(false);
      }
    };

    start();

    return () => {
      cancelled = true;

      // unpublish/stop our own local tracks
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

      if (sessionId) {
        closeAkoolSession(openapiHost, openapiToken, sessionId);
      }

      setMicEnabled(false);
      setJoined(false);
      setConnected(false);
      setSessionId('');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client, persona, openapiHost, openapiToken, sessionMinutes]);

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
        // track locally — do NOT assign to client.localTracks
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

  const [question, setQuestion] = useState('');
  const send = async () => {
    if (!client || !question.trim()) return;
    try {
      await sendMessageToAvatar(client as RTCClient, `q-${Date.now()}`, question.trim());
      setQuestion('');
    } catch (e) {
      console.error('send chat failed', e);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center">
      <div className="bg-black border border-white p-4 w-[880px]">
        <div className="flex items-center justify-between mb-2 text-white font-mono">
          <div>Chatting with: <b>{persona.name}</b> ({persona.building})</div>
          <button className="border px-2 py-1" onClick={onClose}>End</button>
        </div>

        {error && <div className="mb-3 text-red-400 font-mono text-sm">{error}</div>}

        {!client ? (
          <div className="text-white font-mono">Loading voice chat…</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/30 h-[420px] flex items-center justify-center">
              <div id="akool-remote-video" className="w-full h-full bg-black" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <button className="border px-3 py-1 text-white disabled:opacity-60" onClick={toggleMic} disabled={!joined || joining}>
                  {micEnabled ? '🎙️ Mic On (click to mute)' : '🔇 Mic Off (click to enable)'}
                </button>
                <span className="text-white/70 text-sm font-mono">
                  {joined ? (connected ? 'Connected' : 'Joining…') : 'Starting…'}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  className="flex-1 bg-black border border-white/50 text-white px-2 py-1 font-mono"
                  placeholder="Ask for a hint…"
                />
                <button className="border px-3 py-1 text-white" onClick={send}>Send</button>
              </div>

              <div className="text-white/60 text-xs font-mono">
                Tips: Speak or type. The persona will guide — not spoil — the solution.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------
// Mock-only view (no Akool calls)
// -----------------------------
function AkoolPersonaModalMock({
  open, onClose, persona,
}: { open: boolean; onClose: () => void; persona: Persona }) {
  const [question, setQuestion] = useState('');
  const { joined, connected, micEnabled, setMicEnabled, log, send } = useMockPersona(true, persona.name, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center">
      <div className="bg-black border border-white p-4 w-[880px]">
        <div className="flex items-center justify-between mb-2 text-white font-mono">
          <div>Chatting with: <b>{persona.name}</b> ({persona.building}) — MOCK</div>
          <button className="border px-2 py-1" onClick={onClose}>End</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-white/30 h-[420px] flex items-center justify-center">
            {/* Local placeholder media so layout looks the same */}
            <video
              className="w-full h-full object-contain bg-black"
              src="/mock-avatar.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <button
                className="border px-3 py-1 text-white"
                onClick={() => setMicEnabled((m) => !m)}
              >
                {micEnabled ? '🎙️ Mic On (mock)' : '🔇 Mic Off (mock)'}
              </button>
              <span className="text-white/70 text-sm font-mono">
                {joined ? (connected ? 'Connected (mock)' : 'Joining…') : 'Starting…'}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (send(question), setQuestion(''))}
                className="flex-1 bg-black border border-white/50 text-white px-2 py-1 font-mono"
                placeholder="Ask for a hint… (mock)"
              />
              <button
                className="border px-3 py-1 text-white"
                onClick={() => { send(question); setQuestion(''); }}
              >
                Send
              </button>
            </div>

            <div className="text-white/60 text-xs font-mono">
              Mock mode: no Akool/Agora usage. Good for UI flows & QA.
            </div>

            <div className="mt-2 p-2 h-40 overflow-auto bg-black/40 border border-white/10 text-white font-mono text-xs">
              {log.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
    </StableModal>
  );
}
