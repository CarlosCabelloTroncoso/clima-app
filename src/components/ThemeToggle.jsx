import { memo } from 'react'

// Botón que alterna entre tema claro y oscuro. Muestra el estado actual.
function ThemeToggle({ theme, onThemeChange }) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {isDark ? '🌙 Oscuro' : '☀️ Claro'}
    </button>
  )
}

export default memo(ThemeToggle)