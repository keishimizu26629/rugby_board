export interface Player {
  id?: string;
  number: number;
  x: number;
  y: number;
  zIndex?: number;
  team?: 'my-team' | 'opponent';
  isSelected?: boolean;
}

/**
 * 選択されたプレイヤーの情報
 */
export interface SelectedPlayer {
  id: string;
  teamIndex: number;
  playerIndex: number;
  order: number;
}

export interface Team {
  name: string;
}

export interface Position {
  name: string;
  players: Player[];
}

export interface Marker {
  x: number;
  y: number;
  index: number;
}

export interface BoardSettings {
  showLines: boolean;
  showNumbers: boolean;
}

export interface LineSettings {
  color: string;
  width: number;
}

export interface DrawingSettings {
  color: { label: string; value: string };
  width: { label: string; value: number };
}
