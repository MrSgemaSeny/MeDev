import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import ruTranslations from './locales/ru.json';

const savedLng = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null;
const initialLng = (savedLng && (savedLng.startsWith('ru') || savedLng.startsWith('en')))
  ? (savedLng.startsWith('ru') ? 'ru' : 'en')
  : 'ru';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ru: { translation: ruTranslations }
    },
    lng: initialLng,
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'en'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    const normalized = lng?.startsWith('ru') ? 'ru' : 'en';
    localStorage.setItem('i18nextLng', normalized);
    document.documentElement.lang = normalized;
  }
});

export default i18n;
