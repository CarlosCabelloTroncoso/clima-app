import { useEffect, useState, useRef } from 'react'
import './App.css'
import { version } from '../package.json'
import { fetchWeatherData, searchCity, buildHourly } from './lib/weather'
import SearchBar from './components/SearchBar'
import CurrentWeather from './components/CurrentWeather'
import HourlyForecast from './components/HourlyForecast'
import DailyForecast from './components/DailyForecast'

// Coordenadas por defecto usadas cuando falla la geolocalización.
const DEFAULT_LAT = -33.4489
const DEFAULT_LON = -70.6693

function App() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Evita que la geolocalización se dispare dos veces en modo desarrollo,
  // donde React StrictMode re-ejecuta los efectos de montaje.
  const geoLoaded = useRef(false)

  async function loadWeather(latitude, longitude, name) {
    setLoading(true)
    setError('')
    try {
      const data = await fetchWeatherData(latitude, longitude)
      setLocation(name)
      setWeather(data)
    } catch (err) {
      setError(err.message)
      setWeather(null)
      setLocation(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (geoLoaded.current) return
    geoLoaded.current = true

    if (!navigator.geolocation) {
      loadWeather(DEFAULT_LAT, DEFAULT_LON, 'Santiago, Chile')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude, 'Tu ubicación'),
      () => loadWeather(DEFAULT_LAT, DEFAULT_LON, 'Santiago, Chile'),
    )
  }, [])

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const result = await searchCity(query)
      if (!result) {
        throw new Error('No se encontró ninguna ciudad con ese nombre.')
      }
      const name = `${result.name}, ${result.country || ''}`
      await loadWeather(result.latitude, result.longitude, name)
    } catch (err) {
      setError(err.message)
      setWeather(null)
      setLocation(null)
    } finally {
      setLoading(false)
    }
  }

  const current = weather?.current
  const daily = weather?.daily
  const hourlyNow = buildHourly(weather?.hourly)

  return (
    <div className="container">
      <div className="header">
        <h1>⛅ Mi Clima</h1>
        <p>Consulta el tiempo actual y el pronóstico para cualquier ciudad.</p>
      </div>

      <SearchBar query={query} onQueryChange={setQuery} onSubmit={handleSearch} loading={loading} />

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Cargando...</p>}

      {current && daily && !loading && (
        <div className="results">
          <CurrentWeather location={location} current={current} />
          {hourlyNow.length > 0 && <HourlyForecast hours={hourlyNow} />}
          <DailyForecast daily={daily} />
        </div>
      )}

      {!current && !loading && !error && (
        <p className="hint">Escribe el nombre de una ciudad para ver su clima.</p>
      )}

      <footer className="footer">Mi Clima · v{version}</footer>
    </div>
  )
}

export default App