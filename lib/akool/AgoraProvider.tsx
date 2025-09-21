'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { RTCClient } from './rtcTypes';

type Ctx = {
  client: RTCClient | null;
  isAvatarSpeaking: boolean;
  setIsAvatarSpeaking: (b: boolean) => void;
};

const C = createContext<Ctx | null>(null);

export function AgoraProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<RTCClient | null>(null);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const clientRef = useRef<RTCClient | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { default: AgoraRTC } = await import('agora-rtc-sdk-ng'); // dynamic import (no SSR window)
      const c = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' }) as unknown as RTCClient;
      if (!mounted) return;
      clientRef.current = c;
      setClient(c);
    })();

    return () => {
      mounted = false;
      const c = clientRef.current;
      try {
        c?.removeAllListeners?.();
        c?.leave?.();
      } catch {}
      clientRef.current = null;
      setClient(null);
    };
  }, []);

  return (
    <C.Provider value={{ client, isAvatarSpeaking, setIsAvatarSpeaking }}>
      {children}
    </C.Provider>
  );
}

export const useAgora = () => {
  const v = useContext(C);
  if (!v) throw new Error('useAgora must be used inside <AgoraProvider>');
  return v;
};
