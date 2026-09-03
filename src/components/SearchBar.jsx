import { memo, useEffect, useState } from 'react'
import { searchCities } from '../lib/weather'

// Barra de búsqueda de ciudad con autocompletado. Lleva el formulario y
// deshabilita el botón mientras hay una petición en curso para evitar envíos
// duplicados. Sugiere ciudades mientras el usuario escribe, cancelando la
// petición anterior en cada tecleo para no pisar resultados desactualizados.
function SearchBar({ query, onQueryChange, onSubmit, onSelectCity, loading }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      setOpen(false)
      return undefined
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchCities(trimmed, (url) => fetch(url, { signal: controller.signal }))
        setSuggestions(results)
        setOpen(results.length > 0)
      } catch (err) {
        if (err.name !== 'AbortError') setSuggestions([])
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [query])

  function handleSelect(result) {
    setOpen(false)
    onSelectCity({
      id: String(result.id),
      name: `${result.name}, ${result.country || ''}`,
      lat: result.latitude,
      lon: result.longitude,
    })
  }

  return (
    <div className="search-wrap">
      <form
        onSubmit={(e) => {
          setOpen(false)
          onSubmit(e)
        }}
        className="search"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setOpen(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar una ciudad..."
          aria-label="Buscar una ciudad"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="city-suggestions"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {open && (
        <ul className="suggestions" id="city-suggestions" role="listbox">
          {suggestions.map((r) => (
            <li key={r.id} role="option" aria-selected="false">
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleSelect(r)}>
                {r.name}
                {r.admin1 ? `, ${r.admin1}` : ''}, {r.country}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default memo(SearchBar)
