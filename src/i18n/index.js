import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json'
import en from './locales/en.json'

// Idiomas soportados. Cada uno mapea a su locale completo (usado en
// toLocaleDateString/toLocaleTimeString) y al código corto que espera la
// API de geocodificación de Open-Meteo (parámetro `language`).
export const LOCALE_MAP = {
  es: 'es-ES',
  en: 'en-US',
}

export const DEFAULT_LANGUAGE = 'es'

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
})

export default i18n
