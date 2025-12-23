
import React from 'react';
import { GameScreen, LevelType } from '../types';
import { useLanguage } from '../LanguageContext';

interface Props {
  onSelectLevel: (type: LevelType) => void;
  onNavigate: (screen: GameScreen) => void;
}

export const MainMenu: React.FC<Props> = ({ onSelectLevel, onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full h-screen bg-green-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">🧠</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-20 animate-bounce">🌻</div>
      
      <div className="z-10 bg-green-800 p-8 rounded-2xl shadow-2xl border-4 border-green-600 max-w-4xl w-full">
        <h1 className="text-6xl font-black text-center text-white mb-2 tracking-tighter drop-shadow-lg uppercase">
            {t('TITLE')}
        </h1>
        <p className="text-center text-green-200 mb-8 font-mono text-xl">{t('SUBTITLE')}</p>

        <div className="grid grid-cols-2 gap-8">
            {/* Level Selector */}
            <div className="space-y-3">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-400 pb-2">{t('ADVENTURE_MODE')}</h2>
                <LevelButton label={`1-1 ${t('LEVEL_DAY')}`} onClick={() => onSelectLevel(LevelType.DAY)} emoji="☀️" />
                <LevelButton label={`2-1 ${t('LEVEL_NIGHT')}`} onClick={() => onSelectLevel(LevelType.NIGHT)} emoji="🌙" />
                <LevelButton label={`3-1 ${t('LEVEL_POOL')}`} onClick={() => onSelectLevel(LevelType.POOL_DAY)} emoji="🏊" />
                <LevelButton label={`3-10 ${t('LEVEL_FOG')}`} onClick={() => onSelectLevel(LevelType.POOL_NIGHT)} emoji="🌫️" />
                <LevelButton label={`5-1 ${t('LEVEL_ROOF')}`} onClick={() => onSelectLevel(LevelType.ROOF_DAY)} emoji="🏠" />
                <LevelButton label={`5-10 ${t('LEVEL_ROOF_NIGHT')}`} onClick={() => onSelectLevel(LevelType.ROOF_NIGHT)} emoji="🌃" />
            </div>

            {/* Extras */}
            <div className="space-y-3">
                <h2 className="text-2xl font-bold text-blue-400 mb-4 border-b border-blue-400 pb-2">{t('EXTRAS')}</h2>
                <button 
                    onClick={() => onNavigate(GameScreen.ALMANAC_PLANTS)}
                    className="w-full p-4 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded flex items-center justify-between transition-colors border-2 border-amber-900"
                >
                    <span>{t('ALMANAC_PLANTS')}</span>
                    <span className="text-2xl">📖</span>
                </button>
                <button 
                    onClick={() => onNavigate(GameScreen.ALMANAC_ZOMBIES)}
                    className="w-full p-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded flex items-center justify-between transition-colors border-2 border-gray-900"
                >
                    <span>{t('ALMANAC_ZOMBIES')}</span>
                    <span className="text-2xl">🧟</span>
                </button>
                
                <button 
                    onClick={() => onNavigate(GameScreen.OPTIONS)}
                    className="w-full p-4 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded flex items-center justify-between transition-colors border-2 border-purple-900 mt-4"
                >
                    <span>{t('OPTIONS')}</span>
                    <span className="text-2xl">⚙️</span>
                </button>
            </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-green-600 text-sm">
        {t('INSTRUCTIONS')}
      </div>
    </div>
  );
};

const LevelButton: React.FC<{ label: string, onClick: () => void, emoji: string }> = ({ label, onClick, emoji }) => (
    <button 
        onClick={onClick}
        className="w-full py-3 px-4 bg-green-700 hover:bg-green-600 text-white font-bold rounded flex items-center justify-between transition-all transform hover:scale-[1.02] shadow-md"
    >
        <span>{label}</span>
        <span className="text-2xl">{emoji}</span>
    </button>
);
