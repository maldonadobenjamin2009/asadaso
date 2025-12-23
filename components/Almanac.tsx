
import React, { useState } from 'react';
import { PLANTS, ZOMBIES } from '../constants';
import { useLanguage } from '../LanguageContext';

interface Props {
  mode: 'PLANTS' | 'ZOMBIES';
  onBack: () => void;
}

export const Almanac: React.FC<Props> = ({ mode, onBack }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { t } = useLanguage();

  const items = mode === 'PLANTS' 
    ? Object.values(PLANTS).filter(p => !p.isInternal) 
    : Object.values(ZOMBIES);
  const selectedItem = selectedId ? (mode === 'PLANTS' ? PLANTS[selectedId] : ZOMBIES[selectedId]) : null;

  return (
    <div className="w-full h-screen bg-amber-100 text-amber-900 p-8 flex flex-col relative">
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
        
        <h1 className="text-4xl font-serif font-bold text-center mb-8 drop-shadow-md">
            {mode === 'PLANTS' ? t('ALMANAC_PLANTS') : t('ALMANAC_ZOMBIES')}
        </h1>

        <div className="flex flex-1 gap-8 overflow-hidden z-10">
            {/* List */}
            <div className="w-1/2 overflow-y-auto grid grid-cols-4 gap-4 content-start p-4 bg-white bg-opacity-50 rounded-lg shadow-inner border border-amber-300">
                {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`
                            aspect-square flex items-center justify-center text-4xl rounded-lg border-2 transition-colors
                            ${selectedId === item.id ? 'bg-green-200 border-green-600' : 'bg-amber-50 border-amber-200 hover:bg-amber-100'}
                        `}
                    >
                        {item.emoji}
                    </button>
                ))}
            </div>

            {/* Details */}
            <div className="w-1/2 bg-amber-50 rounded-lg shadow-xl border-4 border-amber-700 p-8 flex flex-col items-center text-center relative">
                {selectedItem ? (
                    <>
                         <div className="text-8xl mb-6 animate-bounce">{selectedItem.emoji}</div>
                         {/* Translate Name and Desc using ID as key fallback */}
                         <h2 className="text-3xl font-bold mb-2">{t(`${selectedItem.id}_NAME`, selectedItem.name)}</h2>
                         <p className="italic text-gray-600 mb-4">"{t(`${selectedItem.id}_DESC`, selectedItem.description)}"</p>
                         
                         <div className="w-full bg-amber-200 p-4 rounded-lg text-left space-y-2">
                             {'cost' in selectedItem && (
                                 <div className="flex justify-between">
                                     <span className="font-bold">{t('COST')}:</span>
                                     <span>{selectedItem.cost}</span>
                                 </div>
                             )}
                             {'hp' in selectedItem && (
                                 <div className="flex justify-between">
                                     <span className="font-bold">{t('TOUGHNESS')}:</span>
                                     <span className="text-red-600">{'❤️'.repeat(Math.ceil(selectedItem.hp / 100))}</span>
                                 </div>
                             )}
                              {'damage' in selectedItem && (
                                 <div className="flex justify-between">
                                     <span className="font-bold">{t('DAMAGE')}:</span>
                                     <span>{selectedItem.damage}</span>
                                 </div>
                             )}
                             {'cooldown' in selectedItem && (
                                 <div className="flex justify-between">
                                     <span className="font-bold">{t('RECHARGE')}:</span>
                                     <span>{selectedItem.cooldown > 600 ? 'Slow' : 'Fast'}</span>
                                 </div>
                             )}
                             {'speed' in selectedItem && (
                                 <div className="flex justify-between">
                                     <span className="font-bold">{t('SPEED')}:</span>
                                     <span>{(selectedItem as any).speed}</span>
                                 </div>
                             )}
                         </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 font-style-italic">
                        {t('SELECT_ENTRY')}
                    </div>
                )}
            </div>
        </div>

        <button 
            onClick={onBack}
            className="absolute bottom-8 left-8 px-6 py-3 bg-green-700 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-transform active:scale-95 z-20"
        >
            {t('BACK_MENU')}
        </button>
    </div>
  );
};
