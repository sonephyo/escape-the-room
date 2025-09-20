// Shared types for the /getchar payload

export type XY = { x: number; y: number };

export interface ServerCharacter {
  id: string;
  name?: string;
  description?: string;
  puzzle?: string;
  solution?: string;          // expected answer from backend
  building?: string;          // e.g. "Goldwin Smith Hall" or "goldwin-smith"
  position?: XY;              // backend optional override
  color?: string;
  speed?: number;
  [key: string]: unknown;     // allow extra fields without `any`
}

// The backend might return an array directly or wrap it in { characters: [...] }
export type CharactersResponse = { characters: ServerCharacter[] } | ServerCharacter[];

export function toCharactersArray(resp: unknown): ServerCharacter[] {
  if (Array.isArray(resp)) {
    return resp.filter(
      (c): c is ServerCharacter => typeof c === 'object' && c !== null && 'id' in (c as Record<string, unknown>)
    );
  }
  if (resp && typeof resp === 'object' && 'characters' in resp) {
    const arr = (resp as { characters?: unknown }).characters;
    if (Array.isArray(arr)) {
      return arr.filter(
        (c): c is ServerCharacter => typeof c === 'object' && c !== null && 'id' in (c as Record<string, unknown>)
      );
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
