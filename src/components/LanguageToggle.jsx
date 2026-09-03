import { memo } from 'react'
import { useTranslation } from 'react-i18next'

// Botón que alterna el idioma de la interfaz entre español e inglés.
function LanguageToggle({ language, onLanguageChange }) {
  const { t } = useTranslation()
  const isEs = language === 'es'
  return (
    <button
      type="button"
      className="language-toggle"
      onClick={() => onLanguageChange(isEs ? 'en' : 'es')}
      aria-label={isEs ? t('language.switchToEn') : t('language.switchToEs')}
    >
      {isEs ? 'ES' : 'EN'}
    </button>
  )
}

export default memo(LanguageToggle)
