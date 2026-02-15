import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import or from './locales/or.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi }, or: { translation: or } },
  lng: localStorage.getItem('resqai-lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => localStorage.setItem('resqai-lang', lng));

export default i18n;
