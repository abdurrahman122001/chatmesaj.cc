import React, { createContext, useContext, useMemo } from "react";
import { ADMIN_LANGS, DEFAULT_ADMIN_LANG, getAdminI18n, tr } from "./adminI18n.js";

const LanguageContext = createContext({
  language: DEFAULT_ADMIN_LANG,
  setLanguage: () => {},
  t: getAdminI18n(DEFAULT_ADMIN_LANG),
  tr: (key, fallback) => tr(DEFAULT_ADMIN_LANG, key, fallback),
});

export function LanguageProvider({ language, setLanguage, children }) {
  const safeLang = ADMIN_LANGS.includes(language) ? language : DEFAULT_ADMIN_LANG;
  const value = useMemo(() => ({
    language: safeLang,
    setLanguage: setLanguage || (() => {}),
    t: getAdminI18n(safeLang),
    tr: (key, fallback) => tr(safeLang, key, fallback),
  }), [safeLang, setLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

// Hook: returns a translate function `t(key, fallback?)`.
export function useT() {
  const { tr } = useContext(LanguageContext);
  return tr;
}
