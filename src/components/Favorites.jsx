// Lista de ciudades favoritas, con un clic para volver a consultarlas y la
// opción de limpiarlas todas.
function Favorites({ favorites, onSelect, onRemove, onClear }) {
  if (favorites.length === 0) return null
  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Favoritos</h3>
        <button type="button" className="clear" onClick={onClear}>
          Limpiar
        </button>
      </div>
      <ul className="city-list">
        {favorites.map((city) => (
          <li key={city.id}>
            <button type="button" className="city-name" onClick={() => onSelect(city)}>
              {city.name}
            </button>
            <button type="button" className="remove" onClick={() => onRemove(city.id)} aria-label="Quitar favorito">
              ★
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Favorites