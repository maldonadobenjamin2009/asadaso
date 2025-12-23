
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from './types';
import { TRANSLATIONS } from './constants';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultVal?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('EN');

  const t = (key: string, defaultVal: string = '') => {
    // If English, return defaultVal if provided (assumed to be the EN string from objects), 
    // otherwise try to find it in TRANSLATIONS.EN.
    // Note: UI keys are in TRANSLATIONS.EN. Plant props are in the constant objects themselves.
    
    if (language === 'EN') {
       const enVal = TRANSLATIONS['EN'][key];
       return enVal || defaultVal || key;
    }

    // For other languages (ES)
    const langMap = TRANSLATIONS[language];
    if (!langMap) return defaultVal || key;

    const val = langMap[key];
    return val || defaultVal || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
