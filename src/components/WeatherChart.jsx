import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { convertTemp, formatTime } from '../lib/weather'
import { LOCALE_MAP } from '../i18n'

// Gráficos de temperatura. Permite alternar entre las próximas 24 horas y los 7 días.
function WeatherChart({ hourly, daily, units }) {
  const { t, i18n } = useTranslation()
  const locale = LOCALE_MAP[i18n.language] || LOCALE_MAP.es
  const [range, setRange] = useState('hourly')

  const hourlyData = hourly.map((h) => ({
    label: formatTime(h.time, locale),
    temp: convertTemp(h.temp, units),
  }))

  const dailyData = daily.map((d) => ({
    label: d.day,
    max: convertTemp(d.max, units),
    min: convertTemp(d.min, units),
  }))

  const data = range === 'hourly' ? hourlyData : dailyData
  const isHourly = range === 'hourly'

  return (
    <div className="card chart">
      <div className="chart-header">
        <h3>{t('chart.title')}</h3>
        <div className="chart-tabs" role="group" aria-label={t('chart.rangeLabel')}>
          <button
            type="button"
            className={isHourly ? 'active' : ''}
            onClick={() => setRange('hourly')}
            aria-pressed={isHourly}
          >
            {t('chart.hourlyTab')}
          </button>
          <button
            type="button"
            className={!isHourly ? 'active' : ''}
            onClick={() => setRange('daily')}
            aria-pressed={!isHourly}
          >
            {t('chart.dailyTab')}
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
              <Line
                type="monotone"
                dataKey="temp"
                name={t('chart.series')}
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
              />
            ) : (
              <>
                <Legend />
                <Line type="monotone" dataKey="max" name={t('chart.max')} stroke="var(--accent)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="min" name={t('chart.min')} stroke="var(--accent-2)" strokeWidth={2} dot={false} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default WeatherChart
