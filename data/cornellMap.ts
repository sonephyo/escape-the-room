// import { Building } from '../types';

// export const CORNELL_BUILDINGS: Building[] = [
//   {
//     id: 'mcgraw-tower',
//     name: 'McGraw Tower',
//     position: { x: 400, y: 250 },
//     width: 32,
//     height: 48,
//     color: '#8B4513',
//     description: 'Iconic Cornell bell tower with chimes',
//     type: 'tower'
//   },
//   {
//     id: 'uris-library',
//     name: 'Uris Library',
//     position: { x: 350, y: 280 },
//     width: 64,
//     height: 40,
//     color: '#CD853F',
//     description: 'Main undergraduate library',
//     type: 'library'
//   },
//   {
//     id: 'willard-straight',
//     name: 'Willard Straight Hall',
//     position: { x: 480, y: 220 },
//     width: 56,
//     height: 40,
//     color: '#D2691E',
//     description: 'Student union building',
//     type: 'building'
//   },
//   {
//     id: 'day-hall',
//     name: 'Day Hall',
//     position: { x: 300, y: 200 },
//     width: 48,
//     height: 32,
//     color: '#B31B1B',
//     description: 'University administration',
//     type: 'building'
//   },
//   {
//     id: 'olin-hall',
//     name: 'Olin Hall',
//     position: { x: 200, y: 320 },
//     width: 56,
//     height: 40,
//     color: '#4682B4',
//     description: 'Chemical Engineering',
//     type: 'building'
//   },
//   {
//     id: 'carpenter-hall',
//     name: 'Carpenter Hall',
//     position: { x: 280, y: 340 },
//     width: 56,
//     height: 40,
//     color: '#4682B4',
//     description: 'Engineering Library',
//     type: 'building'
//   },
//   {
//     id: 'bailey-hall',
//     name: 'Bailey Hall',
//     position: { x: 450, y: 300 },
//     width: 64,
//     height: 48,
//     color: '#8B4513',
//     description: 'Concert hall and auditorium',
//     type: 'building'
//   },
//   {
//     id: 'goldwin-smith',
//     name: 'Goldwin Smith Hall',
//     position: { x: 380, y: 180 },
//     width: 72,
//     height: 40,
//     color: '#CD853F',
//     description: 'Arts and Sciences',
//     type: 'building'
//   },
//   {
//     id: 'sage-hall',
//     name: 'Sage Hall',
//     position: { x: 520, y: 280 },
//     width: 48,
//     height: 40,
//     color: '#8B4513',
//     description: 'Philosophy Department',
//     type: 'building'
//   },
//   {
//     id: 'cornell-store',
//     name: 'Cornell Store',
//     position: { x: 450, y: 180 },
//     width: 40,
//     height: 32,
//     color: '#B31B1B',
//     description: 'Campus bookstore',
//     type: 'building'
//   }
// ];

// export const TREES = [
//   { x: 150, y: 180 },
//   { x: 250, y: 150 },
//   { x: 580, y: 160 },
//   { x: 650, y: 200 },
//   { x: 160, y: 360 },
//   { x: 580, y: 340 },
//   { x: 680, y: 300 },
//   { x: 120, y: 250 },
//   { x: 720, y: 220 },
//   { x: 320, y: 380 },
//   { x: 500, y: 120 },
//   { x: 180, y: 120 }
// ];

// export const PATHS = [
//   // Horizontal paths
//   { x: 50, y: 240, width: 700, height: 12 },
//   { x: 100, y: 320, width: 600, height: 12 },
//   { x: 200, y: 180, width: 400, height: 12 },
//   // Vertical paths
//   { x: 400, y: 50, width: 12, height: 400 },
//   { x: 280, y: 150, width: 12, height: 250 },
//   { x: 480, y: 120, width: 12, height: 200 }
// ];

// export const MAP_BOUNDS = {
//   width: 800,
//   height: 500,
//   minX: 20,
//   minY: 20,
//   maxX: 780,
//   maxY: 480
// };

import { Building } from '../types';

