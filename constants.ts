
import { LevelType, PlantDef, ZombieDef } from './types';

// --- ZOMBIES ---
// Speeds approx from doc (Normal ~0.23-0.37). Adjusted for playable 60fps feel.
export const ZOMBIES: Record<string, ZombieDef> = {
  NORMAL: { id: 'NORMAL', name: 'Zombie', hp: 200, speed: 0.25, emoji: '🧟', color: '#6b7280', description: 'A regular zombie.' },
  CONE: { id: 'CONE', name: 'Conehead', hp: 640, speed: 0.25, emoji: '🧟⚠️', color: '#f59e0b', description: 'Twice as tough as a normal zombie.' },
  BUCKET: { id: 'BUCKET', name: 'Buckethead', hp: 1370, speed: 0.25, emoji: '🧟🪣', color: '#9ca3af', description: 'Extremely resistant to damage.' },
};

// --- PLANTS ---
export const PLANTS: Record<string, PlantDef> = {
  PEASHOOTER: { id: 'PEASHOOTER', name: 'Peashooter', cost: 100, hp: 300, cooldown: 300, emoji: '🌱', color: '#4ade80', damage: 20, fireRate: 85, description: 'Shoots peas at zombies.' },
  SUNFLOWER: { id: 'SUNFLOWER', name: 'Sunflower', cost: 50, hp: 300, cooldown: 300, emoji: '🌻', color: '#facc15', description: 'Produces extra sun.' },
  CHERRY_BOMB: { id: 'CHERRY_BOMB', name: 'Cherry Bomb', cost: 150, hp: 300, cooldown: 1200, emoji: '🍒', color: '#ef4444', description: 'Explodes all zombies in an area.' },
  WALL_NUT: { id: 'WALL_NUT', name: 'Wall-nut', cost: 50, hp: 4000, cooldown: 1800, emoji: '🌰', color: '#a16207', description: 'Blocks zombies with its hard shell.' },
  POTATO_MINE: { id: 'POTATO_MINE', name: 'Potato Mine', cost: 25, hp: 300, cooldown: 1800, emoji: '🥔', color: '#b45309', damage: 1800, description: 'Explodes on contact, needs time to arm.' },
  SNOW_PEA: { id: 'SNOW_PEA', name: 'Snow Pea', cost: 175, hp: 300, cooldown: 300, emoji: '❄️', color: '#60a5fa', damage: 20, fireRate: 85, description: 'Shoots frozen peas that slow zombies.' },
  CHOMPER: { id: 'CHOMPER', name: 'Chomper', cost: 150, hp: 300, cooldown: 300, emoji: '🟣', color: '#7e22ce', description: 'Devours a zombie whole, vulnerable while chewing.' },
  REPEATER: { id: 'REPEATER', name: 'Repeater', cost: 200, hp: 300, cooldown: 300, emoji: '🌱🌱', color: '#16a34a', damage: 20, fireRate: 85, description: 'Fires two peas at a time.' },
  PUFF_SHROOM: { id: 'PUFF_SHROOM', name: 'Puff-shroom', cost: 0, hp: 300, cooldown: 300, emoji: '🍄', color: '#d8b4fe', damage: 20, fireRate: 85, isNight: true, description: 'Short-range shooter. Free.' },
  SUN_SHROOM: { id: 'SUN_SHROOM', name: 'Sun-shroom', cost: 25, hp: 300, cooldown: 300, emoji: '🍄🔆', color: '#fde047', isNight: true, description: 'Gives small sun at first, then normal sun.' },
  FUME_SHROOM: { id: 'FUME_SHROOM', name: 'Fume-shroom', cost: 75, hp: 300, cooldown: 300, emoji: '💨🍄', color: '#a855f7', damage: 20, fireRate: 85, isNight: true, description: 'Shoots fumes that pass through screen doors.' },
  GRAVE_BUSTER: { id: 'GRAVE_BUSTER', name: 'Grave Buster', cost: 75, hp: 300, cooldown: 300, emoji: '🪵', color: '#4b5563', isNight: true, description: 'Consumes graves.' },
  HYPNO_SHROOM: { id: 'HYPNO_SHROOM', name: 'Hypno-shroom', cost: 75, hp: 300, cooldown: 300, emoji: '😵‍💫', color: '#ec4899', isNight: true, description: 'Makes a zombie fight for you.' },
  SCAREDY_SHROOM: { id: 'SCAREDY_SHROOM', name: 'Scaredy-shroom', cost: 25, hp: 300, cooldown: 300, emoji: '😨', color: '#c084fc', damage: 20, fireRate: 85, isNight: true, description: 'Shoots from afar, hides when enemies close.' },
  ICE_SHROOM: { id: 'ICE_SHROOM', name: 'Ice-shroom', cost: 75, hp: 300, cooldown: 1200, emoji: '🧊', color: '#3b82f6', isNight: true, description: 'Freezes all zombies on screen.' },
  DOOM_SHROOM: { id: 'DOOM_SHROOM', name: 'Doom-shroom', cost: 125, hp: 300, cooldown: 1500, emoji: '💣', color: '#1f2937', isNight: true, description: 'Destroys everything in a large area.' },
  LILY_PAD: { id: 'LILY_PAD', name: 'Lily Pad', cost: 25, hp: 300, cooldown: 300, emoji: '🍃', color: '#10b981', isAquatic: true, description: 'Allows you to plant on water.' },
  SQUASH: { id: 'SQUASH', name: 'Squash', cost: 50, hp: 300, cooldown: 900, emoji: '😠', color: '#15803d', description: 'Smashes zombies near it.' },
  THREEPEATER: { id: 'THREEPEATER', name: 'Threepeater', cost: 325, hp: 300, cooldown: 300, emoji: '🌵', color: '#15803d', description: 'Shoots peas in three lanes.' },
  TANGLE_KELP: { id: 'TANGLE_KELP', name: 'Tangle Kelp', cost: 25, hp: 300, cooldown: 900, emoji: '🌿', color: '#065f46', isAquatic: true, description: 'Drags a zombie underwater.' },
  JALAPENO: { id: 'JALAPENO', name: 'Jalapeno', cost: 125, hp: 300, cooldown: 1200, emoji: '🌶️', color: '#dc2626', description: 'Destroys an entire lane of zombies.' },
  SPIKEWEED: { id: 'SPIKEWEED', name: 'Spikeweed', cost: 100, hp: 300, cooldown: 300, emoji: '⚙️', color: '#374151', description: 'Hurts zombies that walk over it.' },
  TORCHWOOD: { id: 'TORCHWOOD', name: 'Torchwood', cost: 175, hp: 300, cooldown: 300, emoji: '🪵🔥', color: '#ea580c', description: 'Peas that pass through turn into fireballs.' },
  TALL_NUT: { id: 'TALL_NUT', name: 'Tall-nut', cost: 125, hp: 8000, cooldown: 900, emoji: '🧱', color: '#78350f', description: 'Heavy duty wall.' },
  CACTUS: { id: 'CACTUS', name: 'Cactus', cost: 125, hp: 300, cooldown: 300, emoji: '🌵', color: '#166534', description: 'Pops balloon zombies.' },
  BLOVER: { id: 'BLOVER', name: 'Blover', cost: 100, hp: 300, cooldown: 300, emoji: '☘️', color: '#10b981', description: 'Blows away balloon zombies and fog.' },
  SPLIT_PEA: { id: 'SPLIT_PEA', name: 'Split Pea', cost: 125, hp: 300, cooldown: 300, emoji: '↔️', color: '#84cc16', description: 'Shoots forwards and backwards.' },
  STARFRUIT: { id: 'STARFRUIT', name: 'Starfruit', cost: 125, hp: 300, cooldown: 300, emoji: '⭐', color: '#fbbf24', description: 'Shoots stars in 5 directions.' },
  PUMPKIN: { id: 'PUMPKIN', name: 'Pumpkin', cost: 125, hp: 4000, cooldown: 900, emoji: '🎃', color: '#ea580c', description: 'Protects plants inside it.' },
  FLOWER_POT: { id: 'FLOWER_POT', name: 'Flower Pot', cost: 25, hp: 300, cooldown: 300, emoji: '🏺', color: '#92400e', isPot: true, description: 'Allows you to plant on the roof.' },
  CABBAGE_PULT: { id: 'CABBAGE_PULT', name: 'Cabbage-pult', cost: 100, hp: 300, cooldown: 300, emoji: '🥬', color: '#22c55e', damage: 40, fireRate: 100, description: 'Hurls cabbages at the enemy.' },
  KERNEL_PULT: { id: 'KERNEL_PULT', name: 'Kernel-pult', cost: 100, hp: 300, cooldown: 300, emoji: '🌽', color: '#facc15', description: 'Flings corn kernels and butter.' },
  COFFEE_BEAN: { id: 'COFFEE_BEAN', name: 'Coffee Bean', cost: 75, hp: 300, cooldown: 300, emoji: '☕', color: '#78350f', description: 'Wakes up sleeping mushrooms.' },
  GARLIC: { id: 'GARLIC', name: 'Garlic', cost: 50, hp: 300, cooldown: 300, emoji: '🧄', color: '#f3f4f6', description: 'Diverts zombies to other lanes.' },
  UMBRELLA_LEAF: { id: 'UMBRELLA_LEAF', name: 'Umbrella Leaf', cost: 100, hp: 300, cooldown: 300, emoji: '🍃☔', color: '#4ade80', description: 'Protects nearby plants from bungee zombies and catapults.' },
  MELON_PULT: { id: 'MELON_PULT', name: 'Melon-pult', cost: 300, hp: 300, cooldown: 300, emoji: '🍈', color: '#16a34a', description: 'Does heavy damage to groups of zombies.' },
  
  // INTERNAL USE ONLY
  CRATER: { id: 'CRATER', name: 'Crater', cost: 0, hp: 1000, cooldown: 0, emoji: '🕳️', color: '#000', description: 'A crater left by Doom-shroom.', isInternal: true },
  GRAVE: { id: 'GRAVE', name: 'Grave', cost: 0, hp: 1000, cooldown: 0, emoji: '🪦', color: '#4b5563', description: 'A grave that spawns zombies during the final wave.', isInternal: true },
};

