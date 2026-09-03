import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json'
import en from './locales/en.json'
import { readLanguage } from '../lib/storage'

// Idiomas soportados. Cada uno mapea a su locale completo (usado en
// toLocaleDateString/toLocaleTimeString) y al código corto que espera la
// API de geocodificación de Open-Meteo (parámetro `language`).
export const LOCALE_MAP = {
  es: 'es-ES',
  en: 'en-US',
}

export const DEFAULT_LANGUAGE = 'es'
const SUPPORTED_LANGUAGES = ['es', 'en']

// Resuelve el idioma inicial ANTES de inicializar i18next, a partir de lo
// guardado en localStorage. Sin esto, i18next siempre arranca en
// DEFAULT_LANGUAGE y recién cambia al idioma real (vía useLanguage) después
// del primer render — un usuario que ya eligió inglés vería un parpadeo en
// español en cada carga. No usa detección de idioma del navegador acá
// a propósito: en tests (jsdom) navigator.language no es 'es', y eso
// rompería todas las aserciones en español si se usara para el arranque
// síncrono. La detección por navegador sigue existiendo solo como valor
// por defecto de useLanguage para una visita nueva sin preferencia guardada.
function resolveInitialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  return readLanguage(window.localStorage, SUPPORTED_LANGUAGES) || DEFAULT_LANGUAGE
}

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: resolveInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
})

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language
}

export default i18n