export const CORNELL_BUILDINGS: Building[] = [
  {
    id: 'goldwin-smith',
    name: 'Goldwin Smith Hall',
    position: { x: 450, y: 400 },
    // width: 72,
    // height: 44,
    width: 86,
    height: 53,
    color: '#CD853F',
    description: 'College of Arts & Sciences (Humanities, English, Philosophy)',
    type: 'building',
  },
  {
    id: 'uris-hall',
    name: 'Uris Hall',
    position: { x: 610, y: 630 },
    // width: 64,
    // height: 40,
    width: 77,
    height: 48,
    color: '#B31B1B',
    description: 'Social Sciences (Sociology, Economics, Government)',
    type: 'building',
  },
  {
    id: 'white-hall',
    name: 'White Hall',
    position: { x: 160, y: 190 },
    // width: 56,
    // height: 36,
    width: 69,
    height: 45,
    color: '#B31B1B',
    description: 'Philosophy & Classics',
    type: 'building',
  },
  {
    id: 'lincoln-hall',
    name: 'Lincoln Hall',
    position: { x: 600, y: 160 },   
    // width: 56,
    // height: 36,
    width: 69,
    height: 45,
    color: '#B31B1B',
    description: 'Music & Performing Arts',
    type: 'building',
  },
  {
    id: 'mcgraw-hall',
    name: 'McGraw Hall',
    position: { x: 300, y: 300 },
    // width: 64,
    // height: 40,
    width: 77,
    height: 48,
    color: '#B31B1B',
    description: 'History & Anthropology',
    type: 'building',
  },
  {
    id: 'olin-library',
    name: 'Olin Library',
    position: { x: 370, y: 530 },
    // width: 72,
    // height: 48,
    width: 86,
    height: 58,
    color: '#8B8B8B',
    description: 'Knowledge hub (agents guarding “universal clues”)',
    type: 'library',
  },
  {
    id: 'uris-library-clock',
    name: 'Uris Library & Clocktower',
    position: { x: 220, y: 650 },
    // width: 72,
    // height: 48,
    width: 86,
    height: 58,
    color: '#8B8B8B',
    description: 'Iconic time-based puzzle location',
    type: 'library',
  },
  {
    id: 'baker-lab',
    name: 'Baker Laboratory',
    position: { x: 900, y: 170 },
    // width: 72,
    // height: 48,
    width: 86,
    height: 58,
    color: '#2C7A7B',
    description: 'Chemistry (Science sector)',
    type: 'building',
  },
  {
    id: 'space-sciences',
    name: 'Space Sciences Building',
    position: { x: 850, y: 400 },
    // width: 72,
    // height: 48,
    width: 86,
    height: 58,
    color: '#2C5282',
    description: 'Astronomy & Physics sector',
    type: 'building',
  },
  {
    id: 'statler-hall',
    name: 'Statler Hall',
    position: { x: 900, y: 600 },
    // width: 80,
    // height: 52,
    width: 96,
    height: 63,
    color: '#B7791F',
    description: 'Business & Hospitality (applied problem-solving)',
    type: 'building',
  },
];

// export const TREES = [
//   { x: 150, y: 180 }, { x: 250, y: 150 }, { x: 580, y: 160 }, { x: 650, y: 200 },
//   { x: 160, y: 360 }, { x: 580, y: 340 }, { x: 680, y: 300 }, { x: 120, y: 250 },
//   { x: 720, y: 220 }, { x: 320, y: 380 }, { x: 500, y: 120 }, { x: 180, y: 120 },
// ];

// export const PATHS = [
//   // Outer loop (roughly University Ave → Garden Ave → Campus Rd → Libe Slope side)
//   { x: 100, y: 140, width: 620, height: 12 },  // top
//   { x: 720, y: 140, width: 12,  height: 292 }, // right
//   { x: 100, y: 420, width: 632, height: 12 },  // bottom
//   { x: 100, y: 140, width: 12,  height: 292 }, // left

//   // Center north–south spine
//   { x: 400, y: 160, width: 12, height: 260 },

//   // Library strip near Olin/Uris (horizontal)
//   { x: 180, y: 320, width: 420, height: 12 },

//   // Small U-spur near Uris Hall
//   { x: 440, y: 280, width: 172, height: 12 }, // top of U
//   { x: 440, y: 280, width: 12,  height: 52 }, // left leg
//   { x: 600, y: 280, width: 12,  height: 52 }, // right leg

//   // Astronomy courtyard rectangle (near Space Sciences/Baker)
//   { x: 520, y: 200, width: 160, height: 10 }, // top
//   { x: 680, y: 200, width: 10,  height: 80 }, // right
//   { x: 520, y: 270, width: 160, height: 10 }, // bottom
//   { x: 520, y: 200, width: 10,  height: 80 }, // left
// ];

