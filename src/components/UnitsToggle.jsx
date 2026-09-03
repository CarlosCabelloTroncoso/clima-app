import { memo } from 'react'

// Botón que alterna entre unidades métricas (°C, km/h) e imperiales (°F, mph).
function UnitsToggle({ units, onUnitsChange }) {
  const isImperial = units === 'imperial'
  return (
    <button
      type="button"
      className="units-toggle"
      onClick={() => onUnitsChange(isImperial ? 'metric' : 'imperial')}
      aria-label={isImperial ? 'Cambiar a unidades métricas' : 'Cambiar a unidades imperiales'}
    >
      {isImperial ? '°F' : '°C'}
    </button>
  )
}

export default memo(UnitsToggle)
