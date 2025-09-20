import React from 'react';

export const Controls: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 bg-black text-white border-2 border-white p-3">
      <div 
        className="text-xs mb-2"
        style={{ fontFamily: 'monospace', imageRendering: 'pixelated' }}
      >
        CONTROLS
      </div>
      <div className="grid grid-cols-3 gap-1 w-20">
        <div></div>
        <div className="bg-gray-700 border border-white text-center text-xs py-1">↑</div>
        <div></div>
        <div className="bg-gray-700 border border-white text-center text-xs py-1">←</div>
        <div className="bg-gray-700 border border-white text-center text-xs py-1">↓</div>
        <div className="bg-gray-700 border border-white text-center text-xs py-1">→</div>
      </div>
      <div 
        className="text-xs mt-2"
        style={{ fontFamily: 'monospace' }}
      >
        or WASD
      </div>
    </div>
  );
};