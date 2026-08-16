import { memo } from 'react'

// Barra de búsqueda de ciudad. Lleva el formulario y deshabilita el botón
// mientras hay una petición en curso para evitar envíos duplicados.
function SearchBar({ query, onQueryChange, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="search">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Buscar una ciudad..."
        aria-label="Buscar una ciudad"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  )
}

export default memo(SearchBar)