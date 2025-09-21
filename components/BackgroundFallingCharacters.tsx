'use client';

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(' ');
}

import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type ScriptKey = 'latin' | 'cyrillic' | 'greek' | 'chinese' | 'devanagari' | 'arabic';

const SCRIPTS: Record<ScriptKey, string[]> = {
  latin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  cyrillic: 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split(''),
  greek: 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'.split(''),
  chinese: ['学', '言', '文', '城', '海', '天', '山', '光', '龙', '风', '心', '友', '新', '中', '华'],
  devanagari: 'अआइईउऊएऐओऔकखगघचछजझटठडढतथदधनपफबभमयरलवशषसह'.split(''),
  arabic: 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split(''),
};

const DEFAULT_SCRIPT_WEIGHTS: Partial<Record<ScriptKey, number>> = {
  latin: 1, cyrillic: 1, greek: 1, chinese: 1, devanagari: 1, arabic: 1,
};

type GlyphSpec = { id: string; char: string; x: number };

// --- helper: side-biased x picker (bimodal toward left/right) ---
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function pickBiasedX(width: number, gutterPct: number, sidesWeight: number) {
  const gutter = Math.max(0, Math.min(Math.floor(width * gutterPct), Math.floor(width / 2)));
  const leftMax = Math.max(0, gutter);
  const rightMin = Math.max(0, width - gutter);
  const centerMin = leftMax;
  const centerMax = rightMin;

  const roll = Math.random();
  if (roll < sidesWeight && gutter > 0) {
    // 50/50 left vs right
    return Math.random() < 0.5 ? randInt(0, leftMax) : randInt(rightMin, width);
  }
  // center fallback (in case gutters cover all, this becomes a no-op)
  if (centerMax > centerMin) return randInt(centerMin, centerMax);
  // extreme fallback
  return randInt(0, width);
}

