import { useEffect, useState, useRef, useMemo, useCallback, lazy, Suspense } from 'react'
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
import WeatherAlerts from './components/WeatherAlerts'
import ThemeToggle from './components/ThemeToggle'
import Favorites from './components/Favorites'
import History from './components/History'

// El gráfico y la escena 3D se cargan de forma diferida para no incluir
// recharts ni three en el bundle inicial de la página.
const WeatherChart = lazy(() => import('./components/WeatherChart'))
const WeatherSceneCrossfade = lazy(() => import('./components/WeatherSceneCrossfade'))

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
  const [showAlerts, setShowAlerts] = useState(false)

  // Evita que la geolocalización se dispare dos veces en modo desarrollo,
  // donde React StrictMode re-ejecuta los efectos de montaje.
  const geoLoaded = useRef(false)

  const loadWeather = useCallback(async (city) => {
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
  }, [storage])

  // Referencia estable a la función de carga para usarla en el efecto de montaje.
  const loadWeatherRef = useRef(loadWeather)
  loadWeatherRef.current = loadWeather

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

  const handleToggleFavorite = useCallback(() => {
    if (!currentCity) return
    setFavorites(toggleFavorite(storage, currentCity))
  }, [currentCity, storage])

  const handleRemoveFavorite = useCallback(
    (id) => {
      setFavorites(favorites.filter((f) => f.id !== id))
    },
    [favorites],
  )

  const handleClearFavorites = useCallback(() => {
    setFavorites(clearFavorites(storage))
  }, [storage])

  const handleClearHistory = useCallback(() => {
    setHistory(clearHistory(storage))
  }, [storage])

  const current = weather?.current
  const daily = weather?.daily
  // Los datos derivados se calculan una sola vez por carga de clima, evitando
  // recomputaciones en cada render.
  const hourlyNow = useMemo(() => buildHourly(weather?.hourly), [weather])
  const dailyChart = useMemo(() => buildDaily(weather?.daily), [weather])
  const alerts = useMemo(() => buildAlerts(weather?.hourly, weather?.daily), [weather])
  const isFavorite = favorites.some((f) => f.id === currentCity?.id)
  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Abre el modal de alertas cada vez que se cargan datos nuevos con alertas.
  useEffect(() => {
    setShowAlerts(alerts.length > 0)
  }, [alerts.length])

  return (
    <div className="container">
      <Suspense fallback={null}>
        <WeatherSceneCrossfade code={current?.weather_code ?? 0} isDark={isDark} />
      </Suspense>

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
            <Suspense fallback={null}>
              <WeatherChart hourly={hourlyNow} daily={dailyChart} />
            </Suspense>
          )}
          <DailyForecast daily={daily} />
        </div>
      )}

      {!current && !loading && !error && (
        <p className="hint">Escribe el nombre de una ciudad para ver su clima.</p>
      )}

      <footer className="footer">Mi Clima · v{version}</footer>

      {showAlerts && alerts.length > 0 && (
        <WeatherAlerts alerts={alerts} onClose={() => setShowAlerts(false)} />
      )}
    </div>
  )
}

export default App