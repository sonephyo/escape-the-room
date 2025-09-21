import { Position, Building } from '../types';

export const checkCollision = (
  playerPos: Position,
  playerSize: number,
  buildings: Building[]
): boolean => {
  const playerLeft = playerPos.x - playerSize / 2;
  const playerRight = playerPos.x + playerSize / 2;
  const playerTop = playerPos.y - playerSize / 2;
  const playerBottom = playerPos.y + playerSize / 2;

  return buildings.some(building => {
    const buildingLeft = building.position.x;
    const buildingRight = building.position.x + building.width;
    const buildingTop = building.position.y;
    const buildingBottom = building.position.y + building.height;

    return !(
      playerRight < buildingLeft ||
      playerLeft > buildingRight ||
      playerBottom < buildingTop ||
      playerTop > buildingBottom
    );
  });
};

export const isWithinBounds = (
  position: Position,
  size: number,
  bounds: { width: number; height: number; minX: number; minY: number; maxX: number; maxY: number }
): boolean => {
  const halfSize = size / 2;
  return (
    position.x - halfSize >= bounds.minX &&
    position.x + halfSize <= bounds.maxX &&
    position.y - halfSize >= bounds.minY &&
    position.y + halfSize <= bounds.maxY
  );
};