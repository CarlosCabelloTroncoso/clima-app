import { memo } from 'react'
import { weatherInfo, formatTemp, formatWind, airQualityLevel } from '../lib/weather'

// Tarjeta con el estado del tiempo actual: temperatura, descripción y métricas.
// Incluye un botón para marcar o desmarcar la ciudad como favorita.
function CurrentWeather({ location, current, daily, air, isFavorite, onToggleFavorite, units }) {
  const info = weatherInfo(current.weather_code)
  const uv = daily?.uv_index_max?.[0]
  const sunrise = daily?.sunrise?.[0]
  const sunset = daily?.sunset?.[0]
  const aqi = airQualityLevel(air?.european_aqi)

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
      <div className="temp">{formatTemp(current.temperature_2m, units)}</div>
      <p className="condition">{info.label}</p>
      {current.apparent_temperature != null && (
        <p className="feels-like">Sensación térmica {formatTemp(current.apparent_temperature, units)}</p>
      )}
      <div className="stats">
        <span className="stat">
          💨 <strong>{formatWind(current.wind_speed_10m, units)}</strong>
        </span>
        <span className="stat">
          💧 <strong>{current.relative_humidity_2m}%</strong> humedad
        </span>
        {current.surface_pressure != null && (
          <span className="stat">
            🧭 <strong>{Math.round(current.surface_pressure)}</strong> hPa
          </span>
        )}
        {uv != null && (
          <span className="stat">
            ☀️ <strong>{Math.round(uv)}</strong> UV
          </span>
        )}
        {sunrise && (
          <span className="stat">
            🌅 <strong>{new Date(sunrise).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</strong>
          </span>
        )}
        {sunset && (
          <span className="stat">
            🌇 <strong>{new Date(sunset).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</strong>
          </span>
        )}
        {aqi && (
          <span className={`stat aqi-${aqi.level}`}>
            🍃 <strong>{aqi.label}</strong> aire
          </span>
        )}
      </div>
    </div>
  )
}

export default memo(CurrentWeather)