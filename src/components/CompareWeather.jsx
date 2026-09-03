import { memo, useState } from 'react'
import { weatherInfo, formatTemp } from '../lib/weather'
import SearchBar from './SearchBar'

// Mini tarjeta con el estado del tiempo de una ciudad, usada en la comparación.
function MiniCity({ name, current, units }) {
  const info = weatherInfo(current.weather_code)
  return (
    <div className="compare-city">
      <span className="compare-city-name">{name}</span>
      <span className="compare-city-emoji">{info.emoji}</span>
      <span className="compare-city-temp">{formatTemp(current.temperature_2m, units)}</span>
      <span className="compare-city-meta">
        💨 {Math.round(current.wind_speed_10m)} km/h · 💧 {current.relative_humidity_2m}%
      </span>
    </div>
  )
}

// Permite buscar una segunda ciudad y ver su clima actual junto al de la
// ciudad principal, lado a lado. La ciudad principal siempre es la que
// controla el fondo 3D; comparar es solo una vista de datos.
function CompareWeather({ primaryLocation, primaryCurrent, compareCity, compareCurrent, loading, units, onSearch, onSelectCity, onRemove }) {
  const [query, setQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!query.trim() || loading) return
    onSearch(query)
    setQuery('')
  }

  function handleSelect(city) {
    setQuery('')
    onSelectCity(city)
  }

  return (
    <div className="card compare">
      <div className="compare-header">
        <h3>Comparar con otra ciudad</h3>
        {compareCity && (
          <button type="button" className="clear" onClick={onRemove}>
            Quitar
          </button>
        )}
      </div>

      {!compareCity && (
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          onSubmit={handleSubmit}
          onSelectCity={handleSelect}
          loading={loading}
        />
      )}

      {compareCity && compareCurrent && (
        <div className="compare-grid">
          <MiniCity name={primaryLocation} current={primaryCurrent} units={units} />
          <MiniCity name={compareCity.name} current={compareCurrent} units={units} />
        </div>
      )}
    </div>
  )
}

export default memo(CompareWeather)
