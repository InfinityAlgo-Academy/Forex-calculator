'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language, TranslationKey } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRTL: () => boolean;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => {
        const lang = get().language;
        return translations[lang][key] || key;
      },
      isRTL: () => get().language === 'ar',
    }),
    {
      name: 'language-storage',
    }
  )
);
