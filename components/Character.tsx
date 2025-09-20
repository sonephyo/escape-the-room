import React from 'react';
import { Character as CharacterType } from '../types';

interface CharacterProps {
  character: CharacterType;
}

export const Character: React.FC<CharacterProps> = ({ character }) => {
  const getCharacterSprite = () => {
    const baseStyle = {
      width: '24px',
      height: '32px',
      imageRendering: 'pixelated' as const,
      background: 'linear-gradient(to bottom, #FFE4B5 0%, #FFE4B5 40%, #4169E1 40%, #4169E1 70%, #8B4513 70%, #8B4513 100%)',
      border: '1px solid #000',
      borderRadius: '2px',
      position: 'relative' as const,
    };

    return baseStyle;
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
      style={{
        left: character.position.x,
        top: character.position.y,
        transform: `translate(-50%, -50%) ${
          character.direction === 'left' ? 'scaleX(-1)' : ''
        }`,
      }}
    >
      <div style={getCharacterSprite()}>
        {/* Head */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-yellow-200 border border-black"
          style={{ width: '12px', height: '12px', borderRadius: '1px' }}
        />
        
        {/* Eyes */}
        <div 
          className="absolute bg-black"
          style={{ 
            top: '3px', 
            left: '7px', 
            width: '2px', 
            height: '2px' 
          }}
        />
        <div 
          className="absolute bg-black"
          style={{ 
            top: '3px', 
            left: '13px', 
            width: '2px', 
            height: '2px' 
          }}
        />

        {/* Body */}
        <div 
          className="absolute bg-red-600 border border-black"
          style={{ 
            top: '12px', 
            left: '4px', 
            width: '16px', 
            height: '12px' 
          }}
        />

        {/* Legs */}
        <div 
          className="absolute bg-blue-800 border border-black"
          style={{ 
            top: '24px', 
            left: '6px', 
            width: '5px', 
            height: '8px' 
          }}
        />
        <div 
          className="absolute bg-blue-800 border border-black"
          style={{ 
            top: '24px', 
            left: '13px', 
            width: '5px', 
            height: '8px' 
          }}
        />
      </div>

      {/* Shadow */}
      <div 
        className="absolute bg-black opacity-30 rounded-full"
        style={{
          bottom: '-2px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '16px',
          height: '6px',
        }}
      />
    </div>
  );
};