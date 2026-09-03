import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { weatherInfo, convertTemp, formatTime } from '../lib/weather'
import { LOCALE_MAP } from '../i18n'

// Pronóstico por hora en fila horizontal con scroll.
function HourlyForecast({ hours, units }) {
  const { t, i18n } = useTranslation()
  const locale = LOCALE_MAP[i18n.language] || LOCALE_MAP.es

  return (
    <div className="card hourly">
      <h3>{t('hourly.title')}</h3>
      <div className="hourly-row">
        {hours.map((h) => {
          const info = weatherInfo(h.code)
          return (
            <div className="hour" key={h.time}>
              <span className="hour-time">{formatTime(h.time, locale)}</span>
              <span className="hour-emoji">{info.emoji}</span>
              <span className="hour-temp">{convertTemp(h.temp, units)}°</span>
              <span className="hour-rain">{h.rain > 0 ? `${h.rain}%` : ''}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(HourlyForecast)
