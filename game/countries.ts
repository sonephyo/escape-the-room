// /game/countries.ts
export type CountryKey = 'france' | 'spain' | 'italy' | 'usa' | 'germany' | 'nepal' | 'india';

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
    { id: 'notredame',   label: 'Notre-Dame Cathedral', xPct: 0.22, yPct: 0.13 },
    { id: 'lesinvalides',label: 'Les Invalides',        xPct: 0.50, yPct: 0.15 },
    { id: 'arcdetriomphe',label: 'Arc de Triomphe',     xPct: 0.79, yPct: 0.12 },
    { id: 'villagecheese1',label: 'Village Cheese',     xPct: 0.22, yPct: 0.41 },
    { id: 'remembrance', label: 'Remembrance Square',   xPct: 0.80, yPct: 0.33 },
    { id: 'eiffel',      label: 'Eiffel Tower',         xPct: 0.50, yPct: 0.45 },
    { id: 'villagecheese2',label: 'Village Cheese',     xPct: 0.22, yPct: 0.68 },
    { id: 'lebistro',    label: 'Le Bistro',            xPct: 0.58, yPct: 0.64 },
    { id: 'hotelparis',  label: 'Hôtel Paris',          xPct: 0.80, yPct: 0.65 },
    { id: 'champselysees',label: 'Avenue des Champs-Élysées', xPct: 0.50, yPct: 0.88 },
  ],
  },
  spain: {
    key: 'spain',
    name: 'Spain',
    locale: 'es-ES',
    bg: '/countries/spain.png',
    hotspots: [
  { id: 'cafe',       label: 'El Café',         xPct: 0.22, yPct: 0.70 },
  { id: 'estacion',   label: 'Estación de tren', xPct: 0.60, yPct: 0.55 },
  { id: 'sagrada',    label: 'Sagrada Família',  xPct: 0.78, yPct: 0.40 },
  { id: 'parkguell',  label: 'Park Güell',       xPct: 0.35, yPct: 0.45 },
  { id: 'alhambra',   label: 'Alhambra',         xPct: 0.48, yPct: 0.30 },
  { id: 'restaurante',label: 'Restaurante',      xPct: 0.68, yPct: 0.75 },
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
  usa: {
    key: 'usa',
    name: 'USA',
    locale: 'us-US',
    bg: '/countries/us.png',
    hotspots: [
  { id: 'yellowstone', label: 'Yellowstone National Park', xPct: 0.20, yPct: 0.20 },
  { id: 'washington',  label: 'Washington Monument',       xPct: 0.78, yPct: 0.18 },
  { id: 'liberty',     label: 'Statue of Liberty',         xPct: 0.28, yPct: 0.45 },
  { id: 'grandcanyon', label: 'Grand Canyon',              xPct: 0.70, yPct: 0.50 },
  { id: 'whitehouse',  label: 'White House',               xPct: 0.25, yPct: 0.80 },
  { id: 'fastfood',    label: 'McDonalds',                 xPct: 0.72, yPct: 0.82 },
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
  nepal: {
    key: 'nepal',
    name: 'Nepal',
    locale: 'np-NP',
    bg: '/countries/nepal.png',
    hotspots: [
  { id: 'everest',    label: 'Mount Everest (Sagarmatha Region)', xPct: 0.18, yPct: 0.18 },
  { id: 'pashupatinath', label: 'Pashupatinath Temple (Kathmandu)', xPct: 0.78, yPct: 0.18 },
  { id: 'hotel',      label: 'Hotel',      xPct: 0.42, yPct: 0.32 },
  { id: 'hospital',   label: 'Hospital',   xPct: 0.22, yPct: 0.55 },
  { id: 'school',     label: 'School',     xPct: 0.45, yPct: 0.55 },
  { id: 'boudhanath', label: 'Boudhanath Stupa (Kathmandu)', xPct: 0.70, yPct: 0.45 },
  { id: 'train',      label: 'Train Station', xPct: 0.28, yPct: 0.82 },
],

  },
  india: {
    key: 'india',
    name: 'India',
    locale: 'in-IN',
    bg: '/countries/india.png',
   hotspots: [
  { id: 'hotel',      label: 'Hotel',        xPct: 0.28, yPct: 0.15 },
  { id: 'hospital',   label: 'Hospital',     xPct: 0.45, yPct: 0.22 },
  { id: 'amberfort',  label: 'Amber Fort',   xPct: 0.78, yPct: 0.18 },
  { id: 'tajmahal',   label: 'Taj Mahal',    xPct: 0.25, yPct: 0.42 },
  { id: 'train',      label: 'Train Station',xPct: 0.28, yPct: 0.72 },
  { id: 'varanasi1',  label: 'Varanasi Ghats (North)', xPct: 0.72, yPct: 0.48 },
  { id: 'varanasi2',  label: 'Varanasi Ghats (South)', xPct: 0.70, yPct: 0.72 },
]


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
