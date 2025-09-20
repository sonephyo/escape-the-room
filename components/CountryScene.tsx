"use client";

import React, { useEffect, useMemo, useState } from "react";
import { COUNTRIES, type CountryKey, scaleHotspots } from "@/game/countries";
import { useKeyboard } from "@/hooks/useKeyboard";
import { Character as CharacterSprite } from "@/components/Character";
import { AkoolChatModal } from "@/components/AkoolChatModal";

const SPEED = 5;
const SIZE = 24;
const VIEW_W = 800;
const VIEW_H = 600;

export function CountryScene({ country }: { country: CountryKey }) {
  const cfg = COUNTRIES[country];

  // World size = image natural size (optionally clamped)
  const [world, setWorld] = useState({ w: 1920, h: 1080 });
  useEffect(() => {
    const img = new Image();
    img.src = cfg.bg;
    img.onload = () => {
      const maxW = 2560; // clamp very large maps
      const s = Math.min(1, maxW / img.naturalWidth);
      setWorld({
        w: Math.round(img.naturalWidth * s),
        h: Math.round(img.naturalHeight * s),
      });
    };
  }, [cfg.bg]);

  // Hotspots in world coords
  const hotspots = useMemo(
    () => scaleHotspots(cfg, world.w, world.h),
    [cfg, world]
  );

  // Player position = TOP-LEFT (matches Character component contract)
  const [player, setPlayer] = useState({
    x: Math.round(world.w / 2 - SIZE / 2),
    y: Math.round(world.h / 2 - SIZE / 2),
    dir: "down",
    moving: false,
  });
  useEffect(() => {
    setPlayer((p) => ({
      ...p,
      x: Math.round(world.w / 2 - SIZE / 2),
      y: Math.round(world.h / 2 - SIZE / 2),
    }));
  }, [world.w, world.h]);

  const keys = useKeyboard();

  // Movement in world coords
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setPlayer((prev) => {
        let { x, y, dir } = prev;
        let moving = false;

        if (keys["w"] || keys["arrowup"]) {
          y -= SPEED;
          dir = "up";
          moving = true;
        }
        if (keys["s"] || keys["arrowdown"]) {
          y += SPEED;
          dir = "down";
          moving = true;
        }
        if (keys["a"] || keys["arrowleft"]) {
          x -= SPEED;
          dir = "left";
          moving = true;
        }
        if (keys["d"] || keys["arrowright"]) {
          x += SPEED;
          dir = "right";
          moving = true;
        }

        // Clamp to world (top-left convention)
        x = Math.max(0, Math.min(world.w - SIZE, x));
        y = Math.max(0, Math.min(world.h - SIZE, y));

        if (
          x === prev.x &&
          y === prev.y &&
          prev.moving === moving &&
          prev.dir === dir
        )
          return prev;
        return { x, y, dir, moving };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [keys, world.w, world.h]);

  // Camera from player CENTER, clamped to world
  const centerX = player.x + SIZE / 2;
  const centerY = player.y + SIZE / 2;
  const cameraX = Math.min(
    Math.max(centerX - VIEW_W / 2, 0),
    Math.max(0, world.w - VIEW_W)
  );
  const cameraY = Math.min(
    Math.max(centerY - VIEW_H / 2, 0),
    Math.max(0, world.h - VIEW_H)
  );

  // Chat trigger when center enters a hotspot
  const [chatOpen, setChatOpen] = useState(false);
  const [activeSpot, setActiveSpot] = useState<string | null>(null);
  useEffect(() => {
    const spot = hotspots.find(
      (h) => Math.hypot(h.x - centerX, h.y - centerY) <= h.radius
    );
    if (spot && activeSpot !== spot.id) {
      setActiveSpot(spot.id);
      setChatOpen(true);
    }
    if (!spot && activeSpot) setActiveSpot(null);
  }, [hotspots, centerX, centerY, activeSpot]);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative flex items-center justify-center p-4">
      {/* Fixed viewport */}
      <div
        className="relative border-4 border-gray-600 shadow-2xl bg-black overflow-hidden"
        style={{ width: VIEW_W, height: VIEW_H }}
      >
        {/* World layer (translated by camera) */}
        <div
          className="absolute will-change-transform"
          style={{
            left: 0,
            top: 0,
            width: world.w,
            height: world.h,
            transform: `translate3d(${-Math.trunc(cameraX)}px, ${-Math.trunc(
              cameraY
            )}px, 0)`,
            transition: "transform 0.05s linear",
            backgroundImage: `url(${cfg.bg})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top left",
          }}
        >
          {/* Hotspots */}
          {hotspots.map((h) => (
            <div
              key={h.id}
              className="absolute pointer-events-none"
              style={{
                left: h.x - h.radius,
                top: h.y - h.radius,
                width: h.radius * 2,
                height: h.radius * 2,
              }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: "rgba(16,185,129,0.28)",
                  border: "2px solid rgba(16,185,129,0.8)",
                }}
              />
              <div
                className="absolute -top-6 left-1/2 -translate-x-1/2 text-white text-xs"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
              >
                {h.label}
              </div>
            </div>
          ))}

          {/* Player — NO EXTRA WRAPPER, pass top-left to Character */}
          <CharacterSprite
            character={{
              position: { x: player.x, y: player.y },
              direction: player.dir as any,
              isMoving: player.moving,
            }}
          />

          {/* HUD (optional) */}
          <div className="absolute top-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
            {cfg.name} — walk into a glowing spot to practice
          </div>
        </div>
      </div>

      {/* Akool modal */}
      <AkoolChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        agent={{
          server: {
            id: activeSpot ?? "none",
            name: "Guide",
            description: `Practice in ${cfg.name}`,
          } as any,
          buildingName: activeSpot
            ? hotspots.find((h) => h.id === activeSpot)?.label
            : undefined,
        }}
      />
    </div>
  );
}