export const LEVEL_CONFIGS: Record<LevelType, {
  rows: number;
  bg: string;
  backgroundImage?: string;
  waterTexture?: string;
  laneTypes: ('GRASS' | 'WATER' | 'ROOF')[];
  sunProduction: boolean; // Day levels
  isNight: boolean;
  fog: boolean;
}> = {
  [LevelType.DAY]: {
    rows: 5,
    bg: '#22c55e', // Green
    backgroundImage: 'https://i.pinimg.com/736x/c9/e7/15/c9e71547f5fa060ee55d31bec6b750c1.jpg',
    laneTypes: ['GRASS', 'GRASS', 'GRASS', 'GRASS', 'GRASS'],
    sunProduction: true,
    isNight: false,
    fog: false,
  },
  [LevelType.NIGHT]: {
    rows: 5,
    bg: '#1e1b4b', // Dark Indigo
    backgroundImage: 'https://i.pinimg.com/736x/c9/e7/15/c9e71547f5fa060ee55d31bec6b750c1.jpg',
    laneTypes: ['GRASS', 'GRASS', 'GRASS', 'GRASS', 'GRASS'],
    sunProduction: false,
    isNight: true,
    fog: false,
  },
  [LevelType.POOL_DAY]: {
    rows: 6,
    bg: '#22c55e',
    backgroundImage: 'https://i.pinimg.com/736x/c9/e7/15/c9e71547f5fa060ee55d31bec6b750c1.jpg',
    waterTexture: 'https://i.pinimg.com/736x/2b/02/4d/2b024d05a26db6772778b5a9e68f2198.jpg',
    laneTypes: ['GRASS', 'GRASS', 'WATER', 'WATER', 'GRASS', 'GRASS'],
    sunProduction: true,
    isNight: false,
    fog: false,
  },
  [LevelType.POOL_NIGHT]: {
    rows: 6,
    bg: '#1e1b4b',
    backgroundImage: 'https://i.pinimg.com/736x/c9/e7/15/c9e71547f5fa060ee55d31bec6b750c1.jpg',
    waterTexture: 'https://i.pinimg.com/736x/2b/02/4d/2b024d05a26db6772778b5a9e68f2198.jpg',
    laneTypes: ['GRASS', 'GRASS', 'WATER', 'WATER', 'GRASS', 'GRASS'],
    sunProduction: false,
    isNight: true,
    fog: true,
  },
  [LevelType.ROOF_DAY]: {
    rows: 5,
    bg: '#92400e', // Roof color
    backgroundImage: 'https://i.pinimg.com/1200x/f5/77/98/f57798b4c5100a6ade67827c9632160d.jpg',
    laneTypes: ['ROOF', 'ROOF', 'ROOF', 'ROOF', 'ROOF'],
    sunProduction: true,
    isNight: false,
    fog: false,
  },
  [LevelType.ROOF_NIGHT]: {
    rows: 5,
    bg: '#431407', // Dark Roof
    backgroundImage: 'https://i.pinimg.com/1200x/f5/77/98/f57798b4c5100a6ade67827c9632160d.jpg',
    laneTypes: ['ROOF', 'ROOF', 'ROOF', 'ROOF', 'ROOF'],
    sunProduction: false,
    isNight: true,
    fog: false,
  },
};

