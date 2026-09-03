import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { readLanguage, writeLanguage } from '../lib/storage'
import { DEFAULT_LANGUAGE } from '../i18n'

const SUPPORTED = ['es', 'en']

// Detecta el idioma del navegador entre los soportados, o usa el idioma por
// defecto de la app si no coincide con ninguno.
function detectLanguage() {
  const short = navigator.language?.slice(0, 2)
  return SUPPORTED.includes(short) ? short : DEFAULT_LANGUAGE
}

// Hook que gestiona el idioma de la interfaz: lo sincroniza con i18next y con
// el atributo lang del documento (relevante para lectores de pantalla), y
// persiste la preferencia del usuario.
export default function useLanguage(storage) {
  const { i18n } = useTranslation()
  const [language, setLanguage] = useState(() => readLanguage(storage, SUPPORTED) || detectLanguage())

  useEffect(() => {
    writeLanguage(storage, language)
    i18n.changeLanguage(language)
    document.documentElement.lang = language
  }, [language, storage, i18n])

  return { language, setLanguage }
}
