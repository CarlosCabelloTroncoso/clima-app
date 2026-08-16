// Selector de tema con tres opciones: claro, oscuro y automático.
function ThemeToggle({ theme, onThemeChange }) {
  const options = [
    { value: 'light', label: '☀️ Claro' },
    { value: 'dark', label: '🌙 Oscuro' },
    { value: 'auto', label: '🖥️ Auto' },
  ]
  return (
    <div className="theme-toggle" role="group" aria-label="Tema de la interfaz">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={theme === opt.value ? 'active' : ''}
          onClick={() => onThemeChange(opt.value)}
          aria-pressed={theme === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default ThemeToggle