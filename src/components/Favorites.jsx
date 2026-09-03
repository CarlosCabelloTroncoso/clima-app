import { memo } from 'react'
import { useTranslation } from 'react-i18next'

// Lista de ciudades favoritas, con un clic para volver a consultarlas y la
// opción de limpiarlas todas.
function Favorites({ favorites, onSelect, onRemove, onClear }) {
  const { t } = useTranslation()
  if (favorites.length === 0) return null
  return (
    <div className="panel">
      <div className="panel-header">
        <h3>{t('favorites.title')}</h3>
        <button type="button" className="clear" onClick={onClear}>
          {t('favorites.clear')}
        </button>
      </div>
      <ul className="city-list">
        {favorites.map((city) => (
          <li key={city.id}>
            <button type="button" className="city-name" onClick={() => onSelect(city)}>
              {city.name}
            </button>
            <button
              type="button"
              className="remove"
              onClick={() => onRemove(city.id)}
              aria-label={t('favorites.remove')}
            >
              ★
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default memo(Favorites)
