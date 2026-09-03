import { memo } from 'react'
import { weatherInfo, convertTemp } from '../lib/weather'

// Pronóstico por hora en fila horizontal con scroll.
function HourlyForecast({ hours, units }) {
  return (
    <div className="card hourly">
      <h3>Próximas 24 horas</h3>
      <div className="hourly-row">
        {hours.map((h) => {
          const info = weatherInfo(h.code)
          return (
            <div className="hour" key={h.time}>
              <span className="hour-time">
                {new Date(h.time).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
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