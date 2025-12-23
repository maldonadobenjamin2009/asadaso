
export enum GameScreen {
  MENU = 'MENU',
  GAME = 'GAME',
  ALMANAC_PLANTS = 'ALMANAC_PLANTS',
  ALMANAC_ZOMBIES = 'ALMANAC_ZOMBIES',
  OPTIONS = 'OPTIONS',
  SEED_SELECTION = 'SEED_SELECTION',
}

export type Language = 'EN' | 'ES';

export enum LevelType {
  DAY = 'DAY',
  NIGHT = 'NIGHT',
  POOL_DAY = 'POOL_DAY',
  POOL_NIGHT = 'POOL_NIGHT',
  ROOF_DAY = 'ROOF_DAY',
  ROOF_NIGHT = 'ROOF_NIGHT',
}

export interface PlantDef {
  id: string;
  name: string;
  cost: number;
  hp: number;
  cooldown: number; // in frames
  emoji: string;
  color: string;
  isAquatic?: boolean; // For pool
  needsPot?: boolean; // Not used directly in logic but implied for all non-pots on roof
  isPot?: boolean;
  isNight?: boolean; // Mushrooms
  damage?: number;
  fireRate?: number;
  description: string;
  isInternal?: boolean; // If true, not shown in Almanac or Seed Selection
}

export interface ZombieDef {
  id: string;
  name: string;
  hp: number;
  speed: number;
  emoji: string;
  color: string;
  description: string;
}

export interface GridCell {
  row: number;
  col: number;
  x: number;
  y: number;
  type: 'GRASS' | 'WATER' | 'ROOF';
  plant: PlantInstance | null;
  pumpkin: PlantInstance | null; // For stacking (not fully implemented in prototype, but placeholder)
  environment: PlantInstance | null; // For Lilypad/Pot
}

export interface PlantInstance {
  id: string; // uuid
  defId: string;
  hp: number;
  maxHp: number;
  row: number;
  col: number;
  x: number;
  y: number;
  lastActionFrame: number; // For shooting
  sunProductionTimer?: number; // Specific timer for sun producers
  age: number; // For Sun-shroom growth
  isBig?: boolean; // For Sun-shroom
  ready: boolean; // e.g. Potato mine arming
  
  // Chomper Specific
  isChewing?: boolean;
  digestTimer?: number;

  // Mushroom Sleep
  isAsleep?: boolean;

  // Doom-shroom Specific
  craterTimer?: number; // If > 0, this is a crater

  // Scaredy-shroom Specific
  isHiding?: boolean;

  // Grave Buster Specific
  busterTimer?: number;
}

export interface ZombieInstance {
  id: string;
  defId: string;
  hp: number;
  maxHp: number;
  row: number;
  x: number;
  y: number;
  speed: number;
  isEating: boolean;
  frozen: number; // frames (slowed)
  fullFreezeTimer?: number; // frames (completely stopped - Ice Shroom)
  isHeadless: boolean;
  waveIndex: number; // Which wave did this zombie belong to?
  
  // Hypno-shroom
  isHypnotized?: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  startX: number; // To calculate distance traveled
  row: number;
  damage: number;
  speed: number;
  type: 'PEA' | 'SPORE' | 'CABBAGE' | 'FUME' | 'FIREBALL';
  effect?: 'FREEZE'; // Snow pea effect
  hitZombieIds?: string[]; // For piercing projectiles (Fume-shroom)
}

export interface Sun {
  id: string;
  x: number;
  y: number;
  targetY: number;
  value: number;
  life: number; // frames before disappearing
}

export const CELL_SIZE = 80;
export const GRID_OFFSET_X = 220;
export const GRID_OFFSET_Y = 100;
export const COLS = 9;
export const ROWS = 6; // Max rows (Pool uses 6)
