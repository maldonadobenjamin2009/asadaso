
import React from 'react';
import { useLanguage } from '../LanguageContext';

export const OptionsMenu = ({ onBack }: { onBack: () => void }) => {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center relative">
       <div className="bg-gray-800 p-8 rounded-lg border-4 border-gray-600 text-center shadow-2xl">
          <h1 className="text-4xl text-white font-bold mb-8 font-serif">{t('OPTIONS')}</h1>
          
          <div className="flex flex-col space-y-4 mb-8">
             <button 
               onClick={() => setLanguage('EN')}
               className={`px-8 py-4 text-xl font-bold rounded border-2 transition-all transform hover:scale-105 ${language === 'EN' ? 'bg-green-600 border-green-400 text-white ring-2 ring-green-300' : 'bg-gray-700 border-gray-500 text-gray-300'}`}
             >
               {t('LANG_EN')}
             </button>
             <button 
               onClick={() => setLanguage('ES')}
               className={`px-8 py-4 text-xl font-bold rounded border-2 transition-all transform hover:scale-105 ${language === 'ES' ? 'bg-green-600 border-green-400 text-white ring-2 ring-green-300' : 'bg-gray-700 border-gray-500 text-gray-300'}`}
             >
               {t('LANG_ES')}
             </button>
          </div>

          <button 
            onClick={onBack} 
            className="px-6 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-500 border-2 border-red-800 shadow-lg"
          >
             {t('BACK_MENU')}
          </button>
       </div>
    </div>
  )
}
