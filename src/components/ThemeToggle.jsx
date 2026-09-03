import { memo } from 'react'
import { useTranslation } from 'react-i18next'

// Botón que alterna entre tema claro y oscuro. Muestra el estado actual.
function ThemeToggle({ theme, onThemeChange }) {
  const { t } = useTranslation()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
      aria-label={isDark ? t('theme.toLight') : t('theme.toDark')}
    >
      {isDark ? t('theme.dark') : t('theme.light')}
    </button>
  )
}

export default memo(ThemeToggle)