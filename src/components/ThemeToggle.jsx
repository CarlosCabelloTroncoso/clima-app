// Botón que alterna entre tema claro y oscuro. El modo automático se mantiene
// internamente como valor por defecto al primer clic.
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

export default ThemeToggle