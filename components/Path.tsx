import React from 'react';

interface PathProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Path: React.FC<PathProps> = ({ x, y, width, height }) => {
  return (
    <div
      className="absolute z-0"
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        background: `repeating-linear-gradient(
          45deg,
          #D2B48C,
          #D2B48C 4px,
          #DEB887 4px,
          #DEB887 8px
        )`,
        border: '1px solid #CD853F',
        imageRendering: 'pixelated',
      }}
    />
  );
};