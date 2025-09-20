// Shared types for the /getchar payload

export type XY = { x: number; y: number };

export interface ServerCharacter {
  id: string;
  name?: string;
  // If the backend includes positions, we’ll use them; otherwise we fall back in the map
  position?: XY;
  color?: string;
  speed?: number;
  // allow extra fields without using `any`
  [key: string]: unknown;
}

// The backend might return an array directly or wrap it in { characters: [...] }
export type CharactersResponse = { characters: ServerCharacter[] } | ServerCharacter[];

export function toCharactersArray(resp: unknown): ServerCharacter[] {
  if (Array.isArray(resp)) {
    return resp.filter((c): c is ServerCharacter => typeof c === 'object' && c !== null && 'id' in (c as any));
  }
  if (resp && typeof resp === 'object' && 'characters' in resp) {
    const arr = (resp as { characters?: unknown }).characters;
    if (Array.isArray(arr)) {
      return arr.filter((c): c is ServerCharacter => typeof c === 'object' && c !== null && 'id' in (c as any));
    }
  }
  return [];
}

export function errorFromPayload(resp: unknown): string | null {
  if (resp && typeof resp === 'object' && 'error' in resp) {
    const e = (resp as { error?: unknown }).error;
    return typeof e === 'string' ? e : null;
  }
  return null;
}
