// Lista de ciudades favoritas, con un clic para volver a consultarlas.
function Favorites({ favorites, onSelect, onRemove }) {
  if (favorites.length === 0) return null
  return (
    <div className="panel">
      <h3>Favoritos</h3>
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