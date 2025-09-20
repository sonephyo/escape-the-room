/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/akool/rtcTypes.ts
// Minimal client shape we actually use. Make fields optional to avoid over-typing.
export interface RTCClient {
  connectionState?: string;
  uid?: number | string;

  // Events & lifecycle
  on: (...args: any[]) => void;
  removeAllListeners?: () => void;
  join: (appId: string, channel: string, token: string, uid?: number | string) => Promise<void>;
  leave: () => Promise<void>;

  // Media
  subscribe: (user: any, mediaType: 'video' | 'audio') => Promise<any>;
  publish: (track: any) => Promise<void>;
  unpublish: (track: any) => Promise<void>;

  // Data channel
  sendStreamMessage: (msg: Uint8Array | string, reliable?: boolean) => Promise<void>;

  // Useful bags Agora sticks on the client; keep them loose
  localTracks?: any[];
  remoteUsers?: any[];
  localDataChannels?: any[];

  [key: string]: any;
}
