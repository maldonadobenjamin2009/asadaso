
import React, { useState, useEffect } from 'react';
import { PLANTS } from '../constants';
import { LevelType } from '../types';
import { useLanguage } from '../LanguageContext';

interface Props {
  levelType: LevelType;
  onStart: (selectedPlants: string[]) => void;
  onBack: () => void;
}

export const SeedSelection: React.FC<Props> = ({ levelType, onStart, onBack }) => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string[]>([]);
  const MAX_SEEDS = 8;

  // Pre-select some reasonable defaults or start empty?
  // Let's start empty for interactivity, but maybe ensure user knows what to do.
  useEffect(() => {
      // Optional: Pre-select essential plants based on level
      // const defaults = ['SUNFLOWER', 'PEASHOOTER'];
      // setSelected(defaults);
  }, []);

  const togglePlant = (id: string) => {
    if (selected.includes(id)) {
        setSelected(selected.filter(p => p !== id));
    } else {
        if (selected.length < MAX_SEEDS) {
            setSelected([...selected, id]);
        }
    }
  };

  const plantList = Object.values(PLANTS).filter(p => !p.isInternal);

  return (
    <div className="w-full h-screen bg-[#5d4037] flex flex-col text-white select-none relative">
        {/* Header / Selected Seeds */}
        <div className="bg-[#3e2723] p-4 shadow-lg border-b-4 border-[#271c19] flex flex-col items-center z-10">
             <h2 className="text-2xl font-bold text-[#ffeb3b] mb-2 drop-shadow-md">{t('CHOOSE_SEEDS')} {selected.length}/{MAX_SEEDS}</h2>
             <div className="flex gap-2 h-24 items-center bg-[#4e342e] p-2 rounded-lg shadow-inner">
                 {Array.from({ length: MAX_SEEDS }).map((_, i) => {
                     const plantId = selected[i];
                     const plant = plantId ? PLANTS[plantId] : null;
                     return (
                         <div 
                            key={i} 
                            onClick={() => plantId && togglePlant(plantId)}
                            className={`
                                w-16 h-20 border-2 rounded bg-[#5d4037] flex items-center justify-center relative cursor-pointer transition-transform hover:scale-105
                                ${plantId ? 'border-[#8d6e63] bg-green-800' : 'border-[#3e2723] opacity-50'}
                            `}
                         >
                             {plant && (
                                 <>
                                     <div className="text-3xl">{plant.emoji}</div>
                                     <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-xs px-1">{plant.cost}</div>
                                 </>
                             )}
                         </div>
                     )
                 })}
             </div>
        </div>

        {/* Main Catalog */}
        <div className="flex-1 overflow-y-auto p-8 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]">
            <div className="grid grid-cols-6 lg:grid-cols-8 gap-4 max-w-5xl mx-auto">
                {plantList.map((plant) => {
                    const isSelected = selected.includes(plant.id);
                    const isDisabled = !isSelected && selected.length >= MAX_SEEDS;

                    return (
                        <button
                            key={plant.id}
                            onClick={() => togglePlant(plant.id)}
                            disabled={isDisabled}
                            className={`
                                relative p-2 flex flex-col items-center rounded-lg border-2 transition-all
                                ${isSelected ? 'bg-gray-600 border-gray-800 grayscale opacity-50' : 'bg-amber-100 border-amber-300 hover:bg-white hover:scale-110 shadow-md'}
                                ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                            `}
                        >
                             <div className="text-4xl mb-1">{plant.emoji}</div>
                             <div className="text-xs font-bold text-black bg-yellow-200 px-1 rounded border border-yellow-500">{plant.cost}</div>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-[#3e2723] flex justify-between items-center border-t-4 border-[#271c19]">
            <button 
                onClick={onBack}
                className="px-6 py-2 bg-red-700 text-white font-bold rounded border-2 border-red-900 hover:bg-red-600"
            >
                {t('BACK_MENU')}
            </button>

            <button 
                onClick={() => onStart(selected)}
                disabled={selected.length === 0}
                className={`
                    px-8 py-3 text-2xl font-black uppercase tracking-widest rounded shadow-lg transform transition-all
                    ${selected.length > 0 ? 'bg-gradient-to-b from-green-400 to-green-700 hover:scale-105 hover:from-green-300 hover:to-green-600 text-white border-b-4 border-green-900' : 'bg-gray-600 text-gray-400 cursor-not-allowed border-b-4 border-gray-800'}
                `}
            >
                {t('LETS_ROCK')}
            </button>
        </div>
    </div>
  );
};
