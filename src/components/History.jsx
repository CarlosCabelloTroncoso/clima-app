import { memo } from 'react'

// Historial de ciudades consultadas recientemente, con opción de limpiarlo.
function History({ history, onSelect, onClear }) {
  if (history.length === 0) return null
  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Recientes</h3>
        <button type="button" className="clear" onClick={onClear}>
          Limpiar
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