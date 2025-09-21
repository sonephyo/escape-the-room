// /components/CountrySelect.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { COUNTRIES, type CountryKey } from "@/game/countries";
import { AnimatePresence, motion } from "framer-motion";

const ORDER: CountryKey[] = [
  "france",
  "spain",
  "italy",
  "usa",
  "germany",
  "nepal",
  "india",
];

export function CountrySelect({
  onChoose,
}: {
  onChoose: (key: CountryKey) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(0); // -1 left, +1 right

  const current = useMemo(() => ORDER[idx], [idx]);
  const total = ORDER.length;

  const go = useCallback(
    (delta: number) => {
      setDirection(delta);
      setIdx((i) => (i + delta + total) % total);
    },
    [total]
  );

  const next = useCallback(() => go(+1), [go]);
  const prev = useCallback(() => go(-1), [go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Enter") onChoose(current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, next, prev, onChoose]);

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 160 : -160,
      opacity: 0,
      rotate: d > 0 ? 1.5 : -1.5,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 260, damping: 22 },
    },
    exit: (d: number) => ({
      x: d > 0 ? -160 : 160,
      opacity: 0,
      rotate: d > 0 ? -1.5 : 1.5,
      scale: 0.98,
      transition: { duration: 0.16 },
    }),
  };

  return (
    <div
      className="
        relative w-full max-w-6xl mx-auto p-4 sm:p-6 text-[#e5fbd3]
        rounded-[18px] border-4 border-[#2aff7b]
        bg-[#0a0f0a] shadow-[0_0_0_4px_#073b16_inset,0_0_60px_#2aff7b40]
        font-['Press_Start_2P',ui-monospace,monospace] tracking-tight
        before:pointer-events-none before:absolute before:inset-0
        before:bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_1px,transparent_2px,transparent_3px)]
        before:opacity-30
        after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_center,transparent_40%,#000_100%)]
        after:opacity-70
      "
      style={{ imageRendering: "pixelated" }}
    >
      {/* HUD Top Bar */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[18px] sm:text-[22px] leading-none text-[#2aff7b] [text-shadow:0_0_8px_#2aff7b80] uppercase">
          ► Choose your destination
        </h1>
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#8cfdb5]">
          <span className="px-2 py-1 border-2 border-[#2aff7b] bg-[#0f1a0f]">
            ←
          </span>
          <span className="px-2 py-1 border-2 border-[#2aff7b] bg-[#0f1a0f]">
            →
          </span>
          <span className="px-2 py-1 border-2 border-[#2aff7b] bg-[#0f1a0f]">
            ENTER
          </span>
        </div>
      </div>

      {/* Stage */}
      <div className="relative">
        {/* Neon Grid Frame */}
        <div className="pointer-events-none absolute -inset-2 -z-10 rounded-[22px] border-4 border-[#2aff7b66]" />
        <div
          className="
            absolute -inset-1 -z-20 rounded-[22px] opacity-30
            bg-[radial-gradient(circle_at_50%_0%,#2aff7b22,transparent_60%)]
          "
        />

        {/* Arrows */}
        <button
          onClick={prev}
          className="
            group absolute left-0 top-1/2 -translate-y-1/2 z-20
            px-3 py-3 border-4 border-[#2aff7b] bg-[#0f1a0f]
            text-[#2aff7b] hover:bg-[#143119] active:translate-y-[1px]
            shadow-[4px_4px_0_#1c692f] transition
          "
          aria-label="Previous"
        >
          <span className="block translate-x-[-1px] group-hover:translate-x-[-2px] transition">
            ◀
          </span>
        </button>
        <button
          onClick={next}
          className="
            group absolute right-0 top-1/2 -translate-y-1/2 z-20
            px-3 py-3 border-4 border-[#2aff7b] bg-[#0f1a0f]
            text-[#2aff7b] hover:bg-[#143119] active:translate-y-[1px]
            shadow-[4px_4px_0_#1c692f] transition
          "
          aria-label="Next"
        >
          <span className="block translate-x-[1px] group-hover:translate-x-[2px] transition">
            ▶
          </span>
        </button>

        {/* Card (single, swipeable) */}
        <div className="mx-12 sm:mx-16 md:mx-24">
          <div className="relative aspect-[5/6] sm:aspect-[16/9] max-h-[68vh] overflow-hidden rounded-[12px] border-4 border-[#2aff7b] bg-[#091309]">
            <AnimatePresence custom={direction} mode="popLayout">
              {(() => {
                const key = current;
                const cfg = COUNTRIES[key];
                return (
                  <motion.button
                    key={key}
                    custom={direction}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    // variants={variants}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.9}
                    onDragEnd={(_, info) => {
                      const threshold = 90;
                      if (info.offset.x < -threshold) next();
                      else if (info.offset.x > threshold) prev();
                    }}
                    onClick={() => onChoose(key)}
                    className="group relative h-full w-full text-left focus:outline-none cursor-pointer"
                    style={{ touchAction: "pan-y" }}
                  >
                    {/* BG image with CRT mask */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cfg.bg}
                      alt={cfg.name}
                      className="absolute inset-0 h-full w-full object-cover opacity-85"
                      style={{ imageRendering: "pixelated" }}
                    />
                    {/* Scanlines + vignette */}
                    <div className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-70 bg-[repeating-linear-gradient(#00000022_0px,#00000022_2px,transparent_3px,transparent_4px)]" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,#000_100%)] opacity-80" />
                    {/* Bezel */}
                    <div className="pointer-events-none absolute inset-0 border-4 border-[#2aff7b] rounded-[8px] opacity-60" />

                    {/* HUD header */}
                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      <span className="h-3 w-3 bg-[#2aff7b] shadow-[0_0_12px_#2aff7b] border-2 border-[#0a210f]" />
                      <span className="px-2 py-1 border-2 border-[#2aff7b] bg-[#0f1a0f] text-[10px] text-[#8cfdb5]">
                        {String(idx + 1).padStart(2, "0")}/
                        {String(total).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Footer Card Info */}
                    <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4">
                      <div className="rounded-[8px] border-4 border-[#2aff7b] bg-[#0a160d]/90 p-3 sm:p-4 shadow-[4px_4px_0_#1c692f]">
                        <div className="text-[16px] sm:text-[18px] md:text-[20px] text-[#2aff7b] uppercase [text-shadow:0_0_8px_#2aff7b80]">
                          {cfg.name}
                        </div>
                        <div className="mt-2 text-[10px] sm:text-[11px] text-[#8cfdb5]">
                          LANGUAGE:{" "}
                          <span className="text-[#e5fbd3]">{cfg.locale}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-[10px] text-[#8cfdb5]">
                          <span className="px-2 py-1 border-2 border-[#2aff7b] bg-[#0f1a0f]">
                            SWIPE
                          </span>
                          <span className="px-2 py-1 border-2 border-[#2aff7b] bg-[#0f1a0f]">
                            TAP TO SELECT
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => onChoose(current)}
          className="
            inline-flex items-center justify-center gap-2 px-5 py-3
            text-[#0b1a10] bg-[#2aff7b]
            border-4 border-[#2aff7b] shadow-[4px_4px_0_#1c692f]
            active:translate-y-[1px] hover:brightness-95
            uppercase text-[12px]
          "
        >
          Start ►
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {ORDER.map((k, i) => (
            <button
              key={k}
              onClick={() => {
                setDirection(i > idx ? +1 : -1);
                setIdx(i);
              }}
              className={`
                h-3 transition-all border-2 border-[#2aff7b] shadow-[2px_2px_0_#1c692f]
                ${
                  i === idx
                    ? "w-8 bg-[#2aff7b]"
                    : "w-3 bg-transparent hover:bg-[#2aff7b55]"
                }
              `}
              aria-label={`Go to ${COUNTRIES[k].name}`}
            />
          ))}
        </div>
      </div>

      {/* Tiny helper text */}
      <p className="mt-3 text-[10px] text-[#8cfdb5] opacity-70">
        USE ← / → OR SWIPE • PRESS ENTER TO CONFIRM
      </p>
    </div>
  );
}
