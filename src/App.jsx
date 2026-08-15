import { useEffect, useState } from 'react'
import './App.css'

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

function weatherInfo(code) {
  const map = {
    0: { label: 'Cielo despejado', emoji: '☀️' },
    1: { label: 'Mayormente despejado', emoji: '🌤️' },
    2: { label: 'Parcialmente nublado', emoji: '⛅' },
    3: { label: 'Nublado', emoji: '☁️' },
    45: { label: 'Niebla', emoji: '🌫️' },
    48: { label: 'Niebla helada', emoji: '🌫️' },
    51: { label: 'Llovizna ligera', emoji: '🌦️' },
    53: { label: 'Llovizna moderada', emoji: '🌦️' },
    55: { label: 'Llovizna intensa', emoji: '🌧️' },
    56: { label: 'Llovizna helada ligera', emoji: '🌧️' },
    57: { label: 'Llovizna helada intensa', emoji: '🌧️' },
    61: { label: 'Lluvia ligera', emoji: '🌧️' },
    63: { label: 'Lluvia moderada', emoji: '🌧️' },
    65: { label: 'Lluvia intensa', emoji: '🌧️' },
    66: { label: 'Lluvia helada ligera', emoji: '🌧️' },
    67: { label: 'Lluvia helada intensa', emoji: '🌧️' },
    71: { label: 'Nevada ligera', emoji: '🌨️' },
    73: { label: 'Nevada moderada', emoji: '🌨️' },
    75: { label: 'Nevada intensa', emoji: '❄️' },
    77: { label: 'Granos de nieve', emoji: '🌨️' },
    80: { label: 'Chubascos ligeros', emoji: '🌧️' },
    81: { label: 'Chubascos moderados', emoji: '🌧️' },
    82: { label: 'Chubascos intensos', emoji: '⛈️' },
    85: { label: 'Chubascos de nieve ligeros', emoji: '🌨️' },
    86: { label: 'Chubascos de nieve intensos', emoji: '❄️' },
    95: { label: 'Tormenta', emoji: '⛈️' },
    96: { label: 'Tormenta con granizo', emoji: '⛈️' },
    99: { label: 'Tormenta con granizo intensa', emoji: '⛈️' },
  }
  return map[code] || { label: 'Desconocido', emoji: '🌡️' }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function App() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchWeather(latitude, longitude, name) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min` +
          `&hourly=temperature_2m,weather_code,precipitation_probability` +
          `&timezone=auto&forecast_days=7`,
      )
      if (!res.ok) throw new Error('No se pudo obtener el clima.')
      const data = await res.json()
      setLocation(name)
      setWeather(data)
    } catch (err) {
      setError(err.message)
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude, 'Tu ubicación')
      },
      () => fetchWeather(-33.4489, -70.6693, 'Santiago, Chile'),
    )
  }, [])

  async function searchCity(name) {
    const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(name)}&count=5&language=es`)
    if (!res.ok) throw new Error('No se pudo buscar la ciudad.')
    const data = await res.json()
    const results = data.results || []
    return results.find((r) => r.country_code === 'CL') || results[0]
  }

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      let result = await searchCity(query)
      if (!result) {
        const baseName = query.trim().split(/[,\s]+/)[0]
        if (baseName && baseName !== query.trim()) {
          result = await searchCity(baseName)
        }
      }
      if (!result) {
        throw new Error('No se encontró ninguna ciudad con ese nombre.')
      }
      const name = `${result.name}, ${result.country || ''}`
      await fetchWeather(result.latitude, result.longitude, name)
    } catch (err) {
      setError(err.message)
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const current = weather?.current
  const daily = weather?.daily
  const hourly = weather?.hourly

  const hourlyNow = hourly
    ? hourly.time
        .filter((t) => new Date(t) >= new Date())
        .slice(0, 24)
        .map((t) => {
          const i = hourly.time.indexOf(t)
          return {
            time: t,
            temp: Math.round(hourly.temperature_2m[i]),
            code: hourly.weather_code[i],
            rain: hourly.precipitation_probability[i],
          }
        })
    : []

  return (
    <div className="container">
      <div className="header">
        <h1>⛅ Mi Clima</h1>
        <p>Consulta el tiempo actual y el pronóstico para cualquier ciudad.</p>
      </div>

      <form onSubmit={handleSearch} className="search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar una ciudad..."
          aria-label="Buscar una ciudad"
        />
        <button type="submit">Buscar</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Cargando...</p>}

      {current && daily && !loading && (
        <div className="results">
          <div className="card current">
            <h2>{location}</h2>
            <div className="big-emoji">{weatherInfo(current.weather_code).emoji}</div>
            <div className="temp">{Math.round(current.temperature_2m)}°C</div>
            <p className="condition">{weatherInfo(current.weather_code).label}</p>
            <div className="stats">
              <span className="stat">
                💨 <strong>{Math.round(current.wind_speed_10m)}</strong> km/h
              </span>
              <span className="stat">
                💧 <strong>{current.relative_humidity_2m}%</strong> humedad
              </span>
            </div>
          </div>

          <div className="card hourly">
            <h3>Próximas 24 horas</h3>
            <div className="hourly-row">
              {hourlyNow.map((h) => {
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
                    <span className="hour-temp">{h.temp}°</span>
                    <span className="hour-rain">{h.rain > 0 ? `${h.rain}%` : ''}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="forecast">
            {daily.time.map((date, i) => {
              const info = weatherInfo(daily.weather_code[i])
              return (
                <div className="card day" key={date}>
                  <span className="day-name">
                    {i === 0 ? 'Hoy' : formatDate(date).split(',')[0]}
                  </span>
                  <span className="day-emoji">{info.emoji}</span>
                  <span className="day-temp">
                    <strong>{Math.round(daily.temperature_2m_max[i])}°</strong>{' '}
                    <span>{Math.round(daily.temperature_2m_min[i])}°</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!current && !loading && !error && (
        <p className="hint">Escribe el nombre de una ciudad para ver su clima.</p>
      )}
    </div>
  )
}

export default App
