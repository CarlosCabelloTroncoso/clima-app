import { memo } from 'react'
import { weatherInfo, formatDate } from '../lib/weather'

// Pronóstico diario de 7 días con temperatura máxima y mínima.
function DailyForecast({ daily }) {
  return (
    <div className="forecast">
      {daily.time.map((date, i) => {
        const info = weatherInfo(daily.weather_code[i])
        return (
          <div className="card day" key={date}>
            <span className="day-name">{i === 0 ? 'Hoy' : formatDate(date).split(',')[0]}</span>
            <span className="day-emoji">{info.emoji}</span>
            <span className="day-temp">
              <strong>{Math.round(daily.temperature_2m_max[i])}°</strong>{' '}
              <span>{Math.round(daily.temperature_2m_min[i])}°</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default memo(DailyForecast)