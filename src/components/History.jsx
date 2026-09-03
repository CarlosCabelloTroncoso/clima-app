import { memo } from 'react'
import { useTranslation } from 'react-i18next'

// Historial de ciudades consultadas recientemente, con opción de limpiarlo.
function History({ history, onSelect, onClear }) {
  const { t } = useTranslation()
  if (history.length === 0) return null
  return (
    <div className="panel">
      <div className="panel-header">
        <h3>{t('history.title')}</h3>
        <button type="button" className="clear" onClick={onClear}>
          {t('history.clear')}
        </button>
      </div>
      <ul className="city-list">
        {history.map((city) => (
          <li key={city.id}>
            <button type="button" className="city-name" onClick={() => onSelect(city)}>
              {city.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default memo(History)
