// Historial de ciudades consultadas recientemente.
function History({ history, onSelect }) {
  if (history.length === 0) return null
  return (
    <div className="panel">
      <h3>Recientes</h3>
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

export default History