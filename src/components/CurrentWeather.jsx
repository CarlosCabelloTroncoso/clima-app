import { memo } from 'react'
import { weatherInfo } from '../lib/weather'

// Tarjeta con el estado del tiempo actual: temperatura, descripción y métricas.
// Incluye un botón para marcar o desmarcar la ciudad como favorita.
function CurrentWeather({ location, current, isFavorite, onToggleFavorite }) {
  const info = weatherInfo(current.weather_code)
  return (
    <div className="card current">
      <div className="current-title">
        <h2>{location}</h2>
        <button
          type="button"
          className={isFavorite ? 'fav active' : 'fav'}
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-pressed={isFavorite}
        >
          ★
        </button>
      </div>
      <div className="big-emoji">{info.emoji}</div>
      <div className="temp">{Math.round(current.temperature_2m)}°C</div>
      <p className="condition">{info.label}</p>
      <div className="stats">
        <span className="stat">
          💨 <strong>{Math.round(current.wind_speed_10m)}</strong> km/h
        </span>
        <span className="stat">
          💧 <strong>{current.relative_humidity_2m}%</strong> humedad
        </span>
      </div>
    </div>
  )
}

export default memo(CurrentWeather)