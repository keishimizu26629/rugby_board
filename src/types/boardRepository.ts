import type { Position } from './rugby';

export interface BoardRepository {
  savePosition(_userId: string, _position: Position): Promise<void>;
  getPositions(_userId: string): Promise<Position[]>;
  deletePosition(_userId: string, _positionName: string): Promise<void>;
}