export function BackgroundFallingCharacters({
  className,
  children,
  count = 28,
  minDuration = 6,
  maxDuration = 12,
  minDelay = 0,
  maxDelay = 6,
  minSize = 14,
  maxSize = 28,
  scriptWeights = DEFAULT_SCRIPT_WEIGHTS,
  showFloor = true,
  // NEW: tune these to bias more to the sides
  gutterPct = 0.28,      // each side gutter is ~28% of width
  sidesWeight = 0.85,    // 85% of spawns go to the gutters
}: {
  className?: string;
  children?: React.ReactNode;
  count?: number;
  minDuration?: number;
  maxDuration?: number;
  minDelay?: number;
  maxDelay?: number;
  minSize?: number;
  maxSize?: number;
  scriptWeights?: Partial<Record<ScriptKey, number>>;
  showFloor?: boolean;
  gutterPct?: number;
  sidesWeight?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const floorRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [glyphs, setGlyphs] = useState<GlyphSpec[]>([]);

  const pool = useMemo(() => {
    const items: { script: ScriptKey; char: string }[] = [];
    (Object.keys(SCRIPTS) as ScriptKey[]).forEach((k) => {
      const w = scriptWeights[k] ?? 0;
      if (w <= 0) return;
      for (let i = 0; i < Math.max(1, Math.floor(w)); i++) {
        SCRIPTS[k].forEach((ch) => items.push({ script: k, char: ch }));
      }
    });
    return items.length ? items : SCRIPTS.latin.map((ch) => ({ script: 'latin' as ScriptKey, char: ch }));
  }, [scriptWeights]);

  // measure width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // seed glyphs with side bias
  useEffect(() => {
    if (!width) return;
    setGlyphs(
      Array.from({ length: count }, (_, i) => {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        return {
          id: `glyph-${i}-${Math.random().toString(36).slice(2)}`,
          char: pick.char,
          x: pickBiasedX(width, gutterPct, sidesWeight),
        };
      }),
    );
  }, [width, count, pool, gutterPct, sidesWeight]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'pointer-events-none fixed inset-0 z-0 overflow-hidden',
        'bg-black', // keep the black page background
        className,
      )}
    >
      {glyphs.map((g) => (
        <FallingGlyph
          key={g.id}
          baseKey={g.id}
          char={g.char}
          initialX={g.x}
          fontSize={randInt(minSize, maxSize)}
          duration={randFloat(minDuration, maxDuration)}
          delay={randFloat(minDelay, maxDelay)}
          containerRef={containerRef}
          floorRef={floorRef}
          // pass width + bias opts so respawns also favor the sides
          width={width}
          gutterPct={gutterPct}
          sidesWeight={sidesWeight}
        />
      ))}

      {showFloor && (
        <div
          ref={floorRef}
          className="absolute bottom-0 left-0 right-0 h-8"
          style={{ boxShadow: '0 0 24px rgba(255,255,255,0.04), 0 -6px 12px rgba(255,255,255,0.025) inset' }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

const FallingGlyph = ({
  baseKey,
  char,
  initialX,
  fontSize,
  duration,
  delay,
  containerRef,
  floorRef,
  width,
  gutterPct,
  sidesWeight,
}: {
  baseKey: string;
  char: string;
  initialX: number;
  fontSize: number;
  duration: number;
  delay: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  floorRef: React.RefObject<HTMLDivElement | null>;
  width: number;
  gutterPct: number;
  sidesWeight: number;
}) => {
  const glyphRef = useRef<HTMLDivElement | null>(null);
  const [key, setKey] = useState(0);
  const [spawnX, setSpawnX] = useState(initialX);
  const [collision, setCollision] = useState<{ x: number; y: number } | null>(null);
  const [detected, setDetected] = useState(false);

  // poll for collision, then respawn with a NEW side-biased x
  useEffect(() => {
    const tick = () => {
      if (!glyphRef.current || !floorRef.current || !containerRef.current || detected) return;
      const g = glyphRef.current.getBoundingClientRect();
      const f = floorRef.current.getBoundingClientRect();
      if (g.bottom >= f.top) {
        const parent = containerRef.current.getBoundingClientRect();
        setCollision({ x: g.left - parent.left + g.width / 2, y: g.bottom - parent.top });
        setDetected(true);
        setTimeout(() => setCollision(null), 900);
        setTimeout(() => {
          setDetected(false);
          setSpawnX(pickBiasedX(width, gutterPct, sidesWeight)); // <-- new X on each cycle
          setKey((k) => k + 1);
        }, 950);
      }
    };
    const id = window.setInterval(tick, 60);
    return () => window.clearInterval(id);
  }, [detected, containerRef, floorRef, width, gutterPct, sidesWeight]);

  return (
    <>
      <motion.div
        key={`${baseKey}-${key}`}
        ref={glyphRef}
        initial={{ translateY: '-200px', translateX: spawnX }}
        animate={{ translateY: '1800px', translateX: spawnX }}
        transition={{ duration, repeat: Infinity, repeatType: 'loop', ease: 'linear', delay, repeatDelay: 0 }}
        className="absolute top-10 left-0 select-none text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]"
        style={{ fontSize }}
      >
        {char}
      </motion.div>

      <AnimatePresence>
        {collision && (
          <Explosion
            key={`${collision.x}-${collision.y}-${key}`}
            style={{ left: `${collision.x}px`, top: `${collision.y}px`, transform: 'translate(-50%, -50%)' }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const Explosion = ({ ...props }: React.HTMLProps<HTMLDivElement>) => {
  const spans = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    dx: Math.floor(Math.random() * 80 - 40),
    dy: Math.floor(Math.random() * -50 - 10),
    dur: Math.random() * 1.2 + 0.4,
  }));
  return (
    <div {...props} className={cn('absolute z-20 h-2 w-2 pointer-events-none', props.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute -inset-x-8 top-0 m-auto h-2 w-10 rounded-full bg-white/60 blur-[2px]"
      />
      {spans.map((s) => (
        <motion.span
          key={s.id}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: s.dx, y: s.dy, opacity: 0 }}
          transition={{ duration: s.dur, ease: 'easeOut' }}
          className="absolute h-[3px] w-[3px] rounded-full bg-white/80"
        />
      ))}
    </div>
  );
};
