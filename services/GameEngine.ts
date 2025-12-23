
import {
  CELL_SIZE,
  COLS,
  GRID_OFFSET_X,
  GRID_OFFSET_Y,
  GridCell,
  LevelType,
  PlantInstance,
  Projectile,
  Sun,
  ZombieInstance
} from '../types';
import { LEVEL_CONFIGS, PLANTS, ZOMBIES } from '../constants';

export class GameEngine {
  public levelType: LevelType;
  public sun: number = 50;
  public frame: number = 0;
  public score: number = 0;
  public gameOver: boolean = false;

  public grid: GridCell[][] = [];
  public plants: PlantInstance[] = [];
  public zombies: ZombieInstance[] = [];
  public projectiles: Projectile[] = [];
  public suns: Sun[] = [];
  public cooldowns: Record<string, number> = {}; // Track cooldown frames per plantDefId
  
  // Sun Logic (Sky)
  private numSunsFallen: number = 0;
  private nextSunSpawnFrame: number = 0;

  // Wave Logic
  public waveIndex: number = 0;
  private nextWaveFrame: number = 0;
  private waveHealthStart: number = 0; // Total health of current wave at start
  private waveThreshold: number = 0; // Health threshold to trigger next wave (35-50%)
  
  // Wave Progress & Flags
  public totalWaves: number = 10; // Fixed level length for prototype
  public hugeWaveIndices: number[] = [3, 6, 10]; // Waves that are "Huge"
  public isHugeWaveTriggered: boolean = false; // For UI notification

  // Grave Spawning Logic
  private nextGraveSpawnFrame: number = 0;

  // Visuals
  private bgImage: HTMLImageElement | null = null;
  private waterImage: HTMLImageElement | null = null;

  constructor(levelType: LevelType) {
    this.levelType = levelType;
    this.initGrid();
    this.scheduleNextSun();
    this.scheduleNextWave(300); // First wave in 5 seconds
    // Initial grave spawn delay (between 1 and 2 minutes)
    this.nextGraveSpawnFrame = 3600 + Math.random() * 3600;

    // Load Background Image if available
    const config = LEVEL_CONFIGS[this.levelType];
    if (config.backgroundImage) {
        this.bgImage = new Image();
        this.bgImage.src = config.backgroundImage;
        this.bgImage.onerror = () => {
            console.warn("Failed to load background image, falling back to color.");
            this.bgImage = null;
        };
    }

    // Load Water Texture if available
    if (config.waterTexture) {
        this.waterImage = new Image();
        this.waterImage.src = config.waterTexture;
        this.waterImage.onerror = () => {
            console.warn("Failed to load water texture.");
            this.waterImage = null;
        };
    }
  }

  private initGrid() {
    const config = LEVEL_CONFIGS[this.levelType];
    this.grid = [];
    for (let r = 0; r < config.rows; r++) {
      const row: GridCell[] = [];
      for (let c = 0; c < COLS; c++) {
        const cell: GridCell = {
          row: r,
          col: c,
          x: GRID_OFFSET_X + c * CELL_SIZE,
          y: GRID_OFFSET_Y + r * CELL_SIZE,
          type: config.laneTypes[r],
          plant: null,
          pumpkin: null,
          environment: null
        };
        
        // Spawn Graves in Night Level (Cols 4-8)
        if (config.isNight && config.laneTypes[r] === 'GRASS' && c >= 4 && Math.random() < 0.25) {
            // Create Grave Instance
            const def = PLANTS['GRAVE'];
            const grave: PlantInstance = {
                id: Math.random().toString(),
                defId: 'GRAVE',
                hp: def.hp,
                maxHp: def.hp,
                row: r,
                col: c,
                x: cell.x,
                y: cell.y,
                lastActionFrame: 0,
                age: 0,
                ready: true
            };
            cell.plant = grave;
            this.plants.push(grave);
        }

        row.push(cell);
      }
      this.grid.push(row);
    }
  }

  // Authentic Sun Production Formula
  // min(950, 425 + (NumSunsFallen * 10)) + rand(0, 275) (Values in centiseconds)
  // Converted to 60 FPS frames:
  // 425cs = 4.25s = 255 frames
  // 10cs = 0.1s = 6 frames
  // 950cs = 9.5s = 570 frames
  // 275cs = 2.75s = 165 frames
  private scheduleNextSun() {
      const base = Math.min(570, 255 + (this.numSunsFallen * 6));
      const random = Math.random() * 165;
      const duration = base + random;
      this.nextSunSpawnFrame = this.frame + duration;
  }

  // Wave Logic: "35-50% Rule"
  private scheduleNextWave(delayFrames: number) {
      this.nextWaveFrame = this.frame + delayFrames;
      // Reset threshold logic for next check
      this.waveHealthStart = 0; 
  }

  private calculateCurrentWaveHealth(): number {
      return this.zombies
        .filter(z => z.waveIndex === this.waveIndex)
        .reduce((sum, z) => sum + z.hp, 0);
  }

  private spawnGrave() {
      const config = LEVEL_CONFIGS[this.levelType];
      // Try 10 times to find a valid spot
      for(let i=0; i<10; i++) {
          const c = 4 + Math.floor(Math.random() * 5); // Cols 4-8
          const r = Math.floor(Math.random() * config.rows);
          
          if (this.grid[r] && this.grid[r][c]) {
             const cell = this.grid[r][c];
             // Must be empty grass
             if (cell.type === 'GRASS' && !cell.plant && !cell.environment && !cell.pumpkin) {
                 const def = PLANTS['GRAVE'];
                 const grave: PlantInstance = {
                    id: Math.random().toString(),
                    defId: 'GRAVE',
                    hp: def.hp,
                    maxHp: def.hp,
                    row: r,
                    col: c,
                    x: cell.x,
                    y: cell.y,
                    lastActionFrame: 0,
                    age: 0,
                    ready: true
                };
                cell.plant = grave;
                this.plants.push(grave);
                break; // Spawned one, done
             }
          }
      }
  }

