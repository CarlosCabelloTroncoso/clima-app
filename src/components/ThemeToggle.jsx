import { memo } from 'react'
import { useTranslation } from 'react-i18next'

// Botón que alterna entre tema claro y oscuro. Muestra el estado actual.
// Recibe `isDark` ya resuelto (no el `theme` crudo): en modo "auto" el tema
// visible depende de la preferencia del sistema, y ese cálculo ya lo hace
// App.jsx — si este componente lo recalculara por su cuenta a partir de
// `theme === 'dark'`, mostraría "Claro" aunque la página esté oscura por
// auto+SO oscuro.
function ThemeToggle({ isDark, onThemeChange }) {
  const { t } = useTranslation()
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