export const PATHS = [
  // OUTER LOOP
  { x: 80,  y: 80,  width: 1040, height: 12 }, // top
  { x: 1120, y: 80,  width: 12,   height: 652 }, // right
  { x: 80,  y: 732, width: 1052, height: 12 }, // bottom
  { x: 80,  y: 80,  width: 12,   height: 652 }, // left

  // CENTRAL NORTH–SOUTH BOULEVARD
  { x: 720, y: 80, width: 12, height: 652 },

  // MID EAST–WEST CORRIDOR (Arts Quad → boulevard)
  { x: 90, y: 420, width: 640, height: 12 },

  // LIBRARY STRIP (Olin/Uris) + drop to bottom loop
  { x: 324, y: 600, width: 196, height: 12 },
  { x: 520, y: 600, width: 600, height: 12 },
  { x: 520, y: 600, width: 12,  height: 132 },

  // VERTICAL CONNECTORS (mid corridor → library strip)
  { x: 360, y: 420, width: 12, height: 180 },
  { x: 500, y: 420, width: 12, height: 180 },
  { x: 900, y: 420, width: 12, height: 180 },

  // ───────────────────────────────────────────────────────────────
  // NEW: UPPER ACADEMIC STRIP (connect upper buildings)
  // West segment (left → boulevard)
  { x: 90,  y: 250, width: 650, height: 12 },  // 90 → 740 (meets boulevard at 720)
  // East segment (boulevard → right edge)
  { x: 740, y: 250, width: 380, height: 12 },  // 740 → 1120

  // Short vertical drops from upper buildings to the strip
  // White Hall (center ≈ 195, bottom ≈ 235) → y:250
  { x: 195, y: 235, width: 12, height: 20 },
  // Lincoln Hall (center ≈ 635, bottom ≈ 205) → y:250
  { x: 635, y: 205, width: 12, height: 57 },
  // Baker Lab (center ≈ 943, bottom ≈ 228) → y:250
  { x: 943, y: 228, width: 12, height: 34 },
];



