
import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../services/GameEngine';
import { CELL_SIZE, GRID_OFFSET_X, GRID_OFFSET_Y, GameScreen, LevelType } from '../types';
import { PLANTS } from '../constants';
import { useLanguage } from '../LanguageContext';

interface Props {
  levelType: LevelType;
  seedIds: string[];
  onExit: () => void;
}

export const GameCanvas: React.FC<Props> = ({ levelType, seedIds, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const isPausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sun, setSun] = useState(50);
  const [score, setScore] = useState(0);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [waveProgress, setWaveProgress] = useState(0); // 0 to 1
  const [hugeWaveTrigger, setHugeWaveTrigger] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    engineRef.current = new GameEngine(levelType);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const loop = () => {
      if (!engineRef.current) return;
      
      // Only update game logic if not paused
      if (!isPausedRef.current) {
          engineRef.current.update();
      }

      // Always draw to keep canvas content
      engineRef.current.draw(ctx);
      
      // Sync State
      setSun(engineRef.current.sun);
      setScore(engineRef.current.score);
      setCooldowns({...engineRef.current.cooldowns});
      
      // Wave Progress
      const wIdx = engineRef.current.waveIndex;
      const wTotal = engineRef.current.totalWaves;
      setWaveProgress(Math.min(1, wIdx / wTotal));
      
      setHugeWaveTrigger(engineRef.current.isHugeWaveTriggered);
      
      if (engineRef.current.gameOver) {
          setGameOver(true);
      } else {
          animationId = requestAnimationFrame(loop);
      }
    };

    loop();

    return () => cancelAnimationFrame(animationId);
  }, [levelType]);

  // Cheat Codes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      
      // Accept '+' or Numpad '+'
      if (e.key === '+') {
        engineRef.current.sun += 500;
        engineRef.current.resetCooldowns(); // DEBUG: Reset Cooldowns
        setSun(engineRef.current.sun);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || gameOver || isPaused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    // Map screen coordinates to canvas internal resolution (1000x600)
    // The canvas is stretched via CSS (w-full h-full), so we must scale the click.
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // 1. Try collect sun
    const prevSun = engineRef.current.sun;
    engineRef.current.collectSun(x, y);
    if (engineRef.current.sun > prevSun) return; // Collected sun, stop here

    // 2. Try Plant
    if (selectedPlant) {
        const col = Math.floor((x - GRID_OFFSET_X) / CELL_SIZE);
        const row = Math.floor((y - GRID_OFFSET_Y) / CELL_SIZE);
        
        const success = engineRef.current.tryPlant(col, row, selectedPlant);
        if (success) {
            setSelectedPlant(null);
        }
    }
  };

  const togglePause = () => {
      if (gameOver) return;
      const newState = !isPaused;
      setIsPaused(newState);
      isPausedRef.current = newState;
  };

  return (
    <div className="relative w-full h-full flex justify-center items-center bg-gray-900 overflow-hidden">
      {/* HUD */}
      <div className="absolute top-0 left-0 w-full h-[90px] bg-gray-800 bg-opacity-95 border-b-4 border-green-800 flex items-center px-4 z-10 overflow-x-auto shadow-xl">
         {/* Sun Counter */}
         <div className="flex flex-col items-center mr-4 bg-yellow-100 p-1.5 rounded border-2 border-yellow-600 min-w-[70px] shadow-inner">
             <span className="text-2xl">☀️</span>
             <span className="font-bold text-black text-xl leading-none">{sun}</span>
         </div>

         {/* Seed Packets */}
         <div className="flex space-x-1.5">
             {seedIds.map(pid => {
                 const def = PLANTS[pid];
                 if (!def) return null;
                 const canAfford = sun >= def.cost;
                 
                 // Calculate Cooldown
                 const remaining = cooldowns[pid] || 0;
                 const total = def.cooldown;
                 const isReady = remaining <= 0;
                 const pct = remaining / total;
                 const isDisabled = !canAfford || !isReady || isPaused;

                 return (
                     <button 
                        key={pid}
                        onClick={() => isReady && setSelectedPlant(pid)}
                        disabled={isDisabled}
                        className={`
                            flex flex-col items-center p-1 w-14 h-[72px] rounded-lg border-2 transition-all relative overflow-hidden
                            ${selectedPlant === pid ? 'border-yellow-400 bg-green-700 scale-105 ring-2 ring-yellow-300 z-20' : 'border-gray-600 bg-gray-700'}
                            ${(!canAfford || isPaused) && isReady ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                            ${isReady && canAfford ? 'hover:bg-gray-600 cursor-pointer hover:scale-105' : ''}
                        `}
                     >
                         <div className="text-2xl mt-1 relative z-10">{def.emoji}</div>
                         <div className="absolute bottom-0.5 right-0.5 text-[10px] font-bold text-black bg-yellow-200 px-1 rounded border border-yellow-500 shadow-sm z-10">{def.cost}</div>
                         
                         {/* Cooldown Overlay */}
                         {!isReady && (
                             <div 
                                className="absolute top-0 left-0 w-full bg-black bg-opacity-60 z-20 transition-all duration-75 ease-linear"
                                style={{ height: `${pct * 100}%` }}
                             />
                         )}
                     </button>
                 )
             })}
         </div>
         
         {/* Spacer */}
         <div className="flex-1"></div>

         {/* Wave Progress Bar */}
         <div className="hidden md:flex flex-col items-end mr-4 w-[200px]">
             <div className="text-xs text-gray-400 mb-1 font-mono">{t('SCORE')}: {score}</div>
             <div className="relative w-full h-4 bg-gray-700 border border-gray-500 rounded-full overflow-visible">
                 {/* Fill */}
                 <div 
                    className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${waveProgress * 100}%` }}
                 ></div>
                 
                 {/* Flags */}
                 <div className="absolute -top-2 left-[30%] text-sm transform -translate-x-1/2">🚩</div>
                 <div className="absolute -top-2 left-[60%] text-sm transform -translate-x-1/2">🚩</div>
                 <div className="absolute -top-2 right-0 text-sm transform translate-x-1/4">🏴‍☠️</div>
             </div>
         </div>

         <button 
            onClick={togglePause} 
            className="ml-2 px-3 py-1.5 bg-blue-600 text-white font-bold rounded hover:bg-blue-500 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 text-sm"
         >
             {t('PAUSE')}
         </button>
      </div>
      
      {/* Huge Wave Notification */}
      {hugeWaveTrigger && (
        <div className="absolute top-[150px] w-full text-center z-40 animate-bounce">
             <h2 className="text-4xl md:text-6xl font-black text-red-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] stroke-black tracking-widest" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                 {t('HUGE_WAVE')}
             </h2>
        </div>
      )}

      {/* Pause Modal */}
      {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-green-900 p-8 rounded-xl border-4 border-green-600 shadow-2xl text-center max-w-sm w-full">
                  <h2 className="text-3xl text-white font-bold mb-8 font-serif tracking-wider text-shadow">{t('GAME_PAUSED')}</h2>
                  
                  <div className="flex flex-col gap-4">
                      <button 
                          onClick={togglePause}
                          className="px-6 py-3 bg-green-600 text-white font-bold rounded hover:bg-green-500 border-b-4 border-green-800 active:translate-y-1 active:border-b-0 shadow-lg"
                      >
                          {t('RESUME')}
                      </button>
                      
                      <button 
                          onClick={onExit}
                          className="px-6 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-500 border-b-4 border-red-800 active:translate-y-1 active:border-b-0 shadow-lg"
                      >
                          {t('QUIT_TO_MENU')}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Game Over Modal */}
      {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-85 flex flex-col items-center justify-center z-50 animate-fadeIn backdrop-blur-sm">
              <h1 className="text-5xl md:text-6xl font-bold text-red-600 mb-4 font-mono text-center px-4 drop-shadow-[0_0_15px_rgba(220,38,38,1)]">{t('GAME_OVER')}</h1>
              <p className="text-2xl text-white mb-8 font-bold">{t('SCORE')}: {score}</p>
              <button 
                onClick={onExit}
                className="px-8 py-4 bg-green-600 text-white text-2xl font-bold rounded hover:bg-green-500 border-b-4 border-green-800 shadow-lg"
              >
                  {t('RETURN_MENU')}
              </button>
          </div>
      )}

      <canvas 
        ref={canvasRef} 
        width={1000} 
        height={600} 
        className="w-full h-full block"
        style={{ touchAction: 'none' }}
        onClick={handleCanvasClick}
      />
    </div>
  );
};
