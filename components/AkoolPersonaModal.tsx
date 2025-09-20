/* eslint-disable @typescript-eslint/no-explicit-any */
// components/AkoolPersonaModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAgora } from '@/lib/akool/AgoraProvider';
import { setAvatarParams, sendMessageToAvatar } from '@/lib/akool/agoraHelper';
import type { RTCClient } from '@/lib/akool/rtcTypes';
import type { Persona } from '@/config/akoolPersonas';

type Props = {
  open: boolean;
  onClose: () => void;
  persona: Persona & {
    /** Optional list of backup avatar IDs (avtr_...) to try if the primary is busy */
    fallbackAvatarIds?: string[];
  };
  openapiHost: string;   // e.g. 'https://openapi.akool.com'
  openapiToken: string;  // Bearer token
  sessionMinutes?: number; // default 10
};

type Credentials = {
  agora_app_id: string;
  agora_channel: string;
  agora_token: string;
  agora_uid: number;
};

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
    // Pass through Akool error message
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
    // swallow cleanup errors
  }
}

export function AkoolPersonaModal({
  open,
  onClose,
  persona,
  openapiHost,
  openapiToken,
  sessionMinutes = 10,
}: Props) {
  const { client } = useAgora();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [connected, setConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  // Keep track of our own published local tracks (don’t touch client.localTracks!)
  const localTracksRef = useRef<any[]>([]);

  // pick primary + fallbacks
  const avatarCandidates = [
    persona.avatarId,
    ...(persona.fallbackAvatarIds ?? []),
  ].filter(Boolean);

  useEffect(() => {
    if (!open || !client) return;

    let cancelled = false;
    let joinedOnce = false;

    const start = async () => {
      setJoining(true);
      setError(null);

      try {
        // Ensure we have at least one plausible avatar id
        const nextId = avatarCandidates.find(id => id.startsWith('avtr_'));
        if (!nextId) {
          throw new Error('Persona not configured with a valid Akool avatarId (must start with "avtr_").');
        }

        // Try primary, optionally fallbacks if “busy/lock_session”
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
            break; // success
          } catch (e: any) {
            lastErr = e;
            const msg = String(e?.message || '');
            // These indicate the avatar is currently in use
            if (/busy|lock_session|in use|Data directory not found/i.test(msg)) {
              // Try next candidate
              continue;
            }
            // Other error -> bail immediately
            throw e;
          }
        }

        if (!creds) {
          // exhausted candidates
          const msg = String((lastErr as any)?.message || 'All candidate avatars are busy/unavailable.');
          throw new Error(msg);
        }

        if (cancelled) return;

        setSessionId(sid);

        // Subscribe to streams
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
        joinedOnce = true;
        setConnected(true);

        // Configure avatar params
        await setAvatarParams(client as RTCClient, {
          vid: persona.voiceId,
          lang: persona.language ?? 'en',
          mode: persona.modeType ?? 2,
          bgurl: persona.backgroundUrl,
          vparams: persona.voiceParams,
        });

        // Initial system prompt
        await sendMessageToAvatar(
          client as RTCClient,
          `sys-${Date.now()}`,
          `[SYSTEM INSTRUCTIONS]\n${persona.systemPrompt}\n(Do not reveal puzzle answers. Keep replies brief.)`
        );
      } catch (e: any) {
        const msg = String(e?.message || e);
        setError(msg);
        // Friendly notice for “busy”
        if (/busy|lock_session|in use/i.test(msg)) {
          alert('This avatar is currently in use. Try again in a minute or configure a fallback avatar.');
        }
        onClose();
      } finally {
        if (!cancelled) setJoining(false);
      }
    };

    start();

    return () => {
      cancelled = true;

      // Unpublish/stop our local tracks
      const tracks = localTracksRef.current;
      localTracksRef.current = [];
      (async () => {
        try {
          for (const t of tracks) {
            try { await client.unpublish(t); } catch {}
            try { t.stop?.(); t.close?.(); } catch {}
          }
        } catch {}
      })();

      // Leave channel and cleanup
      try { client.removeAllListeners?.(); } catch {}
      (async () => {
        try { await client.leave?.(); } catch {}
      })();

      // Close Akool session to prevent “busy” locks
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

  // Mic toggle with our own localTracksRef (don’t assign to client.localTracks!)
  const toggleMic = async () => {
    if (!client) return;
    try {
      if (!micEnabled) {
        // audience cannot publish; switch to host if available
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
          <div>
            Chatting with: <b>{persona.name}</b> ({persona.building})
          </div>
          <button className="border px-2 py-1" onClick={onClose}>End</button>
        </div>

        {error && (
          <div className="mb-3 text-red-400 font-mono text-sm">{error}</div>
        )}

        {!client ? (
          <div className="text-white font-mono">Loading voice chat…</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/30 h-[420px] flex items-center justify-center">
              <div id="akool-remote-video" className="w-full h-full bg-black" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <button
                  className="border px-3 py-1 text-white disabled:opacity-60"
                  onClick={toggleMic}
                  disabled={!joined || joining}
                >
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
