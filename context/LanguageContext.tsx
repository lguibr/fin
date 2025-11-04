import React, { createContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'pt' | 'es';
type Translations = Record<string, string>;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    const initialLang = ['en', 'pt', 'es'].includes(browserLang) ? browserLang as Language : 'en';
    setLanguage(initialLang);
  }, []);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) throw new Error('Failed to load translations');
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Could not load translation file:", error);
        // Fallback to English on error
        const response = await fetch(`/locales/en.json`);
        const data = await response.json();
        setTranslations(data);
      }
    };
    fetchTranslations();
  }, [language]);

  const t = (key: string, params: Record<string, string | number> = {}) => {
    let translation = translations[key] || key;
    Object.keys(params).forEach(paramKey => {
      translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
    });
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};