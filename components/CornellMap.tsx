"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Character } from "./Character";
import { Building } from "./Building";
import { Tree } from "./Tree";
import { Path } from "./Path";
import { AgentMarker } from "./AgentMarker";
import { PuzzleModal } from "./PuzzleModal";
import { AkoolChatModal } from "./AkoolChatModal";

import { useKeyboard } from "../hooks/useKeyboard";
import { checkCollision, isWithinBounds } from "../utils/collision";
import {
  CORNELL_BUILDINGS,
  TREES,
  PATHS,
  MAP_BOUNDS,
} from "../data/cornellMap";
import {
  Character as CharacterType,
  Position,
  Building as BuildingType,
} from "../types";
import type { ServerCharacter } from "../types/server";

type CornellMapProps = {
  n: number;
  characters: ServerCharacter[];
};

const MOVE_SPEED = 5;
const CHARACTER_SIZE = 24;

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;

const INTERACT_RADIUS = 42; // px from building center to trigger modal

// Map various backend building strings → our canonical IDs
const BUILDING_ID_MAP: Record<string, string> = {
  "goldwin smith hall": "goldwin-smith",
  "goldwin-smith hall": "goldwin-smith",
  "goldwin-smith": "goldwin-smith",

  "uris hall": "uris-hall",
  "white hall": "white-hall",
  "lincoln hall": "lincoln-hall",
  "mcgraw hall": "mcgraw-hall",

  "olin library": "olin-library",
  "uris library": "uris-library-clock",
  "uris library & clocktower": "uris-library-clock",
  "uris library and clocktower": "uris-library-clock",

  "baker laboratory": "baker-lab",
  "baker lab": "baker-lab",
  "space sciences building": "space-sciences",
  "statler hall": "statler-hall",
};

const NEAR_PAD = 36; // tweak 24–48 to taste

function isNearBuilding(
  px: number,
  py: number,
  b: BuildingType,
  pad = NEAR_PAD
): boolean {
  const left = b.position.x - pad;
  const right = b.position.x + b.width + pad;
  const top = b.position.y - pad;
  const bottom = b.position.y + b.height + pad;
  return px >= left && px <= right && py >= top && py <= bottom;
}

function normalizeBuildingId(raw?: string): string | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  if (BUILDING_ID_MAP[key]) return BUILDING_ID_MAP[key];
  // if backend already sends the id
  const direct = CORNELL_BUILDINGS.find((b) => b.id === key);
  return direct ? direct.id : null;
}

function centerOf(b: BuildingType): Position {
  return { x: b.position.x + b.width / 2, y: b.position.y + b.height / 2 };
}

function buildingCenters(): Position[] {
  return CORNELL_BUILDINGS.map(centerOf);
}

function adaptServerToCharacter(
  sc: ServerCharacter,
  fallback: Position
): CharacterType {
  const pos = sc.position ?? fallback;
  return {
    position: { x: pos.x, y: pos.y },
    direction: "down",
    isMoving: false,
  };
}

type AgentOnMap = {
  server: ServerCharacter;
  building: BuildingType;
  position: Position; // where to render the marker (building center)
  solved: boolean;
};