export const TRANSLATIONS: Record<string, any> = {
  EN: {
    TITLE: 'PLANTS VS. ZOMBIES',
    SUBTITLE: 'REACT PROTOTYPE EDITION',
    ADVENTURE_MODE: 'ADVENTURE MODE',
    EXTRAS: 'EXTRAS',
    OPTIONS: 'OPTIONS',
    ALMANAC_PLANTS: 'ALMANAC: PLANTS',
    ALMANAC_ZOMBIES: 'ALMANAC: ZOMBIES',
    SUBURBAN_ALMANAC: 'Suburban Almanac',
    SELECT_ENTRY: 'Select an entry to view details...',
    COST: 'Sun Cost',
    TOUGHNESS: 'Toughness',
    DAMAGE: 'Damage',
    RECHARGE: 'Recharge',
    SPEED: 'Speed',
    BACK_MENU: 'BACK TO MENU',
    SCORE: 'SCORE',
    GAME_OVER: 'THE ZOMBIES ATE YOUR BRAINS!',
    RETURN_MENU: 'RETURN TO MENU',
    INSTRUCTIONS: 'Use Mouse to collect sun and plant seeds.',
    CHOOSE_SEEDS: 'CHOOSE YOUR SEEDS',
    LETS_ROCK: "LET'S ROCK!",
    PAUSE: 'PAUSE',
    RESUME: 'RESUME',
    GAME_PAUSED: 'GAME PAUSED',
    QUIT_TO_MENU: 'QUIT TO MENU',
    HUGE_WAVE: 'A HUGE WAVE OF ZOMBIES IS APPROACHING!',
    
    // Level Names
    LEVEL_DAY: 'DAY',
    LEVEL_NIGHT: 'NIGHT',
    LEVEL_POOL: 'POOL',
    LEVEL_FOG: 'POOL (FOG)',
    LEVEL_ROOF: 'ROOF',
    LEVEL_ROOF_NIGHT: 'ROOF (NIGHT)',
    // Languages
    LANG_EN: 'ENGLISH 🇺🇸',
    LANG_ES: 'ESPAÑOL 🇪🇸',
  },
  ES: {
    TITLE: 'PLANTAS CONTRA ZOMBIS',
    SUBTITLE: 'EDICIÓN PROTOTIPO REACT',
    ADVENTURE_MODE: 'MODO AVENTURA',
    EXTRAS: 'EXTRAS',
    OPTIONS: 'OPCIONES',
    ALMANAC_PLANTS: 'ALMANAQUE: PLANTAS',
    ALMANAC_ZOMBIES: 'ALMANAQUE: ZOMBIS',
    SUBURBAN_ALMANAC: 'Almanaque Suburbano',
    SELECT_ENTRY: 'Selecciona una entrada para ver detalles...',
    COST: 'Coste de Sol',
    TOUGHNESS: 'Dureza',
    DAMAGE: 'Daño',
    RECHARGE: 'Recarga',
    SPEED: 'Velocidad',
    BACK_MENU: 'VOLVER AL MENÚ',
    SCORE: 'PUNTUACIÓN',
    GAME_OVER: '¡LOS ZOMBIS SE COMIERON TU CEREBRO!',
    RETURN_MENU: 'VOLVER AL MENÚ',
    INSTRUCTIONS: 'Usa el ratón para recoger sol y plantar semillas.',
    CHOOSE_SEEDS: 'ELIGE TUS SEMILLAS',
    LETS_ROCK: "¡A JUGAR!",
    PAUSE: 'PAUSA',
    RESUME: 'REANUDAR',
    GAME_PAUSED: 'JUEGO PAUSADO',
    QUIT_TO_MENU: 'SALIR AL MENÚ',
    HUGE_WAVE: '¡SE APROXIMA UNA GRAN HORDA DE ZOMBIS!',

    // Level Names
    LEVEL_DAY: 'DÍA',
    LEVEL_NIGHT: 'NOCHE',
    LEVEL_POOL: 'PISCINA',
    LEVEL_FOG: 'PISCINA (NIEBLA)',
    LEVEL_ROOF: 'TEJADO',
    LEVEL_ROOF_NIGHT: 'TEJADO (NOCHE)',
    // Languages
    LANG_EN: 'ENGLISH 🇺🇸',
    LANG_ES: 'ESPAÑOL 🇪🇸',
    
    // Plant Overrides
    PEASHOOTER_NAME: 'Lanzaguisantes', PEASHOOTER_DESC: 'Dispara guisantes a los zombis.',
    SUNFLOWER_NAME: 'Girasol', SUNFLOWER_DESC: 'Produce sol extra.',
    CHERRY_BOMB_NAME: 'Petacereza', CHERRY_BOMB_DESC: 'Explota todos los zombis en un área.',
    WALL_NUT_NAME: 'Nuez', WALL_NUT_DESC: 'Bloquea a los zombis con su cáscara dura.',
    POTATO_MINE_NAME: 'Papapum', POTATO_DESC: 'Explota al contacto, necesita tiempo para armarse.',
    SNOW_PEA_NAME: 'Hielaguisantes', SNOW_PEA_DESC: 'Dispara guisantes congelados que ralentizan a los zombis.',
    CHOMPER_NAME: 'Planta Carnívora', CHOMPER_DESC: 'Devora un zombi entero, vulnerable mientras mastica.',
    REPEATER_NAME: 'Repetidora', REPEATER_DESC: 'Dispara dos guisantes a la vez.',
    PUFF_SHROOM_NAME: 'Seta Desesporada', PUFF_SHROOM_DESC: 'Disparador de corto alcance. Gratis.',
    SUN_SHROOM_NAME: 'Seta Solar', SUN_SHROOM_DESC: 'Da poco sol al principio, luego normal.',
    FUME_SHROOM_NAME: 'Humoseta', FUME_SHROOM_DESC: 'Dispara humos que atraviesan puertas de rejilla.',
    LILY_PAD_NAME: 'Nenúfar', LILY_PAD_DESC: 'Te permite plantar en el agua.',
    FLOWER_POT_NAME: 'Maceta', FLOWER_POT_DESC: 'Te permite plantar en el tejado.',
    CABBAGE_PULT_NAME: 'Colatapulta', CABBAGE_PULT_DESC: 'Lanza coles al enemigo.',
    KERNEL_PULT_NAME: 'Lanzamaíz', KERNEL_PULT_DESC: 'Arroja granos de maíz y mantequilla.',
    MELON_PULT_NAME: 'Melonpulta', MELON_PULT_DESC: 'Hace mucho daño a grupos de zombis.',
    ICE_SHROOM_NAME: 'Seta Congelada', ICE_SHROOM_DESC: 'Congela a todos los zombis en pantalla.',
    DOOM_SHROOM_NAME: 'Seta Nuclear', DOOM_SHROOM_DESC: 'Destruye todo en un área grande y deja un cráter.',
    HYPNO_SHROOM_NAME: 'Hipnoseta', HYPNO_SHROOM_DESC: 'Hace que un zombi luche por ti.',
    SCAREDY_SHROOM_NAME: 'Seta Miedica', SCAREDY_SHROOM_DESC: 'Dispara de lejos, se esconde si se acercan.',
    GRAVE_BUSTER_NAME: 'Comepiedras', GRAVE_BUSTER_DESC: 'Destruye tumbas.',

    // Zombie Overrides
    NORMAL_NAME: 'Zombi', NORMAL_DESC: 'Un zombi normal.',
    CONE_NAME: 'Caracono', CONE_DESC: 'El doble de duro que un zombi normal.',
    BUCKET_NAME: 'Caracubo', BUCKET_DESC: 'Extremadamente resistente al daño.',
  }
};
