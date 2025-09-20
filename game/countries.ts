// /game/countries.ts
export type CountryKey = 'france' | 'spain' | 'italy' | 'japan' | 'germany';

export type HotspotDef = {
  id: string;
  label: string;       // e.g., "Café"
  xPct: number;        // 0..1
  yPct: number;        // 0..1
  radiusPct?: number;  // default ~3.5% of min(width,height)
};

export type CountryConfig = {
  key: CountryKey;
  name: string;
  locale: string;      // e.g., "fr-FR"
  bg: string;          // /countries/france.jpg
  hotspots: HotspotDef[];
};

export const COUNTRIES: Record<CountryKey, CountryConfig> = {
  france: {
    key: 'france',
    name: 'France',
    locale: 'fr-FR',
    bg: '/countries/france.jpg',
    hotspots: [
      { id: 'cafe',    label: 'Café',        xPct: 0.30, yPct: 0.72 },
      { id: 'metro',   label: 'Métro',       xPct: 0.55, yPct: 0.80 },
      { id: 'museum',  label: 'Musée',       xPct: 0.78, yPct: 0.36 },
      { id: 'bakery',  label: 'Boulangerie', xPct: 0.16, yPct: 0.56 },
    ],
  },
  spain: {
    key: 'spain',
    name: 'Spain',
    locale: 'es-ES',
    bg: '/countries/spain.jpg',
    hotspots: [
      { id: 'tapas',   label: 'Tapas Bar', xPct: 0.24, yPct: 0.72 },
      { id: 'plaza',   label: 'Plaza',     xPct: 0.62, yPct: 0.58 },
      { id: 'mercado', label: 'Mercado',   xPct: 0.80, yPct: 0.42 },
    ],
  },
  italy: {
    key: 'italy',
    name: 'Italy',
    locale: 'it-IT',
    bg: '/countries/italy.jpg',
    hotspots: [
      { id: 'gelato', label: 'Gelato', xPct: 0.18, yPct: 0.70 },
      { id: 'piazza', label: 'Piazza', xPct: 0.50, yPct: 0.55 },
      { id: 'duomo',  label: 'Duomo',  xPct: 0.80, yPct: 0.30 },
    ],
  },
  japan: {
    key: 'japan',
    name: 'Japan',
    locale: 'ja-JP',
    bg: '/countries/japan.jpg',
    hotspots: [
      { id: 'sushi',   label: '寿司屋', xPct: 0.22, yPct: 0.66 },
      { id: 'shrine',  label: '神社',   xPct: 0.65, yPct: 0.40 },
      { id: 'karaoke', label: 'カラオケ', xPct: 0.78, yPct: 0.75 },
    ],
  },
  germany: {
    key: 'germany',
    name: 'Germany',
    locale: 'de-DE',
    bg: '/countries/germany.jpg',
    hotspots: [
      { id: 'bakery',    label: 'Bäckerei',   xPct: 0.30, yPct: 0.62 },
      { id: 'biergarten',label: 'Biergarten', xPct: 0.58, yPct: 0.78 },
      { id: 'museum',    label: 'Museum',     xPct: 0.82, yPct: 0.36 },
    ],
  },
};

export function scaleHotspots(cfg: CountryConfig, w: number, h: number) {
  const base = Math.min(w, h);
  return cfg.hotspots.map(hs => ({
    id: hs.id,
    label: hs.label,
    x: Math.round(hs.xPct * w),
    y: Math.round(hs.yPct * h),
    radius: Math.round((hs.radiusPct ?? 0.035) * base),
  }));
}
