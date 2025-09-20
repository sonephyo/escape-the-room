// config/personas.ts
export type Persona = {
  faceUrl: string;     // an image in /public/personas/... or a face asset ID (depending on Akool demo)
  voiceId: string;     // Akool voice ID (or name) from your account
};

type PersonaMap = Record<string, Persona>;

// Normalize keys: lowercase character name
export const PERSONAS: PersonaMap = {
  'aristotle': {
    faceUrl: '/personas/aristotle.png',
    voiceId: 'voice_aristotle_01'
  },
  'john maynard keynes': {
    faceUrl: '/personas/keynes.png',
    voiceId: 'voice_keynes_01'
  },
  'ludwig van beethoven': {
    faceUrl: '/personas/beethoven.png',
    voiceId: 'voice_beethoven_01'
  },
  'gottfried wilhelm leibniz': {
    faceUrl: '/personas/leibniz.png',
    voiceId: 'voice_leibniz_01'
  },
  'plato': {
    faceUrl: '/personas/plato.png',
    voiceId: 'voice_plato_01'
  },
  'galileo galilei': {
    faceUrl: '/personas/galileo.png',
    voiceId: 'voice_galileo_01'
  },
  'marie curie': {
    faceUrl: '/personas/curie.png',
    voiceId: 'voice_curie_01'
  },
  'max weber': {
    faceUrl: '/personas/weber.png',
    voiceId: 'voice_weber_01'
  },
  'carl sagan': {
    faceUrl: '/personas/sagan.png',
    voiceId: 'voice_sagan_01'
  },
  'herodotus': {
    faceUrl: '/personas/herodotus.png',
    voiceId: 'voice_herodotus_01'
  },
};

// Fallback if you don’t have a specific face/voice yet:
export const DEFAULT_PERSONA: Persona = {
  faceUrl: '/personas/default.png',
  voiceId: 'voice_neutral_01'
};
