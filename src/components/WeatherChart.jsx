import { useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'

// Gráficos de temperatura. Permite alternar entre las próximas 24 horas y los 7 días.
function WeatherChart({ hourly, daily }) {
  const [range, setRange] = useState('hourly')

  const hourlyData = hourly.map((h) => ({
    label: new Date(h.time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    temp: h.temp,
  }))

  const dailyData = daily.map((d) => ({ label: d.day, max: d.max, min: d.min }))

  const data = range === 'hourly' ? hourlyData : dailyData
  const isHourly = range === 'hourly'

  return (
    <div className="card chart">
      <div className="chart-header">
        <h3>Temperatura</h3>
        <div className="chart-tabs" role="group" aria-label="Rango del gráfico">
          <button
            type="button"
            className={isHourly ? 'active' : ''}
            onClick={() => setRange('hourly')}
            aria-pressed={isHourly}
          >
            24 horas
          </button>
          <button
            type="button"
            className={!isHourly ? 'active' : ''}
            onClick={() => setRange('daily')}
            aria-pressed={!isHourly}
          >
            7 días
          </button>
        </div>
      </div>

      <div className="chart-body">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
              }}
            />
            {isHourly ? (
              <Line type="monotone" dataKey="temp" name="Temperatura" stroke="var(--accent)" strokeWidth={2} dot={false} />
            ) : (
              <>
                <Legend />
                <Line type="monotone" dataKey="max" name="Máx" stroke="var(--accent)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="min" name="Mín" stroke="var(--accent-2)" strokeWidth={2} dot={false} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default WeatherChart