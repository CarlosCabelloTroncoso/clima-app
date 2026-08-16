import { useEffect, useState, useRef } from 'react'
import './App.css'
import { version } from '../package.json'
import { fetchWeatherData, searchCity, buildHourly, buildDaily, buildAlerts } from './lib/weather'
import {
  readJSON,
  toggleFavorite,
  addHistory,
  clearFavorites,
  clearHistory,
  STORAGE_KEYS,
} from './lib/storage'
import useTheme from './hooks/useTheme'
import SearchBar from './components/SearchBar'
import CurrentWeather from './components/CurrentWeather'
import HourlyForecast from './components/HourlyForecast'
import DailyForecast from './components/DailyForecast'
import WeatherChart from './components/WeatherChart'
import WeatherAlerts from './components/WeatherAlerts'
import ThemeToggle from './components/ThemeToggle'
import Favorites from './components/Favorites'
import History from './components/History'

// Coordenadas por defecto usadas cuando falla la geolocalización.
const DEFAULT_LAT = -33.4489
const DEFAULT_LON = -70.6693
const DEFAULT_CITY = { id: 'santiago', name: 'Santiago, Chile', lat: DEFAULT_LAT, lon: DEFAULT_LON }

function App() {
  const storage = window.localStorage
  const { theme, setTheme } = useTheme(storage)

  const [query, setQuery] = useState('')
  const [location, setLocation] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentCity, setCurrentCity] = useState(null)

  const [favorites, setFavorites] = useState(() => readJSON(storage, STORAGE_KEYS.favorites, []))
  const [history, setHistory] = useState(() => readJSON(storage, STORAGE_KEYS.history, []))

  // Evita que la geolocalización se dispare dos veces en modo desarrollo,
  // donde React StrictMode re-ejecuta los efectos de montaje.
  const geoLoaded = useRef(false)
  // Referencia estable a la función de carga para usarla en el efecto de montaje.
  const loadWeatherRef = useRef(null)
  loadWeatherRef.current = loadWeather

  async function loadWeather(city) {
    setLoading(true)
    setError('')
    try {
      const data = await fetchWeatherData(city.lat, city.lon)
      setCurrentCity(city)
      setLocation(city.name)
      setWeather(data)
      setHistory(addHistory(storage, city))
    } catch (err) {
      setError(err.message)
      setWeather(null)
      setLocation(null)
      setCurrentCity(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (geoLoaded.current) return
    geoLoaded.current = true

    if (!navigator.geolocation) {
      loadWeatherRef.current(DEFAULT_CITY)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        loadWeatherRef.current({
          id: 'current-location',
          name: 'Tu ubicación',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => loadWeatherRef.current(DEFAULT_CITY),
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
      const city = {
        id: String(result.id),
        name: `${result.name}, ${result.country || ''}`,
        lat: result.latitude,
        lon: result.longitude,
      }
      await loadWeather(city)
    } catch (err) {
      setError(err.message)
      setWeather(null)
      setLocation(null)
      setCurrentCity(null)
    } finally {
      setLoading(false)
    }
  }

  function handleToggleFavorite() {
    if (!currentCity) return
    setFavorites(toggleFavorite(storage, currentCity))
  }

  function handleRemoveFavorite(id) {
    setFavorites(favorites.filter((f) => f.id !== id))
  }

  function handleClearFavorites() {
    setFavorites(clearFavorites(storage))
  }

  function handleClearHistory() {
    setHistory(clearHistory(storage))
  }

  const current = weather?.current
  const daily = weather?.daily
  const hourlyNow = buildHourly(weather?.hourly)
  const dailyChart = buildDaily(weather?.daily)
  const alerts = buildAlerts(weather?.hourly, weather?.daily)
  const isFavorite = favorites.some((f) => f.id === currentCity?.id)

  return (
    <div className="container">
      <div className="header">
        <ThemeToggle theme={theme} onThemeChange={setTheme} />
        <h1>⛅ Mi Clima</h1>
        <p>Consulta el tiempo actual y el pronóstico para cualquier ciudad.</p>
      </div>

      <SearchBar query={query} onQueryChange={setQuery} onSubmit={handleSearch} loading={loading} />

      <Favorites
        favorites={favorites}
        onSelect={loadWeather}
        onRemove={handleRemoveFavorite}
        onClear={handleClearFavorites}
      />
      <History history={history} onSelect={loadWeather} onClear={handleClearHistory} />

      {alerts.length > 0 && <WeatherAlerts alerts={alerts} />}

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Cargando...</p>}

      {current && daily && !loading && (
        <div className="results">
          <CurrentWeather
            location={location}
            current={current}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
          />
          {hourlyNow.length > 0 && <HourlyForecast hours={hourlyNow} />}
          {hourlyNow.length > 0 && dailyChart.length > 0 && (
            <WeatherChart hourly={hourlyNow} daily={dailyChart} />
          )}
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