export const TREES = [
  // ───────── OUTER LOOP ─────────
  // Top (rows above/below the top path at y=80)
  { x:120, y:34 }, { x:200, y:34 }, { x:280, y:34 }, { x:360, y:34 }, { x:440, y:34 },
  { x:520, y:34 }, { x:600, y:34 }, { x:680, y:34 }, { x:760, y:34 }, { x:840, y:34 },
  { x:920, y:34 }, { x:1000, y:34 }, { x:1080, y:34 },
  { x:120, y:98 }, { x:200, y:98 }, { x:280, y:98 }, { x:360, y:98 }, { x:440, y:98 },
  { x:520, y:98 }, { x:600, y:98 }, { x:680, y:98 }, { x:760, y:98 }, { x:840, y:98 },
  { x:920, y:98 }, { x:1000, y:98 }, { x:1080, y:98 },

  // Bottom (row above the bottom path at y=732) – bottom row omitted to avoid clipping
  { x:120, y:686 }, { x:200, y:686 }, { x:280, y:686 }, { x:360, y:686 }, { x:440, y:686 },
  { x:520, y:686 }, { x:600, y:686 }, { x:680, y:686 }, { x:760, y:686 }, { x:840, y:686 },
  { x:920, y:686 }, { x:1000, y:686 }, { x:1080, y:686 },

  // Left vertical (x=80) – rows left/right of the path
  { x:42,  y:120 }, { x:42,  y:200 }, { x:42,  y:280 }, { x:42,  y:360 },
  { x:42,  y:440 }, { x:42,  y:520 }, { x:42,  y:600 }, { x:42,  y:680 },
  { x:98,  y:120 }, { x:98,  y:200 }, { x:98,  y:280 }, { x:98,  y:360 },
  { x:98,  y:440 }, { x:98,  y:520 }, { x:98,  y:600 }, { x:98,  y:680 },

  // Right vertical (x=1120)
  { x:1082, y:120 }, { x:1082, y:200 }, { x:1082, y:280 }, { x:1082, y:360 },
  { x:1082, y:440 }, { x:1082, y:520 }, { x:1082, y:600 }, { x:1082, y:680 },
  { x:1138, y:120 }, { x:1138, y:200 }, { x:1138, y:280 }, { x:1138, y:360 },
  { x:1138, y:440 }, { x:1138, y:520 }, { x:1138, y:600 }, { x:1138, y:680 },

  // ───────── CENTRAL BOULEVARD (x=720) ─────────
  { x:682, y:120 }, { x:682, y:200 }, { x:682, y:280 }, { x:682, y:360 },
  { x:682, y:440 }, { x:682, y:520 }, { x:682, y:600 }, { x:682, y:680 },
  { x:738, y:120 }, { x:738, y:200 }, { x:738, y:280 }, { x:738, y:360 },
  { x:738, y:440 }, { x:738, y:520 }, { x:738, y:600 }, { x:738, y:680 },

  // ───────── MID EAST–WEST CORRIDOR (y=420) ─────────
  // Rows above/below path from x≈90→740
  { x:120, y:374 }, { x:200, y:374 }, { x:280, y:374 }, { x:360, y:374 },
  { x:440, y:374 }, { x:520, y:374 }, { x:600, y:374 }, { x:680, y:374 },
  { x:120, y:438 }, { x:200, y:438 }, { x:280, y:438 }, { x:360, y:438 },
  { x:440, y:438 }, { x:520, y:438 }, { x:600, y:438 }, { x:680, y:438 },

  // ───────── UPPER ACADEMIC STRIP (y=250) ─────────
  // Two rows along the whole 90→1120 span, split at boulevard
  // Left of boulevard
  { x:120, y:204 }, { x:200, y:204 }, { x:280, y:204 }, { x:360, y:204 },
  { x:440, y:204 }, { x:520, y:204 }, { x:600, y:204 }, { x:680, y:204 },
  { x:120, y:268 }, { x:200, y:268 }, { x:280, y:268 }, { x:360, y:268 },
  { x:440, y:268 }, { x:520, y:268 }, { x:600, y:268 }, { x:680, y:268 },
  // Right of boulevard
  { x:760, y:204 }, { x:840, y:204 }, { x:920, y:204 }, { x:1000, y:204 }, { x:1080, y:204 },
  { x:760, y:268 }, { x:840, y:268 }, { x:920, y:268 }, { x:1000, y:268 }, { x:1080, y:268 },

  // ───────── LIBRARY STRIP (y=600, x≈324→1120) ─────────
  { x:340, y:554 }, { x:420, y:554 }, { x:500, y:554 }, { x:580, y:554 }, { x:660, y:554 },
  { x:740, y:554 }, { x:820, y:554 }, { x:900, y:554 }, { x:980, y:554 }, { x:1060, y:554 },
  { x:340, y:618 }, { x:420, y:618 }, { x:500, y:618 }, { x:580, y:618 }, { x:660, y:618 },
  { x:740, y:618 }, { x:820, y:618 }, { x:900, y:618 }, { x:980, y:618 }, { x:1060, y:618 },

  // ───────── VERTICAL CONNECTORS (tidy pairs) ─────────
  // Mid→Library connectors at x=360, 500, 900 (y:420→600)
  { x:322, y:450 }, { x:378, y:450 }, { x:322, y:540 }, { x:378, y:540 },
  { x:462, y:450 }, { x:518, y:450 }, { x:462, y:540 }, { x:518, y:540 },
  { x:862, y:450 }, { x:918, y:450 }, { x:862, y:540 }, { x:918, y:540 },

  // Library drop to bottom loop (x=520, y:600→732)
  { x:482, y:640 }, { x:538, y:640 }, { x:482, y:720 }, { x:538, y:720 },

  // Short drops from upper buildings to the upper strip
  // White (x≈195, y:235→250)
  // { x:157, y:236 }, { x:213, y:236 },
  // Lincoln (x≈635, y:205→250)
  // { x:597, y:220 }, { x:653, y:220 }, { x:597, y:260 }, { x:653, y:260 },
  // Baker (x≈943, y:228→250)
  // { x:905, y:236 }, { x:961, y:236 }, { x:905, y:256 }, { x:961, y:256 },
];



export const MAP_BOUNDS = {
  // width: 800,
  // height: 500,
  width: 1200,
  height: 800,
  minX: 20,
  minY: 20,
  // maxX: 780,
  // maxY: 480,
  maxX: 1180,
  maxY: 780,
};
