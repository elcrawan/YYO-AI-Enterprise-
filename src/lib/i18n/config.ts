import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import arTranslations from './locales/ar.json'
import enTranslations from './locales/en.json'

const resources = {
  ar: {
    translation: arTranslations,
  },
  en: {
    translation: enTranslations,
  },
}

export const initI18n = async () => {
  if (!i18n.isInitialized) {
    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng: 'ar',
        debug: process.env.NODE_ENV === 'development',
        
        detection: {
          order: ['localStorage', 'navigator', 'htmlTag'],
          caches: ['localStorage'],
          lookupLocalStorage: 'yyo-language',
        },

        interpolation: {
          escapeValue: false,
        },

        react: {
          useSuspense: false,
        },
      })
  }
  
  return i18n
}

export default i18n

