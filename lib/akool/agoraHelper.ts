// lib/akool/agoraHelper.ts
import type { RTCClient } from './rtcTypes';

export function isClientReady(client: RTCClient | null | undefined): client is RTCClient {
  return !!client && client.connectionState === 'CONNECTED' && client.uid !== undefined;
}

export interface Metadata {
  vid?: string;
  vurl?: string;
  lang?: string;
  mode?: number;
  bgurl?: string;
  vparams?: Record<string, unknown>;
}

type CommandPayload = {
  cmd: 'set-params' | 'interrupt';
  data?: Record<string, unknown>;
  code?: number;
  msg?: string;
};

type ChatPayload = { text: string };

export type StreamMessage = {
  v: number;
  type: 'command' | 'chat';
  mid: string;
  idx?: number;
  fin?: boolean;
  pld: CommandPayload | ChatPayload;
};

export async function setAvatarParams(
  client: RTCClient,
  meta: Metadata,
  onCommandSend?: (cmd: string, data?: Record<string, unknown>) => void,
) {
  if (!isClientReady(client)) return;
  const cleaned = Object.fromEntries(Object.entries(meta).filter(([_, v]) => !!v));
  const message: StreamMessage = {
    v: 2,
    type: 'command',
    mid: `msg-${Date.now()}`,
    pld: { cmd: 'set-params', data: cleaned },
  };
  onCommandSend?.('set-params', cleaned);
  return client.sendStreamMessage(JSON.stringify(message), false);
}

export async function sendMessageToAvatar(client: RTCClient, messageId: string, content: string) {
  if (!isClientReady(client)) throw new Error('Client not connected to channel');

  const MAX_ENCODED_SIZE = 950;
  const BYTES_PER_SECOND = 6000;

  const encode = (text: string, idx: number, fin: boolean): Uint8Array => {
    const msg: StreamMessage = {
      v: 2,
      type: 'chat',
      mid: messageId,
      idx,
      fin,
      pld: { text },
    };
    return new TextEncoder().encode(JSON.stringify(msg));
  };

  const base = encode('', 0, false);
  const maxLen = Math.floor((MAX_ENCODED_SIZE - base.length) / 4);

  const chunks: string[] = [];
  let remain = content;
  while (remain.length > 0) {
    let chunk = remain.slice(0, maxLen);
    let enc = encode(chunk, chunks.length, false);
    while (enc.length > MAX_ENCODED_SIZE && chunk.length > 1) {
      chunk = chunk.slice(0, Math.ceil(chunk.length / 2));
      enc = encode(chunk, chunks.length, false);
    }
    if (enc.length > MAX_ENCODED_SIZE) throw new Error('Message too large');
    chunks.push(chunk);
    remain = remain.slice(chunk.length);
  }

  for (let i = 0; i < chunks.length; i++) {
    const isLast = i === chunks.length - 1;
    const buf = encode(chunks[i], i, isLast);
    const minDelay = Math.ceil((1000 * buf.length) / BYTES_PER_SECOND);
    const t0 = Date.now();
    await client.sendStreamMessage(buf, false);
    if (!isLast) {
      const elapsed = Date.now() - t0;
      const rest = Math.max(0, minDelay - elapsed);
      if (rest > 0) await new Promise(r => setTimeout(r, rest));
    }
  }
}
