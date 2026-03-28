export type RotationSystem = '5-1' | '6-2';

export type PlayerRole = 'setter' | 'outside' | 'opposite' | 'middle' | 'libero' | 'ds';

export type RotationNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type Phase = 'serve' | 'receive' | 'transition';

export interface Player {
  id: string;
  name: string;
  number: number;
  role: PlayerRole;
  avatar: string;
}

export interface Team {
  name: string;
  system: RotationSystem;
  players: Player[];
  useLibero: boolean;
  variant?: VariantId;
}

export interface CourtPosition {
  x: number;
  y: number;
}

export interface PlayerPosition {
  playerId: string;
  role: PlayerRole;
  position: CourtPosition;
}

export interface ZoneArea {
  playerId: string;
  role: PlayerRole;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  isSubstituted?: boolean;
}

export interface RotationState {
  rotation: RotationNumber;
  phase: Phase;
  positions: PlayerPosition[];
  zones: ZoneArea[];
}

export type VariantId = 'standard' | 'spread' | 'slide' | 'reverse';

export type TokenDisplayMode = 'jersey' | 'role' | 'name';

export interface UserPreferences {
  tokenDisplayMode: TokenDisplayMode;
  learnMode: boolean;
  reduceMotion: boolean;
  courtFlipped: boolean;
  dismissedHelp: string[];
  onboardingSeen: boolean;
}
