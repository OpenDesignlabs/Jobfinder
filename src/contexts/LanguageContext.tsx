// ============================================================
// Language Context & Localization Provider
// Provides Gujarati (Default) ⇄ English instant switching
// Modeled after JobDirect v2 multi-lingual support
// ============================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'gu' | 'en';

interface LanguageContextType {
  language: Language;
  isGujarati: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (enText: string, guText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'jobdirect_language_pref';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'gu' || saved === 'en') return saved;
    } catch {
      // fallback
    }
    return 'gu'; // Default to Gujarati as per v2 specification
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  const isGujarati = language === 'gu';

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'gu' ? 'en' : 'gu'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Helper function to pick Gujarati if available and active, else English
  const t = (enText: string, guText?: string) => {
    if (isGujarati && guText && guText.trim()) return guText;
    return enText;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isGujarati,
        toggleLanguage,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
