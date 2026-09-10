import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import ruTranslations from './locales/ru.json';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'ru',
    defaultNS: 'common',
    ns: ['common', 'translation'],
    supportedLngs: ['ru', 'en'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'medev_lang',
    },
    resources: {
      ru: {
        common: ruTranslations,
        translation: ruTranslations,
      },
      en: {
        common: enTranslations,
        translation: enTranslations,
      },
    },
  });

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    const normalized = lng?.startsWith('ru') ? 'ru' : 'en';
    localStorage.setItem('medev_lang', normalized);
    localStorage.setItem('i18nextLng', normalized);
    document.documentElement.lang = normalized;
    window.dispatchEvent(new CustomEvent('medev-language-changed', { detail: { lang: normalized } }));
  }
});

export default i18n;
