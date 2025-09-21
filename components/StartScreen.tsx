"use client";

import React, { useEffect, useRef, useState } from "react";
import { CountrySelect } from "@/components/CountrySelect";
import type { CountryKey } from "@/game/countries";

/**
 * StartScreen — Retro-amped with extra animation + styling
 * Request: improve font & Start button, keep everything else intact
 */
export function StartScreen({
  onSelect,
}: {
  onSelect: (country: CountryKey) => void;
}) {
  const [phase, setPhase] = useState<"intro" | "world">("intro");
  const frameRef = useRef<HTMLDivElement>(null);

  // ENTER/SPACE to advance
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (phase === "intro" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        setPhase("world");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase]);

  return (
    <div className="relative w-full h-screen bg-transparent flex items-center justify-center overflow-hidden select-none">
      {/* ambient room glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,#ff2a2a12,transparent_60%)] animate-crt-fade" />

      {/* subtle vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_58%,#000_100%)] opacity-80" />

      <div
        ref={frameRef}
        className="relative flex items-center justify-center border-[6px] border-[#ff2a2a] rounded-[14px] shadow-[0_0_0_6px_#3b0707_inset,0_0_140px_#ff2a2a88,12px_12px_0_#690a0a] bg-[#120a0a] font-['VT323','Press_Start_2P',ui-monospace,monospace] transition-transform duration-300 ease-out hover:scale-[1.012] hover:shadow-[0_0_0_6px_#3b0707_inset,0_0_170px_#ff2a2ab3,14px_14px_0_#690a0a] will-change-transform [image-rendering:pixelated] crt-flicker crt-warp"
        style={{ width: 1024, height: 720 }}
      >
        {/* bezel inner line */}
        <div className="pointer-events-none absolute inset-2 rounded-[10px] border-[3px] border-[#ff2a2a66]" />

        {/* scanlines & noise */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[10px] opacity-40 mix-blend-screen">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(#00000033_0px,#00000033_2px,transparent_3px,transparent_4px)] animate-scanlines" />
        </div>

        {/* moving sweep highlight */}
        <div className="pointer-events-none absolute inset-3 rounded-[10px] overflow-hidden opacity-60 mix-blend-screen">
          <div className="absolute -inset-x-6 -top-16 h-16 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.09),rgba(255,255,255,0))] blur-[2px] animate-sweep" />
        </div>

        {phase === "intro" && (
          <div className="relative mx-auto max-w-xl px-6 py-10 text-center text-[#fbd3d3] animate-soft-wobble">
            <div className=" leading-tight uppercase text-[#ff2a2a] [text-shadow:0_0_10px_#ff2a2a80,0_0_30px_#ff2a2a50] drop-shadow-[0_0_6px_#ff2a2a80] tracking-[0.02em] text-5xl">
              <span className="pr-2 animate-blink">►</span> Travel & Learn
            </div>
            <div className="mt-3  text-[#ff9d9d] leading-snug opacity-95 text-[22px]">
              Pick a country, walk to places, practice with an AI native.
            </div>

            {/* Start Button — improved visuals & accessibility */}
            <button
              onClick={() => setPhase("world")}
              aria-label="Start"
              className="group relative mt-8 inline-flex items-center justify-center px-8 py-3 uppercase text-[18px] tracking-[0.08em] text-[#2a0b0b] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ff2a2acc] active:translate-y-[2px]"
            >
              {/* animated neon border */}
              {/* <span className="absolute inset-0 rounded-[12px] border-[4px] border-[#ff2a2a] shadow-[8px_8px_0_#690a0a,0_0_24px_#ff2a2a99_inset] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude] p-[3px] before:absolute before:inset-[-35%] before:rounded-[18px] before:bg-[conic-gradient(from_var(--ang),#ff2a2a,transparent_55%,#ff2a2a)] before:opacity-60 before:blur-[16px] before:animate-spin-slow" /> */}

              {/* button plate */}
              <span className="relative z-10 px-8 py-2 rounded-[10px] bg-[linear-gradient(180deg,#ff7a7a_0%,#ff2a2a_58%,#c61c1c_100%)] shadow-[inset_0_-3px_0_#b81b1b,0_10px_0_#690a0a] transition-all duration-150 will-change-transform group-hover:translate-y-[1px] group-hover:shadow-[inset_0_-3px_0_#b81b1b,0_8px_0_#690a0a]">
                Start
                <span className="inline-block translate-y-[1px] pl-2 group-hover:translate-x-1 transition-transform duration-150">
                  ►
                </span>
              </span>

              {/* sheen */}
              <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[12px]">
                <span className="absolute -top-10 left-0 right-0 h-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0))] opacity-70 blur-[2px] transition-transform duration-700 group-hover:translate-y-[160%]" />
              </span>

              {/* ripple */}
              <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[12px]">
                <span className="absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 group-active:animate-ripple" />
              </span>
            </button>

            {/* hint chips */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[14px] text-[#ff9d9d]">
              {[
                ["←", "Navigate"],
                ["→", "Navigate"],
                ["ENTER", "Start"],
              ].map(([key, label]) => (
                <span
                  key={key}
                  className="px-2 py-1 border-[3px] border-[#ff2a2a] bg-[#1a0b0b] shadow-[3px_3px_0_#4d0a0a] animate-chip-shimmer"
                  title={label}
                >
                  {key}
                </span>
              ))}
            </div>

            {/* bottom marquee */}
            <div className="mt-5 text-[12px] text-[#ffb1b1] opacity-90 overflow-hidden">
              <div className="whitespace-nowrap animate-marquee will-change-transform text-2xl">
                ★ Tip: press ENTER to start • Roam places • Meet locals • Unlock
                phrases • Level up your accent • ★
              </div>
            </div>
          </div>
        )}

        {phase === "world" && (
          <div className="relative w-full h-full flex items-center justify-center px-6">
            {/* subtle grid glow */}
            <div className="pointer-events-none absolute inset-3 rounded-[10px] opacity-25 bg-[radial-gradient(circle_at_50%_0%,#ff2a2a22,transparent_60%)]" />
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <CountrySelect onChoose={(country) => onSelect(country)} />
            </div>
          </div>
        )}

        {/* footer status bar */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[14px] text-[#ff9d9d]">
          <span className="px-2 py-1 border-[3px] border-[#ff2a2a] bg-[#1a0b0b] shadow-[3px_3px_0_#4d0a0a]">
            {phase === "intro" ? "PRESS START" : "SELECT COUNTRY"}
          </span>
          <span className="px-2 py-1 border-[3px] border-[#ff2a2a] bg-[#1a0b0b] shadow-[3px_3px_0_#4d0a0a] animate-blink">
            v1.1 • CRT MODE
          </span>
        </div>
      </div>

      {/* starfield / dust */}
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen">
        {[
          { l: "left-[8%]", t: "top-[12%]", d: "0ms" },
          { l: "left-[30%]", t: "top-[18%]", d: "120ms" },
          { l: "left-[54%]", t: "top-[60%]", d: "260ms" },
          { l: "left-[72%]", t: "top-[32%]", d: "420ms" },
          { l: "left-[44%]", t: "bottom-[12%]", d: "620ms" },
        ].map((s, i) => (
          <div
            key={i}
            className={`absolute ${s.l} ${s.t} w-1 h-1 rounded-full bg-[#ff2a2a] blur-[1px] animate-drift`}
            style={{ animationDelay: s.d as unknown as string }}
          />
        ))}
      </div>

      {/* retro helper classes + font import */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=VT323&display=swap");

        /* ---- keyframes ---- */
        @keyframes crtFlicker {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.98;
          }
          60% {
            opacity: 0.94;
          }
        }
        @keyframes crtWarp {
          0%,
          100% {
            transform: perspective(900px) rotateX(0.4deg);
          }
          50% {
            transform: perspective(900px) rotateX(0.7deg);
          }
        }
        @keyframes scanlines {
          0% {
            background-position-y: 0;
          }
          100% {
            background-position-y: 4px;
          }
        }
        @keyframes staticNoise {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-2%);
          }
        }
        @keyframes sweep {
          0% {
            transform: translateY(-140%);
          }
          100% {
            transform: translateY(200%);
          }
        }
        @keyframes softWobble {
          0%,
          100% {
            transform: translateZ(0) rotate(-0.15deg);
          }
          50% {
            transform: translateZ(0) rotate(0.15deg);
          }
        }
        @keyframes blink {
          0%,
          60% {
            opacity: 1;
          }
          61%,
          80% {
            opacity: 0.25;
          }
          81%,
          100% {
            opacity: 1;
          }
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes ripple {
          from {
            width: 0;
            height: 0;
            opacity: 0.4;
          }
          to {
            width: 600px;
            height: 600px;
            opacity: 0;
          }
        }
        @keyframes spinSlow {
          from {
            --ang: 0deg;
          }
          to {
            --ang: 360deg;
          }
        }
        @keyframes drift {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.9;
          }
          50% {
            transform: translateY(-6px) translateX(2px);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.9;
          }
        }
        @keyframes chipShimmer {
          0% {
            box-shadow: 3px 3px 0 #4d0a0a, inset 0 0 0 0 rgba(255, 255, 255, 0);
          }
          50% {
            box-shadow: 3px 3px 0 #4d0a0a,
              inset 0 0 8px 0 rgba(255, 255, 255, 0.08);
          }
          100% {
            box-shadow: 3px 3px 0 #4d0a0a, inset 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }
        @keyframes crtFade {
          0%,
          100% {
            opacity: 0.07;
          }
          50% {
            opacity: 0.12;
          }
        }

        /* ---- utility classes ---- */
        .crt-flicker {
          animation: crtFlicker 3.6s infinite steps(60);
        }
        .crt-warp {
          animation: crtWarp 10s ease-in-out infinite;
        }
        .animate-scanlines {
          animation: scanlines 0.8s linear infinite;
        }
        .animate-static {
          animation: staticNoise 2.5s linear infinite alternate;
        }
        .animate-sweep {
          animation: sweep 3.5s ease-in-out infinite;
        }
        .animate-soft-wobble {
          animation: softWobble 6s ease-in-out infinite;
        }
        .animate-blink {
          animation: blink 1.6s steps(2, end) infinite;
        }
        .animate-marquee {
          animation: marquee 16s linear infinite;
        }
        .animate-ripple {
          animation: ripple 0.7s ease-out forwards;
        }
        .animate-chip-shimmer {
          animation: chipShimmer 2.8s ease-in-out infinite;
        }
        .animate-crt-fade {
          animation: crtFade 4s ease-in-out infinite;
        }
        .animate-drift {
          animation: drift 4s ease-in-out infinite;
        }
        .animate-spin-slow::before {
          animation: spinSlow 6s linear infinite;
        }
      `}</style>
    </div>
  );
}
