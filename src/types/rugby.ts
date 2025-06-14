export interface Player {
  id?: string;
  number: number;
  x: number;
  y: number;
  zIndex: number;
}

export interface Team {
  name: string;
}

export interface Position {
  name: string;
  position: Record<string | number, Record<string | number, Player>>;
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
