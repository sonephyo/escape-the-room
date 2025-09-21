/* eslint-disable @typescript-eslint/no-explicit-any */
// /components/CountryScene.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { COUNTRIES, type CountryKey, scaleHotspots } from '@/game/countries';
import { useKeyboard } from '@/hooks/useKeyboard';
import { Character as CharacterSprite } from '@/components/Character';
// ⬇️ use the persona modal (not AkoolChatModal)
import { AkoolPersonaModal } from '@/components/AkoolPersonaModal';
import { PERSONAS } from '@/config/akoolPersonas';

const SPEED = 1;
const SIZE = 24;
const VIEW_W = 800;
const VIEW_H = 600;
// 277d48b
// Map your game context → PERSONAS keys.
// ⚠️ Change these strings to the exact keys you have in PERSONAS.
function resolvePersonaFor(
  country: CountryKey,
  hotspotId: string
): keyof typeof PERSONAS | undefined {
  const byCountry: Record<CountryKey, Partial<Record<string, keyof typeof PERSONAS>>> = {
    france: {
      notredame:       'Notre-Dame Docent',
      lesinvalides:    'Invalides Historian',
      arcdetriomphe:   'Triomphe Guide',
      villagecheese1:  'Fromager-Boulanger',
      villagecheese2:  'Fromager-Boulanger',
      remembrance:     'Remembrance Attendant',
      eiffel:          'Eiffel Host',
      lebistro:        'Bistro Server',
      hotelparis:      'Hotel Concierge',
      champselysees:   'Champs-Elysees Local',
    },

    // ✅ SPAIN (updated to match your hotspots)
    spain: {
      cafe:        'Spanish Server',        // El Café
      estacion:    'Spanish Stationmaster', // Estación de tren
      sagrada:     'Catalan Basilica Guide',// Sagrada Família
      parkguell:   'Catalan Park Guide',    // Park Güell
      alhambra:    'Andalusian Historian',  // Alhambra
      restaurante: 'Spanish Waiter',        // Restaurante
    },

    italy: {
      gelato:  'Italian Gelataio',
      piazza:  'Italian Local',
      duomo:   'Italian Guide',
    },

    // (leaving your usa mapping as-is)
    usa: { sushi: 'Japanese Chef', shrine: 'Japanese Monk', karaoke: 'Japanese Host' },

    germany: {
      bakery:     'German Baker',
      biergarten: 'German Host',
      museum:     'German Guide',
    },

    // ✅ NEPAL
    nepal: {
      everest:        'Sherpa Guide',             // Mount Everest
      pashupatinath:  'Kathmandu Priest',         // Pashupatinath Temple
      hotel:          'Nepal Hotelier',           // Hotel
      hospital:       'Nepal Medic',              // Hospital
      school:         'Nepal Teacher',            // School
      boudhanath:     'Stupa Monk',               // Boudhanath Stupa
      train:          'Nepal Stationmaster',      // Train Station
    },

    // ✅ INDIA
    india: {
      hotel:      'Indian Hotelier',         // Hotel
      hospital:   'Indian Doctor',           // Hospital
      amberfort:  'Rajasthan Guide',         // Amber Fort
      tajmahal:   'Agra Guide',              // Taj Mahal
      train:      'Stationmaster',           // Train Station
      varanasi1:  'Varanasi Guide',          // Ghats (North)
      varanasi2:  'Varanasi Guide',          // Ghats (South)
    },
  };

  return byCountry[country]?.[hotspotId];
}


