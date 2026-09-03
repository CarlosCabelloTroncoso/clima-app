import { memo } from 'react'
import { useTranslation } from 'react-i18next'

// Botón que alterna entre unidades métricas (°C, km/h) e imperiales (°F, mph).
function UnitsToggle({ units, onUnitsChange }) {
  const { t } = useTranslation()
  const isImperial = units === 'imperial'
  return (
    <button
      type="button"
      className="units-toggle"
      onClick={() => onUnitsChange(isImperial ? 'metric' : 'imperial')}
      aria-label={isImperial ? t('units.toMetric') : t('units.toImperial')}
    >
      {isImperial ? '°F' : '°C'}
    </button>
  )
}

export default memo(UnitsToggle)