  public update() {
    if (this.gameOver) return;
    this.frame++;
    const config = LEVEL_CONFIGS[this.levelType];

    // Reset trigger after a few frames (UI notification)
    if (this.isHugeWaveTriggered && this.frame % 180 === 0) {
        this.isHugeWaveTriggered = false;
    }

    // Update Cooldowns
    for (const key in this.cooldowns) {
        if (this.cooldowns[key] > 0) {
            this.cooldowns[key]--;
        }
    }

    // 1. Spawn Sun (Natural) - Authentic Formula
    if (config.sunProduction && this.frame >= this.nextSunSpawnFrame) {
      this.spawnSun();
      this.numSunsFallen++;
      this.scheduleNextSun();
    }
    
    // Grave Spawning (Night Only)
    if (config.isNight && this.frame >= this.nextGraveSpawnFrame) {
        this.spawnGrave();
        // Next spawn in 1-2 minutes (3600 - 7200 frames)
        this.nextGraveSpawnFrame = this.frame + 3600 + Math.random() * 3600;
    }

    // 2. Wave Manager / Zombie Spawning
    // Calculate if we should trigger next wave early based on health
    if (this.waveHealthStart > 0 && this.waveIndex < this.totalWaves) {
        const currentHealth = this.calculateCurrentWaveHealth();
        // If we drop below threshold (35-50% of wave health remaining), accelerate next wave
        if (currentHealth <= this.waveThreshold && this.nextWaveFrame > this.frame + 120) {
            this.nextWaveFrame = this.frame + 120; // Spawn in 2 seconds
            this.waveHealthStart = 0; // Stop checking
        }
    }

    if (this.frame >= this.nextWaveFrame) {
        this.spawnWave();
    }

    // 3. Plants Logic
    this.plants.forEach(p => {
        // If crater, just tick timer
        if (p.defId === 'CRATER') {
            if (p.craterTimer && p.craterTimer > 0) {
                p.craterTimer--;
            }
            return;
        }
        
        // If Grave, do nothing
        if (p.defId === 'GRAVE') return;

        const def = PLANTS[p.defId];

        // Sleep Check (Mushrooms during Day)
        if (p.isAsleep) {
            return; // Do nothing if asleep
        }
        
        p.age++;
        
        // Grave Buster Logic
        if (p.defId === 'GRAVE_BUSTER' && p.busterTimer !== undefined) {
            p.busterTimer--;
            if (p.busterTimer <= 0) {
                p.hp = 0; // Buster finishes job. It will be removed in cleanup.
                // Since timer reached 0, it's a success.
            }
            return;
        }

        // Sun Production (Sunflower / Sun-shroom)
        if (p.defId === 'SUNFLOWER' || p.defId === 'SUN_SHROOM') {
             if (p.sunProductionTimer !== undefined) {
                 p.sunProductionTimer--;
                 if (p.sunProductionTimer <= 0) {
                     // Spawn Sun
                     let value = 25;
                     // Sun-shroom small state
                     if (p.defId === 'SUN_SHROOM' && !p.isBig) {
                         value = 15;
                     }
                     this.spawnSun(p.x, p.y, value);
                     
                     // Reset Timer: 23.5s - 25s (1410 - 1500 frames)
                     p.sunProductionTimer = 1410 + Math.random() * 90;
                 }
             }
        }

        // Sun-shroom Growth: 120 seconds = 7200 frames
        if (p.defId === 'SUN_SHROOM' && !p.isBig && p.age > 7200) {
            p.isBig = true;
        }
        
        // Scaredy-shroom Hiding Logic
        if (p.defId === 'SCAREDY_SHROOM') {
            // 3x3 Grid Detection (Adjacent Rows & Cols)
            const danger = this.zombies.some(z => {
                if (z.hp <= 0 || z.isHypnotized) return false;
                if (Math.abs(z.row - p.row) > 1) return false;
                const minX = p.x - CELL_SIZE;
                const maxX = p.x + CELL_SIZE * 2; 
                const zCenter = z.x + 30;
                return zCenter > minX && zCenter < maxX;
            });
            p.isHiding = danger;
        }
        
        // Potato Mine (Arming)
        if (p.defId === 'POTATO_MINE' && !p.ready) {
             if (p.age > 900) { // 15s to arm
                 p.ready = true; 
             }
        }

        // ICE SHROOM Logic
        if (p.defId === 'ICE_SHROOM') {
            if (p.age === 60) { // Activate after 1s
                // Freeze everything
                this.zombies.forEach(z => {
                    if (z.hp > 0) {
                        z.fullFreezeTimer = 240; // 4 seconds stop
                        z.frozen = 600; // 10 seconds slow
                    }
                });
            }
            if (p.age > 65) {
                p.hp = 0; // Remove plant
            }
        }

        // JALAPENO Logic
        if (p.defId === 'JALAPENO') {
            // Explode entire row after 1 second (60 frames)
            if (p.age === 60) {
                this.zombies.forEach(z => {
                    if (z.row === p.row && z.hp > 0) {
                        z.hp -= 1800; // Massive damage
                        z.isHeadless = true;
                    }
                });
            }
            if (p.age > 75) {
                p.hp = 0; // Cleanup
            }
        }

        // SPIKEWEED Logic (DoT)
        if (p.defId === 'SPIKEWEED') {
            // Damage any zombie currently standing on this cell
            const spikeDamage = 20 / 60; // Approx 20 damage per second
            this.zombies.forEach(z => {
                if (z.row === p.row && z.hp > 0 && !z.isHypnotized) {
                     const zCenter = z.x + CELL_SIZE/2;
                     // Check overlap with spike cell
                     if (zCenter > p.x + 10 && zCenter < p.x + CELL_SIZE - 10) {
                         z.hp -= spikeDamage;
                     }
                }
            });
        }

        // TANGLE KELP Logic
        if (p.defId === 'TANGLE_KELP') {
            // Find closest zombie in cell
            const victim = this.zombies.find(z => 
                z.row === p.row && 
                z.hp > 0 &&
                !z.isHypnotized &&
                Math.abs((z.x + 30) - (p.x + CELL_SIZE/2)) < 30
            );
            
            if (victim) {
                victim.hp = 0; // Drag down
                p.hp = 0; // Used up
            }
        }

        // SQUASH Logic
        if (p.defId === 'SQUASH') {
             if (!p.ready) { // Not triggered yet
                 // Detect zombie in range (Left/Right/Center)
                 // Squash range is roughly same tile or adjacent
                 const target = this.zombies.find(z => 
                     z.row === p.row && 
                     z.hp > 0 &&
                     !z.isHypnotized &&
                     Math.abs((z.x + 30) - (p.x + CELL_SIZE/2)) < CELL_SIZE * 0.8
                 );
                 
                 if (target) {
                     p.ready = true; // Start animation state
                     p.age = 0; // Reset age for animation timing
                 }
             } else {
                 // Triggered
                 if (p.age === 45) { // Smack down
                      const target = this.zombies.find(z => 
                         z.row === p.row && 
                         z.hp > 0 &&
                         Math.abs((z.x + 30) - (p.x + CELL_SIZE/2)) < CELL_SIZE * 0.8
                     );
                     if (target) {
                         target.hp -= 1800;
                         target.isHeadless = true;
                     }
                 }
                 if (p.age > 60) {
                     p.hp = 0;
                 }
             }
        }

        // Cherry Bomb OR Doom-shroom Logic
        if (p.defId === 'CHERRY_BOMB' || p.defId === 'DOOM_SHROOM') {
             // Explode after 1 second (60 frames)
             if (p.age === 60) {
                 const isDoom = p.defId === 'DOOM_SHROOM';
                 const damage = 1800;

                 this.zombies.forEach(z => {
                     if (isDoom) {
                         // Doom-shroom: All zombies on screen get destroyed
                         if (z.hp > 0) {
                             z.hp -= damage;
                             z.isHeadless = true;
                         }
                     } else {
                         // Cherry Bomb: 3x3 Grid
                         const minRow = p.row - 1;
                         const maxRow = p.row + 1;
                         const minX = p.x - CELL_SIZE;
                         const maxX = p.x + CELL_SIZE * 2;
                         if (z.row >= minRow && z.row <= maxRow && z.hp > 0) {
                             const zCenter = z.x + CELL_SIZE / 2;
                             if (zCenter >= minX && zCenter <= maxX) {
                                 z.hp -= damage;
                                 z.isHeadless = true; 
                             }
                         }
                     }
                 });

                 // Doom Shroom leaves crater
                 if (isDoom) {
                     p.defId = 'CRATER';
                     p.craterTimer = 10800; // 180 seconds * 60
                     // Do not set p.hp = 0, so it stays as crater
                     return; // Skip normal removal
                 }
             }
             
             // Remove Cherry Bomb after explosion
             if (!p.defId.includes('CRATER') && p.age > 80) {
                 p.hp = 0;
             }
        }

        // Chomper Logic
        if (p.defId === 'CHOMPER') {
             if (p.isChewing) {
                 p.digestTimer = (p.digestTimer || 0) - 1;
                 if ((p.digestTimer || 0) <= 0) {
                     p.isChewing = false;
                 }
             } else {
                 // Detect zombies in range
                 const eatRange = CELL_SIZE * 1.5;
                 let closestZombie: ZombieInstance | null = null;
                 let minDist = Infinity;

                 for (const z of this.zombies) {
                     if (z.row === p.row && z.hp > 0 && !z.isHypnotized) {
                         if (z.x > p.x - 10 && z.x < p.x + eatRange) {
                             const dist = z.x - p.x;
                             if (dist < minDist) {
                                 minDist = dist;
                                 closestZombie = z;
                             }
                         }
                     }
                 }

                 if (closestZombie) {
                     closestZombie.hp = 0; // Instant kill
                     p.isChewing = true;
                     p.digestTimer = 2520; // 42 seconds
                 }
             }
        }

        // Shooters (Peashooter, Snow Pea, Repeater, Puff-shroom, Fume-shroom, Threepeater)
        if ((def.damage && def.fireRate) || def.id === 'THREEPEATER') {
            // Don't shoot if Scaredy-shroom is hiding
            if (p.isHiding) return;

            // Determine Lanes to check
            const lanesToCheck = [p.row];
            if (def.id === 'THREEPEATER') {
                lanesToCheck.push(p.row - 1);
                lanesToCheck.push(p.row + 1);
            }

            // Determine Detection Range
            let range = Infinity;
            if (def.id === 'PUFF_SHROOM') range = CELL_SIZE * 3.5; 
            if (def.id === 'FUME_SHROOM') range = CELL_SIZE * 4.5; 

            // BOARD RIGHT EDGE: 220 + 9 * 80 = 940. 
            // Zombies spawn further right (up to 1200), so they are "off-screen" initially.
            // We limit shooting to zombies that have actually entered the lawn.
            const BOARD_RIGHT_EDGE = GRID_OFFSET_X + COLS * CELL_SIZE;

            // Check for valid targets in any relevant lane
            const hasTarget = lanesToCheck.some(rowIndex => {
                if (rowIndex < 0 || rowIndex >= config.rows) return false; // Out of bounds
                return this.zombies.some(z => 
                    z.row === rowIndex && 
                    z.x > p.x && 
                    !z.isHypnotized &&
                    (z.x - p.x) < range &&
                    z.x < BOARD_RIGHT_EDGE // Constraint: Zombie must be on the board
                );
            });

            const fireRate = def.fireRate || 85; // Default if Threepeater missing stats
            if (hasTarget && this.frame - p.lastActionFrame > fireRate) {
                let effect: 'FREEZE' | undefined = undefined;
                if (p.defId === 'SNOW_PEA') effect = 'FREEZE';

                // Determine projectile type
                let pType: 'PEA' | 'CABBAGE' | 'FUME' | 'SPORE' = 'PEA';
                if (p.defId === 'CABBAGE_PULT') pType = 'CABBAGE';
                else if (p.defId === 'FUME_SHROOM') pType = 'FUME';
                else if (p.defId === 'PUFF_SHROOM') pType = 'SPORE';

                const fire = (offsetX: number, laneIndex: number) => {
                    // Skip invalid lanes for Threepeater
                    if (laneIndex < 0 || laneIndex >= config.rows) return;

                    this.projectiles.push({
                        id: Math.random().toString(),
                        x: p.x + 40 + offsetX,
                        y: p.y + 20 + (laneIndex - p.row) * CELL_SIZE, // Adjust Y for lane
                        startX: p.x + 40 + offsetX,
                        row: laneIndex,
                        damage: def.damage || 20,
                        speed: 5,
                        type: pType,
                        effect: effect,
                        hitZombieIds: pType === 'FUME' ? [] : undefined
                    });
                };

                // Standard fire
                if (def.id !== 'THREEPEATER') {
                    fire(0, p.row);
                    // Repeater fires twice
                    if (p.defId === 'REPEATER') {
                        fire(-20, p.row);
                    }
                } else {
                    // Threepeater fires one in each lane
                    fire(0, p.row - 1);
                    fire(0, p.row);
                    fire(0, p.row + 1);
                }

                p.lastActionFrame = this.frame;
            }
        }
    });

    // 4. Projectiles Move
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const proj = this.projectiles[i];
        proj.x += proj.speed;
        
        // Torchwood Collision Logic (Turn Peas into Fireballs)
        if (proj.type === 'PEA') {
            // Look for Torchwood in the same row at current X
            const torchwood = this.plants.find(p => 
                p.defId === 'TORCHWOOD' && 
                p.row === proj.row &&
                Math.abs(proj.x - (p.x + CELL_SIZE/2)) < 30
            );

            if (torchwood) {
                proj.type = 'FIREBALL';
                proj.damage = 40; // Double damage
                proj.effect = undefined; // Remove freeze if any
            }
        }

        const distanceTraveled = proj.x - proj.startX;
        
        // Range Check (Projectile Lifecycle)
        if (proj.type === 'FUME' && distanceTraveled > CELL_SIZE * 4) {
            this.projectiles.splice(i, 1);
            continue;
        }
        if (proj.type === 'SPORE' && distanceTraveled > CELL_SIZE * 3.5) {
            this.projectiles.splice(i, 1);
            continue;
        }

        // Collision with Zombie
        // If it's a FUME, it pierces. If it's not, it dies on first hit.
        const hitZombie = this.zombies.find(z => {
            if (z.row !== proj.row || z.isHypnotized || z.hp <= 0) return false;
            const hit = Math.abs(z.x - proj.x) < 30;
            
            // For FUME, check if already hit
            if (hit && proj.type === 'FUME' && proj.hitZombieIds) {
                 return !proj.hitZombieIds.includes(z.id);
            }
            return hit;
        });

        if (hitZombie) {
            hitZombie.hp -= proj.damage;
            
            if (proj.effect === 'FREEZE') {
                hitZombie.frozen = 600;
            }

            if (proj.type === 'FUME' && proj.hitZombieIds) {
                // Record hit, don't destroy projectile
                proj.hitZombieIds.push(hitZombie.id);
            } else {
                // Normal projectile destroys itself
                this.projectiles.splice(i, 1);
            }
        } else if (proj.x > 1000) { // Screen bounds
            this.projectiles.splice(i, 1);
        }
    }

