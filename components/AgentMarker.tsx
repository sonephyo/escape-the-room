'use client';

import React from 'react';
import type { Position } from '../types';

type AgentMarkerProps = {
  position: Position;
  color?: string;
};

export const AgentMarker: React.FC<AgentMarkerProps> = ({ position, color = '#ffffff' }) => {
  return (
    <div
      className="absolute rounded-full border-2 border-black"
      style={{
        left: position.x - 5,
        top: position.y - 5,
        width: 10,
        height: 10,
        background: color,
        boxShadow: '0 0 6px rgba(0,0,0,0.5)',
      }}
      title="Agent"
    />
  );
};
