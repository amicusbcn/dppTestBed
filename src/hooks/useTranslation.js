import es from "../i18n/es.json";
import en from "../i18n/en.json";

const translations = {
  es,
  en,
};

export function useTranslation(lang) {
  const currentLang = translations[lang] || translations.es;

  const t = (key) => {
    const keys = key.split(".");
    let result = currentLang;
    for (const k of keys) {
      if (result[k] === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      result = result[k];
    }
    return result;
  };

  return { t };
}