export function CountryScene({ country }: { country: CountryKey }) {
  const cfg = COUNTRIES[country];

  // World size from image
  const [world, setWorld] = useState({ w: 1920, h: 1080 });
  useEffect(() => {
    const img = new Image();
    img.src = cfg.bg;
    img.onload = () => {
      const maxW = 2560;
      const s = Math.min(1, maxW / img.naturalWidth);
      setWorld({ w: Math.round(img.naturalWidth * s), h: Math.round(img.naturalHeight * s) });
    };
  }, [cfg.bg]);

  // Hotspots in world coords
  const hotspots = useMemo(() => scaleHotspots(cfg, world.w, world.h), [cfg, world]);

  // Player TOP-LEFT coords (matches Character component)
  const [player, setPlayer] = useState({ x: Math.round(world.w / 2 - SIZE / 2), y: Math.round(world.h / 2 - SIZE / 2), dir: 'down', moving: false });
  useEffect(() => {
    setPlayer((p) => ({ ...p, x: Math.round(world.w / 2 - SIZE / 2), y: Math.round(world.h / 2 - SIZE / 2) }));
  }, [world.w, world.h]);

  const keys = useKeyboard();

  // Movement
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setPlayer((prev) => {
        let { x, y, dir } = prev;
        let moving = false;
        if (keys['w'] || keys['arrowup']) { y -= SPEED; dir = 'up'; moving = true; }
        if (keys['s'] || keys['arrowdown']) { y += SPEED; dir = 'down'; moving = true; }
        if (keys['a'] || keys['arrowleft']) { x -= SPEED; dir = 'left'; moving = true; }
        if (keys['d'] || keys['arrowright']) { x += SPEED; dir = 'right'; moving = true; }
        x = Math.max(0, Math.min(world.w - SIZE, x));
        y = Math.max(0, Math.min(world.h - SIZE, y));
        if (x === prev.x && y === prev.y && moving === prev.moving && dir === prev.dir) return prev;
        return { x, y, dir, moving };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [keys, world.w, world.h]);

  // Camera (from player center)
  const centerX = player.x + SIZE / 2;
  const centerY = player.y + SIZE / 2;
  const cameraX = Math.min(Math.max(centerX - VIEW_W / 2, 0), Math.max(0, world.w - VIEW_W));
  const cameraY = Math.min(Math.max(centerY - VIEW_H / 2, 0), Math.max(0, world.h - VIEW_H));

  // Persona chat state
  const [personaOpen, setPersonaOpen] = useState(false);
  const [activeSpot, setActiveSpot] = useState<string | null>(null);
  const [snoozedSpot, setSnoozedSpot] = useState<string | null>(null); // prevents instant re-open
  const [personaKey, setPersonaKey] = useState<keyof typeof PERSONAS | undefined>(undefined);

  // Proximity → open persona once per entry
  useEffect(() => {
    const spot = hotspots.find(h => Math.hypot(h.x - centerX, h.y - centerY) <= h.radius);

    if (spot) {
      // Only open if entering a *new* spot (and not snoozed)
      if (spot.id !== activeSpot && spot.id !== snoozedSpot) {
        const key = resolvePersonaFor(country, spot.id);
        if (key && PERSONAS[key]) {
          setPersonaKey(key);
          setActiveSpot(spot.id);
          setPersonaOpen(true);
        } else {
          console.warn('[Akool] No persona mapped for', { country, hotspot: spot.id });
          setActiveSpot(spot.id); // still mark to avoid thrash
        }
      }
    } else {
      // Left any spot → clear active and snooze (so re-entry can re-open)
      if (activeSpot) {
        setSnoozedSpot(activeSpot);
        setActiveSpot(null);
      } else if (snoozedSpot) {
        // fully outside: clear snooze so next entry re-opens
        setSnoozedSpot(null);
      }
    }
  }, [hotspots, centerX, centerY, country, activeSpot, snoozedSpot]);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative flex items-center justify-center p-4">
      {/* Fixed viewport */}
      <div className="relative border-4 border-gray-600 shadow-2xl bg-black overflow-hidden" style={{ width: VIEW_W, height: VIEW_H }}>
        {/* World layer */}
        <div
          className="absolute will-change-transform"
          style={{
            left: 0, top: 0,
            width: world.w, height: world.h,
            transform: `translate3d(${-Math.trunc(cameraX)}px, ${-Math.trunc(cameraY)}px, 0)`,
            transition: 'transform 0.05s linear',
            backgroundImage: `url(${cfg.bg})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top left',
          }}
        >
          {/* Hotspots */}
          {hotspots.map(h => (
            <div key={h.id} className="absolute pointer-events-none"
                 style={{ left: h.x - h.radius, top: h.y - h.radius, width: h.radius * 2, height: h.radius * 2 }}>
              <div className="w-full h-full rounded-full" style={{ background: 'rgba(16,185,129,0.28)', border: '2px solid rgba(16,185,129,0.8)' }} />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-white text-xs" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                {h.label}
              </div>
            </div>
          ))}

          {/* Player (top-left coords) */}
          <CharacterSprite character={{ position: { x: player.x, y: player.y }, direction: player.dir as any, isMoving: player.moving }} />

          {/* HUD */}
          <div className="absolute top-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
            {cfg.name} — walk into a glowing spot to practice
          </div>
        </div>
      </div>

      {/* Akool Persona — opens immediately on entry */}
      {personaKey && PERSONAS[personaKey] && (
        <AkoolPersonaModal
          open={personaOpen}
          onClose={() => setPersonaOpen(false)}
          persona={PERSONAS[personaKey]}
          openapiHost={process.env.NEXT_PUBLIC_AKOOL_HOST!}
          openapiToken={process.env.NEXT_PUBLIC_AKOOL_TOKEN!}
          sessionMinutes={10}
        />
      )}
    </div>
  );
}