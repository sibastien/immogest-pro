import React, { createContext, useContext, useState } from 'react';
import { translations, type Lang } from './i18n';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof translations.fr) => string;
  dir: 'ltr' | 'rtl';
}

const LangContext = createContext<LangContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (k) => k,
  dir: 'ltr',
});

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('public_lang') as Lang) || 'fr';
  });

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('public_lang', l);
  };

  const t = (key: keyof typeof translations.fr): string =>
    (translations[lang] as Record<string, string>)[key] ?? key;

  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LangContext.Provider value={{ lang, setLang: handleSetLang, t, dir }}>
      <div dir={dir} lang={lang} style={{ fontFamily: lang === 'ar' ? "'Noto Sans Arabic', 'Inter', sans-serif" : undefined }}>
        {children}
      </div>
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
