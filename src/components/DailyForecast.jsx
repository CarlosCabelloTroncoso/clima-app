import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { weatherInfo, formatWeekday, convertTemp } from '../lib/weather'
import { LOCALE_MAP } from '../i18n'

// Pronóstico diario de 7 días con temperatura máxima y mínima.
function DailyForecast({ daily, units }) {
  const { t, i18n } = useTranslation()
  const locale = LOCALE_MAP[i18n.language] || LOCALE_MAP.es

  return (
    <div className="forecast">
      {daily.time.map((date, i) => {
        const info = weatherInfo(daily.weather_code[i])
        return (
          <div className="card day" key={date}>
            <span className="day-name">{i === 0 ? t('daily.today') : formatWeekday(date, locale)}</span>
            <span className="day-emoji">{info.emoji}</span>
            <span className="day-temp">
              <strong>{convertTemp(daily.temperature_2m_max[i], units)}°</strong>{' '}
              <span>{convertTemp(daily.temperature_2m_min[i], units)}°</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default memo(DailyForecast)
