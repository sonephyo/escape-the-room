import React from 'react';

interface TreeProps {
  x: number;
  y: number;
}

export const Tree: React.FC<TreeProps> = ({ x, y }) => {
  return (
    <div
      className="absolute z-5"
      style={{
        left: x,
        top: y,
        width: '32px',
        height: '40px',
      }}
    >
      {/* Tree crown */}
      <div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2"
        style={{
          width: '32px',
          height: '24px',
          background: 'radial-gradient(circle, #228B22 30%, #32CD32 60%, #90EE90 100%)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          border: '2px solid #006400',
          imageRendering: 'pixelated',
        }}
      />
      
      {/* Tree trunk */}
      <div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-amber-800 border-2 border-amber-900"
        style={{
          width: '8px',
          height: '16px',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};