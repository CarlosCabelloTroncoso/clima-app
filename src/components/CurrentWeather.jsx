import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { weatherInfo, formatTemp, formatWind, formatTime, airQualityLevel } from '../lib/weather'
import { LOCALE_MAP } from '../i18n'
import ShareSnapshot from './ShareSnapshot'

// Tarjeta con el estado del tiempo actual: temperatura, descripción y métricas.
// Incluye un botón para marcar o desmarcar la ciudad como favorita.
function CurrentWeather({ location, current, daily, air, isFavorite, onToggleFavorite, units, isDark, sceneCanvasRef }) {
  const { t, i18n } = useTranslation()
  const locale = LOCALE_MAP[i18n.language] || LOCALE_MAP.es
  const info = weatherInfo(current.weather_code)
  const uv = daily?.uv_index_max?.[0]
  const sunrise = daily?.sunrise?.[0]
  const sunset = daily?.sunset?.[0]
  const aqi = airQualityLevel(air?.european_aqi)

  return (
    <div className="card current">
      <div className="current-title">
        <h2>{location}</h2>
        <div className="current-actions">
          <ShareSnapshot canvasRef={sceneCanvasRef} current={current} location={location} units={units} isDark={isDark} />
          <button
            type="button"
            className={isFavorite ? 'fav active' : 'fav'}
            onClick={onToggleFavorite}
            aria-label={isFavorite ? t('current.removeFavorite') : t('current.addFavorite')}
            aria-pressed={isFavorite}
          >
            ★
          </button>
        </div>
      </div>
      <div className="big-emoji">{info.emoji}</div>
      <div className="temp">{formatTemp(current.temperature_2m, units)}</div>
      <p className="condition">{t(info.key)}</p>
      {current.apparent_temperature != null && (
        <p className="feels-like">
          {t('current.feelsLike', { temp: formatTemp(current.apparent_temperature, units) })}
        </p>
      )}
      <div className="stats">
        <span className="stat">
          💨 <strong>{formatWind(current.wind_speed_10m, units)}</strong>
        </span>
        <span className="stat">
          💧 <strong>{current.relative_humidity_2m}%</strong> {t('current.humidity')}
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
            🌅 <strong>{formatTime(sunrise, locale)}</strong>
          </span>
        )}
        {sunset && (
          <span className="stat">
            🌇 <strong>{formatTime(sunset, locale)}</strong>
          </span>
        )}
        {aqi && (
          <span className={`stat aqi-${aqi.level}`}>
            🍃 <strong>{t(`aqi.${aqi.level}`)}</strong> {t('current.air')}
          </span>
        )}
      </div>
    </div>
  )
}

export default memo(CurrentWeather)