export const CornellMap: React.FC<CornellMapProps> = ({ n, characters }) => {
  // Player character (keyboard-controlled)
  const [character, setCharacter] = useState<CharacterType>({
    position: { x: 100, y: 100 },
    direction: "right",
    isMoving: false,
  });

  // Build agent placement from backend
  const agents: AgentOnMap[] = useMemo(() => {
    // Prefer explicit building mapping; otherwise fall back to building centers round-robin
    const centers = buildingCenters();
    const chosen = characters.slice(0, n);

    const placed: AgentOnMap[] = [];

    // First pass: those with recognizable buildings
    for (const sc of chosen) {
      const bid = normalizeBuildingId(sc.building);
      const b = CORNELL_BUILDINGS.find((x) => x.id === bid);
      if (b) {
        placed.push({
          server: sc,
          building: b,
          position: centerOf(b),
          solved: false,
        });
      }
    }

    // Second pass: those without a valid building → place round-robin at remaining buildings
    const remaining = chosen.filter(
      (sc) => !placed.some((p) => p.server.id === sc.id)
    );
    let idx = 0;
    for (const sc of remaining) {
      const b = CORNELL_BUILDINGS[idx % CORNELL_BUILDINGS.length];
      placed.push({
        server: sc,
        building: b,
        position: centerOf(b),
        solved: false,
      });
      idx += 1;
    }

    return placed;
  }, [characters, n]);

  // After agents are computed:
  const [snoozed, setSnoozed] = useState<Record<string, boolean>>({});

  // Reset snoozed whenever the agents list changes
  useEffect(() => {
    const init: Record<string, boolean> = {};
    for (const a of agents) init[a.server.id] = false;
    setSnoozed(init);
  }, [agents]);

  // Track solve state locally (id → solved)
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  useEffect(() => {
    // Reset solved state when agents list changes
    const initial: Record<string, boolean> = {};
    for (const a of agents) initial[a.server.id] = false;
    setSolved(initial);
  }, [agents]);

  // Modal state
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const activeAgent = useMemo(
    () => agents.find((a) => a.server.id === activeAgentId) ?? null,
    [agents, activeAgentId]
  );

  const keys = useKeyboard();

  const moveCharacter = useCallback(() => {
    const newPosition: Position = { ...character.position };
    let newDirection = character.direction;
    let isMoving = false;

    if (keys["w"] || keys["arrowup"]) {
      newPosition.y -= MOVE_SPEED;
      newDirection = "up";
      isMoving = true;
    }
    if (keys["s"] || keys["arrowdown"]) {
      newPosition.y += MOVE_SPEED;
      newDirection = "down";
      isMoving = true;
    }
    if (keys["a"] || keys["arrowleft"]) {
      newPosition.x -= MOVE_SPEED;
      newDirection = "left";
      isMoving = true;
    }
    if (keys["d"] || keys["arrowright"]) {
      newPosition.x += MOVE_SPEED;
      newDirection = "right";
      isMoving = true;
    }

    if (
      isMoving &&
      isWithinBounds(newPosition, CHARACTER_SIZE, MAP_BOUNDS) &&
      !checkCollision(newPosition, CHARACTER_SIZE, CORNELL_BUILDINGS)
    ) {
      setCharacter({
        position: newPosition,
        direction: newDirection,
        isMoving,
      });
    } else if (character.isMoving !== isMoving) {
      setCharacter((prev) => ({ ...prev, isMoving }));
    }
  }, [keys, character]);

  useEffect(() => {
    const gameLoop = setInterval(moveCharacter, 16);
    return () => clearInterval(gameLoop);
  }, [moveCharacter]);

  // Camera centered on player, clamped to map bounds
  const rawCamX = character.position.x - VIEWPORT_WIDTH / 2;
  const rawCamY = character.position.y - VIEWPORT_HEIGHT / 2;
  const maxCamX = Math.max(0, MAP_BOUNDS.width - VIEWPORT_WIDTH);
  const maxCamY = Math.max(0, MAP_BOUNDS.height - VIEWPORT_HEIGHT);
  const cameraX = Math.min(Math.max(rawCamX, 0), maxCamX);
  const cameraY = Math.min(Math.max(rawCamY, 0), maxCamY);

  // When player approaches an agent’s building, open the puzzle (if not solved)
  useEffect(() => {
    const px = character.position.x + CHARACTER_SIZE / 2;
    const py = character.position.y + CHARACTER_SIZE / 2;

    setSnoozed((prev) => {
      let next: Record<string, boolean> | null = null;
      for (const a of agents) {
        const near = isNearBuilding(px, py, a.building);
        // If it was snoozed and we've LEFT the area, re-arm (set false)
        if (prev[a.server.id] && !near) {
          if (!next) next = { ...prev };
          next[a.server.id] = false;
        }
      }
      return next ?? prev;
    });
  }, [character.position.x, character.position.y, agents]);

  useEffect(() => {
    if (activeAgentId) return; // don’t re-open while a modal is up

    const px = character.position.x + CHARACTER_SIZE / 2;
    const py = character.position.y + CHARACTER_SIZE / 2;

    for (const a of agents) {
      if (solved[a.server.id]) continue; // already solved
      if (snoozed[a.server.id]) continue; // closed, not re-armed yet

      if (isNearBuilding(px, py, a.building)) {
        setActiveAgentId(a.server.id);
        break;
      }
    }
  }, [
    character.position.x,
    character.position.y,
    agents,
    solved,
    snoozed,
    activeAgentId,
  ]);

  // const closeModal = () => setActiveAgentId(null);
  const closeModal = () => {
    if (activeAgent) {
      // mark this agent as snoozed until we exit its area
      setSnoozed((prev) => ({ ...prev, [activeAgent.server.id]: true }));
    }
    setActiveAgentId(null);
  };

  const handleSubmitAnswer = (answer: string) => {
    if (!activeAgent) return { correct: false, message: "No active puzzle." };
    const expected = (activeAgent.server.solution ?? "").trim().toLowerCase();
    const got = answer.trim().toLowerCase();

    // quick exact match; you can add synonyms or regex here later
    const ok = expected.length > 0 ? got === expected : true;

    if (ok) {
      setSolved((prev) => ({ ...prev, [activeAgent.server.id]: true }));
      return { correct: true, message: "✅ Correct! Puzzle solved." };
    }
    return { correct: false, message: "❌ Not quite. Try again!" };
  };

  // const handleChat = () => {
  //   // Placeholder for future chat logic
  //   alert(`Chat with ${activeAgent?.server.name ?? 'Agent'} coming soon.`);
  // };
  const [chatOpen, setChatOpen] = useState(false);
  const [chatAgent, setChatAgent] = useState<null | {
    server: ServerCharacter;
    buildingName?: string;
  }>(null);

  const handleChat = () => {
    if (!activeAgent) return;
    setChatAgent({
      server: activeAgent.server,
      buildingName: activeAgent.building.name,
    });
    setChatOpen(true);
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative flex items-center justify-center">
      {/* Fixed-size viewport */}
      <div
        className="relative border-4 border-gray-600 shadow-2xl"
        style={{
          width: VIEWPORT_WIDTH,
          height: VIEWPORT_HEIGHT,
          overflow: "hidden",
          position: "relative",
          background: "black",
        }}
      >
        {/* World layer that moves with camera */}
        <div
          className="absolute"
          style={{
            width: MAP_BOUNDS.width,
            height: MAP_BOUNDS.height,
            transform: `translate3d(${-cameraX}px, ${-cameraY}px, 0)`,
            transition: "transform 0.05s linear",
            willChange: "transform",
            backgroundImage: "url('/assets/campus_map.png')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Visual elements removed - using background image instead */}

          {/* Agent markers at building centers */}
          {agents.map((a) => (
            <AgentMarker
              key={a.server.id}
              position={a.position}
              color={solved[a.server.id] ? "#22c55e" : "#ffffff"}
            />
          ))}

          {/* Player */}
          <Character character={character} />
        </div>

        {/* HUD */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
          <div
            className="bg-black text-white px-4 py-2 border-2 border-white"
            style={{
              fontFamily: "monospace",
              fontSize: "16px",
              imageRendering: "pixelated",
              fontWeight: "bold",
            }}
          >
            CORNELL UNIVERSITY
          </div>
        </div>

        <div className="absolute top-4 right-4 z-30">
          <div
            className="bg-black text-white px-3 py-1 border-2 border-white"
            style={{
              fontFamily: "monospace",
              fontSize: "12px",
              imageRendering: "pixelated",
            }}
          >
            Agents: {n} • Solved: {Object.values(solved).filter(Boolean).length}
            /{agents.length}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 border-2 border-white">
        <p
          className="text-center"
          style={{
            fontFamily: "monospace",
            fontSize: "12px",
            imageRendering: "pixelated",
          }}
        >
          Walk near a building with a marker to meet an agent • WASD / Arrow
          Keys to move
        </p>
      </div>

      {/* Puzzle Modal */}
      <PuzzleModal
        open={Boolean(activeAgent)}
        agentId={activeAgent?.server.id ?? "none"}
        onClose={closeModal}
        agentName={activeAgent?.server.name ?? "Agent"}
        buildingName={activeAgent?.building.name ?? "Building"}
        puzzle={activeAgent?.server.puzzle ?? "No puzzle provided."}
        onSubmit={handleSubmitAnswer}
        onChat={handleChat}
      />
      
      <AkoolChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        agent={chatAgent ?? { server: { id: "none", name: "Agent" } as any }}
      />
    </div>
  );
};