    // 5. Zombies Move, Eat & Bleed
    for (let i = this.zombies.length - 1; i >= 0; i--) {
        const z = this.zombies[i];
        
        // Ice Shroom Full Freeze check
        if (z.fullFreezeTimer && z.fullFreezeTimer > 0) {
            z.fullFreezeTimer--;
            continue; // Skip everything
        }

        // Freeze Timer
        if (z.frozen > 0) {
            z.frozen--;
        }

        // Headless Logic (33% HP rule)
        if (!z.isHeadless && z.hp < z.maxHp * 0.33 && z.hp > 0) {
            z.isHeadless = true;
        }

        // Bleed Out Logic
        if (z.isHeadless && z.hp > 0) {
            const bleedRate = z.maxHp >= 500 ? (75 / 60) : (25 / 60);
            z.hp -= bleedRate;
        }

        // Death
        if (z.hp <= 0) {
            this.zombies.splice(i, 1);
            this.score += 10;
            continue;
        }

        // Eating / Combat Logic
        const cellCol = Math.floor((z.x + 20 - GRID_OFFSET_X) / CELL_SIZE);
        const cell = this.grid[z.row] && this.grid[z.row][cellCol];

        let isEating = false;

        // --- HYPNOTIZED ZOMBIE LOGIC ---
        if (z.isHypnotized) {
            const enemyZombie = this.zombies.find(other => 
                !other.isHypnotized && 
                other.row === z.row && 
                Math.abs(other.x - z.x) < 40 && 
                other.hp > 0
            );

            if (enemyZombie) {
                isEating = true;
                enemyZombie.hp -= 1; // Bite enemy
            }

            z.isEating = isEating;
            if (!isEating) {
                let currentSpeed = z.speed;
                if (z.frozen > 0) currentSpeed *= 0.75;
                z.x += currentSpeed; // Move Right
            }
            if (z.x > 1000) {
                this.zombies.splice(i, 1);
                continue;
            }
            continue; 
        }

        // --- NORMAL ZOMBIE LOGIC ---
        const hypnoEnemy = this.zombies.find(other => 
            other.isHypnotized && 
            other.row === z.row && 
            Math.abs(other.x - z.x) < 40 && 
            other.hp > 0
        );

        if (hypnoEnemy) {
             isEating = true;
             hypnoEnemy.hp -= 1;
        } else if (cell) {
            const target = cell.plant || cell.environment;
            if (target && Math.abs(z.x - target.x) < 10 && target.defId !== 'CRATER') {
                // SPIKEWEED CHECK: Zombies don't eat Spikeweed
                if (target.defId === 'SPIKEWEED') {
                    isEating = false;
                } else {
                    isEating = true;
                    
                    if (target.defId === 'HYPNO_SHROOM') {
                        target.hp = 0; 
                        z.isHypnotized = true; 
                        z.isEating = false; 
                        z.speed = 0.25; 
                    } else if (target.defId !== 'GRAVE') { // Zombies don't eat graves
                        target.hp -= 1;
                        if (target.defId === 'POTATO_MINE' && target.ready) {
                            z.hp = 0;
                            target.hp = 0;
                        }
                    } else {
                        // It is a Grave, do not eat
                        isEating = false;
                    }

                    if (target.hp <= 0) {
                        // Handle Grave Buster death -> Respawn Grave
                        if (target.defId === 'GRAVE_BUSTER') {
                            // If Buster Timer > 0, it died prematurely (eaten or crushed), so grave remains
                            if (target.busterTimer !== undefined && target.busterTimer > 0) {
                                target.defId = 'GRAVE';
                                target.hp = PLANTS['GRAVE'].hp;
                                target.maxHp = PLANTS['GRAVE'].hp;
                                target.busterTimer = undefined; // Reset
                            } else {
                                // If timer <= 0, it finished successfully, so remove it.
                                if (cell.plant === target) cell.plant = null;
                                if (cell.environment === target) cell.environment = null;
                                this.plants = this.plants.filter(p => p.id !== target.id);
                            }
                        } else {
                            if (cell.plant === target) cell.plant = null;
                            if (cell.environment === target) cell.environment = null;
                            this.plants = this.plants.filter(p => p.id !== target.id);
                        }
                    }
                }
            }
        }

        z.isEating = isEating;
        if (!isEating) {
            let currentSpeed = z.speed;
            if (z.frozen > 0) {
                currentSpeed *= 0.75;
            }
            z.x -= currentSpeed;
        }

        if (z.x < GRID_OFFSET_X - 50) {
            this.gameOver = true;
        }
    }

