export interface Position {
  x: number;
  y: number;
}

export interface Building {
  id: string;
  name: string;
  position: Position;
  width: number;
  height: number;
  color: string;
  description?: string;
  type: 'building' | 'library' | 'tower';
}

export interface Character {
  position: Position;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
}