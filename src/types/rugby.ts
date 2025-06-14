export interface Player {
  id: string;
  number: number;
  team: 'my-team' | 'opponent';
  x: number;
  y: number;
}

export interface Marker {
  index: number;
  x: number;
  y: number;
}

export interface Position {
  name: string;
  players: Player[];
}

export interface LineSettings {
  width: number;
  color: string;
}

export interface BoardSettings {
  showLines: boolean;
  showNumbers: boolean;
}

export interface DrawPath {
  x: number;
  y: number;
  width: number;
  color: string;
}
