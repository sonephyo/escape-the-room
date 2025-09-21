// Shared types for the /getchar (or get_n_random_chars) payload

export type XY = { x: number; y: number };

export interface ServerCharacter {
  id: string;               // always present after normalization
  name?: string;
  description?: string;
  puzzle?: string;
  solution?: string;
  building?: string;        // e.g. "Olin Library"
  position?: XY;
  color?: string;
  speed?: number;
  [key: string]: unknown;
}

// The API might return an array or { characters: [...] }.
// It might also use `_id` instead of `id`. Normalize all of that.
type RawChar = Record<string, unknown> & { id?: unknown; _id?: unknown };

function normalizeOne(c: RawChar, idx: number): ServerCharacter | null {
  const id =
    (typeof c.id === 'string' && c.id) ||
    (typeof c._id === 'string' && c._id) ||
    `agent-${idx}`;

  // Copy all fields over, but guarantee a string `id`
  return { ...(c as Record<string, unknown>), id } as ServerCharacter;
}

export type CharactersResponse =
  | { characters: RawChar[] }
  | RawChar[];

export function toCharactersArray(resp: unknown): ServerCharacter[] {
  // Array form
  if (Array.isArray(resp)) {
    return resp
      .map((c, i) => (c && typeof c === 'object' ? normalizeOne(c as RawChar, i) : null))
      .filter((x): x is ServerCharacter => !!x);
  }

  // Wrapped form
  if (resp && typeof resp === 'object' && 'characters' in resp) {
    const arr = (resp as { characters?: unknown }).characters;
    if (Array.isArray(arr)) {
      return arr
        .map((c, i) => (c && typeof c === 'object' ? normalizeOne(c as RawChar, i) : null))
        .filter((x): x is ServerCharacter => !!x);
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