    // 6. Suns Logic
    for (let i = this.suns.length - 1; i >= 0; i--) {
        const s = this.suns[i];
        if (s.y < s.targetY) s.y += 2;
        s.life--;
        if (s.life <= 0) this.suns.splice(i, 1);
    }

    // 7. Cleanup Dead Plants
    for (let i = this.plants.length - 1; i >= 0; i--) {
        const p = this.plants[i];
        if (p.defId === 'CRATER') {
            if ((p.craterTimer || 0) <= 0) {
                const cell = this.grid[p.row][p.col];
                if (cell.plant === p) cell.plant = null;
                this.plants.splice(i, 1);
            }
        } else if (p.hp <= 0) {
             const cell = this.grid[p.row][p.col];
             
             // Special Logic for Grave Buster
             if (p.defId === 'GRAVE_BUSTER') {
                 if (p.busterTimer !== undefined && p.busterTimer <= 0) {
                     // Success: Grave destroyed. Remove plant.
                     if (cell.plant === p) cell.plant = null;
                     this.plants.splice(i, 1);
                     continue;
                 } else {
                     // Failure: Buster died/eaten. Respawn Grave.
                     p.defId = 'GRAVE';
                     p.hp = PLANTS['GRAVE'].hp;
                     p.maxHp = PLANTS['GRAVE'].hp;
                     p.busterTimer = undefined;
                     continue; // Keep in list as Grave
                 }
             }
             
             if (cell.plant === p) cell.plant = null;
             if (cell.environment === p) cell.environment = null;
             this.plants.splice(i, 1);
        }
    }
  }

  private spawnWave() {
      // Stop if we reached end of level logic (but prototype loops forever usually, let's cap it)
      if (this.waveIndex >= this.totalWaves) {
          // Just keep spawning a final trickle or stop
          // For prototype, lets just loop the huge wave logic or keep adding index
          // We'll just increment and let it be harder
      }

      this.waveIndex++;
      const config = LEVEL_CONFIGS[this.levelType];
      const isHugeWave = this.hugeWaveIndices.includes(this.waveIndex);

      if (isHugeWave) {
          this.isHugeWaveTriggered = true;
      }
      
      // Calculate zombie count
      let baseCount = Math.min(15, Math.floor(this.waveIndex * 0.8) + 2);
      if (isHugeWave) baseCount = Math.floor(baseCount * 2.5); // Huge wave multiplier

      const currentWaveZombies: ZombieInstance[] = [];

      // Helper to spawn zombie
      const spawnZombie = (r: number, c: number, xOffset: number = 0, forceType?: string) => {
            let typeKey = forceType || 'NORMAL';
            if (!forceType) {
                const rand = Math.random();
                if (this.waveIndex > 2 && rand > 0.6) typeKey = 'CONE';
                if (this.waveIndex > 4 && rand > 0.85) typeKey = 'BUCKET';
                if (isHugeWave && rand > 0.5) typeKey = 'CONE'; // More cones in huge wave
            }

            const def = ZOMBIES[typeKey];
            const newZombie: ZombieInstance = {
                id: Math.random().toString(),
                defId: typeKey,
                hp: def.hp,
                maxHp: def.hp,
                row: r,
                x: (c * CELL_SIZE) + GRID_OFFSET_X + xOffset, 
                y: GRID_OFFSET_Y + r * CELL_SIZE,
                speed: def.speed,
                isEating: false,
                frozen: 0,
                isHeadless: false,
                waveIndex: this.waveIndex,
                isHypnotized: false
            };
            this.zombies.push(newZombie);
            currentWaveZombies.push(newZombie);
      };

      // 1. Standard Spawns from Right
      for (let i = 0; i < baseCount; i++) {
          const row = Math.floor(Math.random() * config.rows);
          let typeKey = 'NORMAL';
          const rand = Math.random();
          if (this.waveIndex > 2 && rand > 0.6) typeKey = 'CONE';
          if (this.waveIndex > 4 && rand > 0.85) typeKey = 'BUCKET';
          
          const def = ZOMBIES[typeKey];
          const newZombie: ZombieInstance = {
                id: Math.random().toString(),
                defId: typeKey,
                hp: def.hp,
                maxHp: def.hp,
                row: row,
                x: 900 + Math.random() * 300, // Staggered entry
                y: GRID_OFFSET_Y + row * CELL_SIZE,
                speed: def.speed,
                isEating: false,
                frozen: 0,
                isHeadless: false,
                waveIndex: this.waveIndex,
                isHypnotized: false
          };
          this.zombies.push(newZombie);
          currentWaveZombies.push(newZombie);
      }

      // 2. Night Grave Spawning (HUGE WAVE ONLY)
      if (config.isNight && isHugeWave) {
          this.plants.forEach(p => {
              if (p.defId === 'GRAVE') {
                  // Spawn a zombie at this grave
                  // Type randomizer for grave spawn
                  let graveZombieType = 'NORMAL';
                  const r = Math.random();
                  if (r > 0.6) graveZombieType = 'CONE';
                  if (r > 0.9) graveZombieType = 'BUCKET';
                  
                  const def = ZOMBIES[graveZombieType];
                  
                  const newZombie: ZombieInstance = {
                        id: Math.random().toString(),
                        defId: graveZombieType,
                        hp: def.hp,
                        maxHp: def.hp,
                        row: p.row,
                        x: p.x, // Exact grave location
                        y: p.y,
                        speed: def.speed,
                        isEating: false,
                        frozen: 0,
                        isHeadless: false,
                        waveIndex: this.waveIndex,
                        isHypnotized: false
                  };
                  this.zombies.push(newZombie);
                  currentWaveZombies.push(newZombie);
              }
          });
      }

      const waveTotalHealth = currentWaveZombies.reduce((acc, z) => acc + z.hp, 0);
      this.waveHealthStart = waveTotalHealth;
      const ratio = 0.5 + Math.random() * 0.15;
      this.waveThreshold = waveTotalHealth * ratio;

      const nextTime = 1500 + Math.random() * 360;
      this.scheduleNextWave(nextTime);
  }

  private spawnSun(x?: number, y?: number, value: number = 25) {
    const targetY = y ? y + 40 : Math.random() * 400 + 100;
    this.suns.push({
        id: Math.random().toString(),
        x: x || Math.random() * (COLS * CELL_SIZE) + GRID_OFFSET_X,
        y: y || 0,
        targetY: targetY,
        value: value,
        life: 600 // 10 seconds
    });
  }

  public tryPlant(col: number, row: number, plantDefId: string): boolean {
      if (row < 0 || row >= this.grid.length || col < 0 || col >= COLS) return false;
      const cell = this.grid[row][col];
      const def = PLANTS[plantDefId];
      const config = LEVEL_CONFIGS[this.levelType];

      if (this.sun < def.cost) return false;
      if ((this.cooldowns[plantDefId] || 0) > 0) return false;
      if (cell.plant && cell.plant.defId === 'CRATER') return false;

      // Special Logic: Grave Buster
      if (def.id === 'GRAVE_BUSTER') {
          if (cell.plant && cell.plant.defId === 'GRAVE') {
               // Valid plant target
          } else {
              return false;
          }
      } else {
           // Normal plant check
           // Can't plant on Graves
           if (cell.plant && cell.plant.defId === 'GRAVE') return false;
      }

      if (def.id === 'COFFEE_BEAN') {
           if (cell.plant && cell.plant.isAsleep) {
               this.sun -= def.cost;
               this.cooldowns[plantDefId] = def.cooldown;
               cell.plant.isAsleep = false;
               return true;
           }
           return false;
      }

      if (def.isPot || def.id === 'LILY_PAD') {
          if (cell.environment) return false;
          if (cell.type === 'WATER' && def.id !== 'LILY_PAD') return false;
          if (cell.type === 'ROOF' && !def.isPot) return false;
      } else if (def.id !== 'GRAVE_BUSTER') {
          if (cell.plant) return false;
          
          // Tangle Kelp Logic
          if (def.id === 'TANGLE_KELP') {
              if (cell.type !== 'WATER') return false; // Must be on water
              if (cell.environment) return false; // Cannot be planted on a Lily Pad
          } else {
              // Other plants need Lily Pad on water
              if (cell.type === 'WATER' && (!cell.environment || cell.environment.defId !== 'LILY_PAD')) return false;
          }

          // Prevent Tangle Kelp on land
          if (def.id === 'TANGLE_KELP' && cell.type !== 'WATER') return false;
          
          if (cell.type === 'ROOF' && (!cell.environment || cell.environment.defId !== 'FLOWER_POT')) return false;
      }

      this.sun -= def.cost;
      this.cooldowns[plantDefId] = def.cooldown;

      let sunTimer = undefined;
      if (def.id === 'SUNFLOWER' || def.id === 'SUN_SHROOM') {
          sunTimer = 180 + Math.random() * 570;
      }

      const isDay = !config.isNight;
      const isNightPlant = def.isNight;
      const isAsleep = isDay && isNightPlant;

      const instance: PlantInstance = {
          id: Math.random().toString(),
          defId: plantDefId,
          hp: def.hp,
          maxHp: def.hp,
          row: row,
          col: col,
          x: cell.x,
          y: cell.y,
          lastActionFrame: this.frame,
          sunProductionTimer: sunTimer,
          age: 0,
          isBig: false,
          ready: false,
          isChewing: false,
          isAsleep: isAsleep,
          isHiding: false
      };
      
      if (def.id === 'GRAVE_BUSTER') {
          instance.busterTimer = 240; // 4 seconds to bust
          // Replace existing Grave
          if (cell.plant) {
             // Remove Grave from plants list
             this.plants = this.plants.filter(p => p.id !== cell.plant!.id);
          }
          cell.plant = instance;
          this.plants.push(instance);
      } else {
          this.plants.push(instance);
          if (def.isPot || def.id === 'LILY_PAD') {
              cell.environment = instance;
          } else {
              cell.plant = instance;
          }
      }

      return true;
  }
  
  public resetCooldowns() {
      for (const key in this.cooldowns) {
          this.cooldowns[key] = 0;
      }
  }

  public collectSun(x: number, y: number) {
      for (let i = this.suns.length - 1; i >= 0; i--) {
          const s = this.suns[i];
          const dist = Math.hypot(s.x - x, s.y - y);
          if (dist < 50) {
              this.sun += s.value;
              this.suns.splice(i, 1);
              return;
          }
      }
  }

  public draw(ctx: CanvasRenderingContext2D) {
      const config = LEVEL_CONFIGS[this.levelType];
      
      // Draw Background Image if available and loaded
      // Fix: Check naturalWidth to ensure image is valid and loaded to prevent InvalidStateError
      if (this.bgImage && this.bgImage.complete && this.bgImage.naturalWidth > 0) {
          ctx.drawImage(this.bgImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
      } else {
          // Fallback to solid color
          ctx.fillStyle = config.bg;
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
      
      // Draw grid always (either as main terrain or overlay)
      this.grid.forEach(row => {
          row.forEach(cell => {
              if (!this.bgImage || !this.bgImage.complete || this.bgImage.naturalWidth === 0) {
                  // Procedural visual (no image)
                  if (cell.type === 'WATER') {
                      ctx.fillStyle = '#3b82f6';
                      ctx.fillRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
                  } else if (cell.type === 'ROOF') {
                       ctx.strokeStyle = '#78350f';
                       ctx.strokeRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
                  } else {
                      if ((cell.row + cell.col) % 2 === 0) {
                          ctx.fillStyle = 'rgba(0,0,0,0.05)';
                          ctx.fillRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
                      }
                  }
              } else {
                  // Overlay for image
                  // Ensure water is visible even if BG image doesn't show it clearly
                  if (cell.type === 'WATER') {
                      // If we have a loaded water texture, use it and make it SOLID (opacity 1)
                      if (this.waterImage && this.waterImage.complete && this.waterImage.naturalWidth > 0) {
                          ctx.drawImage(this.waterImage, cell.x, cell.y, CELL_SIZE, CELL_SIZE);
                          // Add a subtle tint for night mode pools if needed
                          if (config.isNight) {
                              ctx.fillStyle = 'rgba(0, 0, 50, 0.3)';
                              ctx.fillRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
                          }
                      } else {
                          // Fallback if texture fails
                          ctx.fillStyle = 'rgba(59, 130, 246, 0.4)'; // Semi-transparent blue
                          ctx.fillRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
                      }
                  }
                  
                  // Draw visible borders
                  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                  ctx.lineWidth = 1;
                  ctx.strokeRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);

                  // Draw checkerboard
                  if ((cell.row + cell.col) % 2 === 0) {
                      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                      ctx.fillRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
                  }
              }
          });
      });

      const drawEmoji = (emoji: string, x: number, y: number, size: number = 40, opacity: number = 1) => {
        ctx.globalAlpha = opacity;
        ctx.font = `${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillText(emoji, x + 2, y + 2);
        ctx.fillStyle = '#fff';
        ctx.fillText(emoji, x, y);
        ctx.globalAlpha = 1;
      };

      this.plants.filter(p => {
          const def = PLANTS[p.defId];
          return def.isPot || def.id === 'LILY_PAD';
      }).forEach(p => {
          const def = PLANTS[p.defId];
          drawEmoji(def.emoji, p.x + CELL_SIZE/2, p.y + CELL_SIZE/2);
      });

      this.plants.filter(p => {
        const def = PLANTS[p.defId];
        return !def.isPot && def.id !== 'LILY_PAD';
      }).forEach(p => {
        const def = PLANTS[p.defId];
        let displayEmoji = def.emoji;
        let opacity = 1;
        
        if (def.id === 'SUN_SHROOM' && !p.isBig) {
            drawEmoji(displayEmoji, p.x + CELL_SIZE/2, p.y + CELL_SIZE/2 + 10, 30);
        } else if (p.defId === 'CHOMPER' && p.isChewing) {
            drawEmoji('🤢', p.x + CELL_SIZE/2, p.y + CELL_SIZE/2);
        } else if (p.defId === 'SCAREDY_SHROOM' && p.isHiding) {
            // Scaredy Shroom Hiding Visual
            drawEmoji('🫣', p.x + CELL_SIZE/2, p.y + CELL_SIZE/2 + 15, 30);
        } else if (def.id === 'SQUASH' && p.ready) {
            // Squash attacking (Jumping)
             drawEmoji(displayEmoji, p.x + CELL_SIZE/2, p.y + CELL_SIZE/2 - 20, 50);
        } else if (def.id === 'JALAPENO' && p.age > 60) {
            // Jalapeno Explosion Visual handled later (row), maybe hide plant
            opacity = 0; 
        } else if ((def.id === 'CHERRY_BOMB' || def.id === 'DOOM_SHROOM') && p.age > 60 && p.defId !== 'CRATER') {
             drawEmoji('💥', p.x + CELL_SIZE/2, p.y + CELL_SIZE/2, 70);
        } else if (def.id === 'CRATER') {
             drawEmoji('🕳️', p.x + CELL_SIZE/2, p.y + CELL_SIZE/2 + 10);
        } else if (def.id === 'POTATO_MINE') {
            if (!p.ready) {
                 drawEmoji('🌱', p.x + CELL_SIZE/2, p.y + CELL_SIZE/2 + 10, 25);
            } else {
                 drawEmoji('🥔', p.x + CELL_SIZE/2, p.y + CELL_SIZE/2);
                 drawEmoji('⚠️', p.x + CELL_SIZE/2 + 15, p.y + CELL_SIZE/2 - 15, 15);
            }
        } else {
            drawEmoji(displayEmoji, p.x + CELL_SIZE/2, p.y + CELL_SIZE/2, 40, opacity);
        }

        if (p.defId === 'POTATO_MINE' && !p.ready) {
            ctx.fillStyle = 'red';
            ctx.font = '12px Arial';
            ctx.fillText('...', p.x + CELL_SIZE/2, p.y + 10);
        }

        if (p.isAsleep) {
             ctx.fillStyle = '#fff';
             ctx.font = '16px Arial';
             const offset = (this.frame % 60) < 30 ? 0 : 5;
             ctx.fillText('Zzz...', p.x + CELL_SIZE/2 + 10, p.y + 10 - offset);
        }
      });
      
      // JALAPENO FIRE ROW
      this.plants.forEach(p => {
          if (p.defId === 'JALAPENO' && p.age > 60 && p.age < 75) {
              ctx.fillStyle = 'rgba(255, 69, 0, 0.6)';
              ctx.fillRect(GRID_OFFSET_X, p.y, COLS * CELL_SIZE, CELL_SIZE);
              for(let c=0; c<COLS; c++) {
                  drawEmoji('🔥', GRID_OFFSET_X + c*CELL_SIZE + CELL_SIZE/2, p.y + CELL_SIZE/2);
              }
          }
      });

      this.zombies.forEach(z => {
          const def = ZOMBIES[z.defId];
          
          if (z.isHypnotized) {
              ctx.fillStyle = 'rgba(236, 72, 153, 0.6)'; 
              ctx.beginPath();
              ctx.arc(z.x + CELL_SIZE/2, z.y + CELL_SIZE/2 - 15, 35, 0, Math.PI*2);
              ctx.fill();
          }

          if (z.isHeadless) {
              ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
              ctx.beginPath();
              ctx.arc(z.x + CELL_SIZE/2, z.y + CELL_SIZE/2 - 15, 30, 0, Math.PI*2);
              ctx.fill();
          }
          
          if (z.frozen > 0 || (z.fullFreezeTimer || 0) > 0) {
              ctx.fillStyle = (z.fullFreezeTimer || 0) > 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.5)';
              ctx.beginPath();
              ctx.arc(z.x + CELL_SIZE/2, z.y + CELL_SIZE/2 - 15, 35, 0, Math.PI*2);
              ctx.fill();
          }

          if (z.isHypnotized) {
              ctx.save();
              ctx.translate(z.x + CELL_SIZE/2, z.y + CELL_SIZE/2 - 15);
              ctx.scale(-1, 1); 
              ctx.fillText(def.emoji, 0, 0);
              ctx.restore();
          } else {
              drawEmoji(def.emoji, z.x + CELL_SIZE/2, z.y + CELL_SIZE/2 - 15, 40);
          }
          
          const hpPct = z.hp / z.maxHp;
          ctx.fillStyle = 'red';
          ctx.fillRect(z.x + 10, z.y, 60, 4);
          ctx.fillStyle = z.isHeadless ? '#b91c1c' : '#65a30d'; 
          ctx.fillRect(z.x + 10, z.y, 60 * hpPct, 4);
      });

      this.projectiles.forEach(p => {
          if (p.type === 'FIREBALL') {
             ctx.fillStyle = '#ff4500'; // Orange Red
             ctx.shadowBlur = 10;
             ctx.shadowColor = 'orange';
          } else if (p.effect === 'FREEZE') {
             ctx.fillStyle = '#60a5fa'; // Blue Ice
             ctx.shadowBlur = 0;
          } else if (p.type === 'FUME') {
             ctx.fillStyle = 'rgba(192, 132, 252, 0.8)'; // Purple Fume
             ctx.shadowBlur = 5;
             ctx.shadowColor = 'purple';
          } else if (p.type === 'SPORE') {
             ctx.fillStyle = '#d8b4fe'; // Light Purple Spore
             ctx.shadowBlur = 0;
          } else {
             ctx.fillStyle = p.type === 'CABBAGE' ? 'lightgreen' : '#4ade80';
             ctx.shadowBlur = 0;
          }
          
          ctx.beginPath();
          // Fume bubbles are slightly larger
          const r = p.type === 'FUME' ? 14 : (p.type === 'SPORE' ? 8 : (p.type === 'FIREBALL' ? 12 : 10));
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
          if (p.type !== 'FUME' && p.type !== 'FIREBALL') {
              ctx.strokeStyle = '#166534';
              ctx.lineWidth = 1;
              ctx.stroke();
          }
          ctx.shadowBlur = 0; // Reset
      });

      this.suns.forEach(s => {
          ctx.save();
          ctx.translate(s.x, s.y);
          
          const scale = s.value === 15 ? 0.7 : 1;
          ctx.scale(scale, scale);

          ctx.save();
          ctx.rotate(this.frame * 0.02); 
          ctx.fillStyle = '#fbbf24';
          for(let i = 0; i < 8; i++) {
              ctx.rotate(Math.PI / 4);
              ctx.beginPath();
              ctx.moveTo(0, -20);
              ctx.lineTo(6, -34);
              ctx.lineTo(-6, -34);
              ctx.fill();
          }
          ctx.restore();

          const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, 22);
          grad.addColorStop(0, '#fef08a');
          grad.addColorStop(1, '#eab308');
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.ellipse(-6, -6, 8, 4, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
      });
      
      if (config.fog) {
        ctx.fillStyle = 'rgba(200, 200, 220, 0.85)';
        ctx.fillRect(GRID_OFFSET_X + (COLS/2) * CELL_SIZE, 0, 600, 600);
      }

      if (config.isNight && !config.fog) {
          ctx.fillStyle = 'rgba(0, 0, 50, 0.25)';
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
  }
}
