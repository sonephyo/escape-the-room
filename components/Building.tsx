import React, { useState } from 'react';
import { Building as BuildingType } from '../types';

interface BuildingProps {
  building: BuildingType;
}

export const Building: React.FC<BuildingProps> = ({ building }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getBuildingStyle = () => {
    const baseStyle = {
      left: building.position.x,
      top: building.position.y,
      width: building.width,
      height: building.height,
    };

    if (building.type === 'tower') {
      return {
        ...baseStyle,
        background: `linear-gradient(45deg, 
          #8B4513 0%, #8B4513 25%, 
          #A0522D 25%, #A0522D 50%, 
          #8B4513 50%, #8B4513 75%, 
          #A0522D 75%, #A0522D 100%)`,
        backgroundSize: '8px 8px',
        border: '2px solid #654321',
        borderRadius: '2px',
      };
    }

    if (building.type === 'library') {
      return {
        ...baseStyle,
        background: `linear-gradient(to bottom, 
          #CD853F 0%, #CD853F 20%, 
          #8B7355 20%, #8B7355 40%,
          #CD853F 40%, #CD853F 60%,
          #8B7355 60%, #8B7355 80%,
          #CD853F 80%, #CD853F 100%)`,
        border: '2px solid #8B7355',
        borderRadius: '2px',
      };
    }

    return {
      ...baseStyle,
      background: `linear-gradient(to bottom, 
        ${building.color} 0%, ${building.color} 70%, 
        ${building.color}CC 70%, ${building.color}CC 100%)`,
      border: '2px solid #333',
      borderRadius: '2px',
    };
  };

  return (
    <>
      <div
        className={`absolute cursor-pointer transition-all duration-200 ${
          isHovered ? 'z-20 brightness-110' : 'z-10'
        }`}
        style={getBuildingStyle()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Building roof */}
        <div 
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-full h-2"
          style={{
            background: 'linear-gradient(to right, #666 0%, #888 50%, #666 100%)',
            clipPath: 'polygon(10% 100%, 50% 0%, 90% 100%)',
          }}
        />
        
        {/* Windows */}
        <div className="absolute inset-2 grid grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-blue-200 border border-blue-400"
              style={{ 
                width: '6px', 
                height: '6px',
                imageRendering: 'pixelated'
              }}
            />
          ))}
        </div>

        {/* Door */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-amber-800 border border-amber-900"
          style={{ width: '8px', height: '12px' }}
        />
      </div>
      
      {/* Name label */}
      <div
        className={`absolute bg-black text-white px-2 py-1 text-xs font-bold rounded transition-opacity duration-200 pointer-events-none z-30 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: building.position.x + building.width / 2,
          top: building.position.y - 25,
          transform: 'translateX(-50%)',
          fontFamily: 'monospace',
          fontSize: '10px',
        }}
      >
        {building.name}
      </div>
    </>
  );
};