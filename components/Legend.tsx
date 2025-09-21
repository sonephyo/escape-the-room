import React from 'react';

export const Legend: React.FC = () => {
  return (
    <div className="absolute top-4 right-4 bg-black text-white border-2 border-white p-3 max-w-48">
      <div 
        className="text-xs mb-2 font-bold"
        style={{ fontFamily: 'monospace', imageRendering: 'pixelated' }}
      >
        CAMPUS LEGEND
      </div>
      <div className="space-y-1 text-xs" style={{ fontFamily: 'monospace' }}>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-600 border border-white"></div>
          <span>Admin Buildings</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 border border-white"></div>
          <span>Engineering</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-600 border border-white"></div>
          <span>Libraries</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-600 border border-white"></div>
          <span>Trees</span>
        </div>
      </div>
    </div>
  );
};