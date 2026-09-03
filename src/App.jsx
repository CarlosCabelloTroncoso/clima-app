import { useEffect, useState, useRef, useMemo, useCallback, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import { version } from '../package.json'
import { fetchWeatherData, fetchAirQuality, searchCity, buildHourly, buildDaily, buildAlerts } from './lib/weather'
import {
  readJSON,
  toggleFavorite,
  addHistory,
  clearFavorites,
  clearHistory,
  STORAGE_KEYS,
} from './lib/storage'
import { LOCALE_MAP } from './i18n'
import useTheme from './hooks/useTheme'
import useUnits from './hooks/useUnits'
import useLanguage from './hooks/useLanguage'
import SearchBar from './components/SearchBar'
import CurrentWeather from './components/CurrentWeather'
import HourlyForecast from './components/HourlyForecast'
import DailyForecast from './components/DailyForecast'
import WeatherAlerts from './components/WeatherAlerts'
import ThemeToggle from './components/ThemeToggle'
import UnitsToggle from './components/UnitsToggle'
import LanguageToggle from './components/LanguageToggle'
import Favorites from './components/Favorites'
import History from './components/History'
import SceneErrorBoundary from './components/SceneErrorBoundary'
import CompareWeather from './components/CompareWeather'

// El gráfico y la escena 3D se cargan de forma diferida para no incluir
// recharts ni three en el bundle inicial de la página.
const WeatherChart = lazy(() => import('./components/WeatherChart'))
const WeatherSceneCrossfade = lazy(() => import('./components/WeatherSceneCrossfade'))

// Coordenadas por defecto usadas cuando falla la geolocalización.
const DEFAULT_LAT = -33.4489
const DEFAULT_LON = -70.6693
const DEFAULT_CITY = { id: 'santiago', name: 'Santiago, Chile', lat: DEFAULT_LAT, lon: DEFAULT_LON }

function App() {
  const { t } = useTranslation()
  const storage = window.localStorage
  const { theme, setTheme } = useTheme(storage)
  const { units, setUnits } = useUnits(storage)
  const { language, setLanguage } = useLanguage(storage)
  const locale = LOCALE_MAP[language] || LOCALE_MAP.es

  const [query, setQuery] = useState('')
  const [location, setLocation] = useState(null)
  const [weather, setWeather] = useState(null)
  const [air, setAir] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentCity, setCurrentCity] = useState(null)

  const [favorites, setFavorites] = useState(() => readJSON(storage, STORAGE_KEYS.favorites, []))
  const [history, setHistory] = useState(() => readJSON(storage, STORAGE_KEYS.history, []))
  const [showAlerts, setShowAlerts] = useState(false)
  const [geoDenied, setGeoDenied] = useState(false)

  const [compareCity, setCompareCity] = useState(null)
  const [compareWeather, setCompareWeather] = useState(null)
  const [compareLoading, setCompareLoading] = useState(false)

  // Evita que la geolocalización se dispare dos veces en modo desarrollo,
  // donde React StrictMode re-ejecuta los efectos de montaje.
  const geoLoaded = useRef(false)

  // Apunta siempre al canvas WebGL de la escena 3D vigente, para poder
  // capturarlo en la foto compartible.
  const sceneCanvasRef = useRef(null)

  const loadWeather = useCallback(async (city) => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchWeatherData(city.lat, city.lon)
      setCurrentCity(city)
      setLocation(city.name)
      setWeather(data)
      setAir(null)
      setHistory(addHistory(storage, city))
      // La calidad del aire es un dato secundario: si falla, no debe romper
      // el resto de la página ni bloquear la respuesta principal.
      fetchAirQuality(city.lat, city.lon).then(setAir)
    } catch (err) {
      setError(err.message)
      setWeather(null)
      setAir(null)
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
          name: t('geo.currentLocation'),
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoDenied(true)
        }
        loadWeatherRef.current(DEFAULT_CITY)
      },
    )
  }, [t])

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const result = await searchCity(query, language)
      if (!result) {
        throw new Error('errors.cityNotFound')
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

  const handleSelectCity = useCallback(
    (city) => {
      setQuery('')
      loadWeather(city)
    },
    [loadWeather],
  )

  // Carga el clima de la ciudad de comparación. Es independiente de la ciudad
  // principal: un error acá no debe interrumpir ni tocar la vista principal.
  const loadCompare = useCallback(async (city) => {
    setCompareLoading(true)
    try {
      const data = await fetchWeatherData(city.lat, city.lon)
      setCompareCity(city)
      setCompareWeather(data)
    } catch {
      // Silencioso: comparar es una función secundaria.
    } finally {
      setCompareLoading(false)
    }
  }, [])

  const handleCompareSearch = useCallback(
    async (query) => {
      setCompareLoading(true)
      try {
        const result = await searchCity(query, language)
        if (!result) return
        await loadCompare({
          id: String(result.id),
          name: `${result.name}, ${result.country || ''}`,
          lat: result.latitude,
          lon: result.longitude,
        })
      } catch {
        // Silencioso: comparar es una función secundaria.
      } finally {
        setCompareLoading(false)
      }
    },
    [loadCompare, language],
  )

  const handleRemoveCompare = useCallback(() => {
    setCompareCity(null)
    setCompareWeather(null)
  }, [])

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

  const handleCloseAlerts = useCallback(() => setShowAlerts(false), [])

  const current = weather?.current
  const daily = weather?.daily
  // Los datos derivados se calculan una sola vez por carga de clima, evitando
  // recomputaciones en cada render.
  const hourlyNow = useMemo(() => buildHourly(weather?.hourly), [weather])
  const dailyChart = useMemo(() => buildDaily(weather?.daily, locale), [weather, locale])
  const alerts = useMemo(
    () => buildAlerts(weather?.hourly, weather?.daily, locale),
    [weather, locale],
  )
  // "Tu ubicación" se traduce en cada render en vez de guardarse en el estado,
  // para que el título no quede congelado en el idioma con que se cargó.
  const displayLocation = currentCity?.id === 'current-location' ? t('geo.currentLocation') : location
  const isFavorite = favorites.some((f) => f.id === currentCity?.id)
  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Abre el modal de alertas cada vez que se cargan datos nuevos con alertas.
  useEffect(() => {
    setShowAlerts(alerts.length > 0)
  }, [alerts.length])

  return (
    <div className="container">
      <SceneErrorBoundary>
        <Suspense fallback={null}>
          <WeatherSceneCrossfade
            code={current?.weather_code ?? 0}
            isDark={isDark}
            lat={currentCity?.lat ?? DEFAULT_LAT}
            lon={currentCity?.lon ?? DEFAULT_LON}
            canvasRef={sceneCanvasRef}
          />
        </Suspense>
      </SceneErrorBoundary>

      <div className="header">
        <div className="header-toggles">
          <ThemeToggle theme={theme} onThemeChange={setTheme} />
          <UnitsToggle units={units} onUnitsChange={setUnits} />
          <LanguageToggle language={language} onLanguageChange={setLanguage} />
        </div>
        <h1>⛅ {t('app.name')}</h1>
        <p>{t('app.subtitle')}</p>
      </div>

      <SearchBar
        query={query}
        onQueryChange={setQuery}
        onSubmit={handleSearch}
        onSelectCity={handleSelectCity}
        loading={loading}
        language={language}
      />

      {geoDenied && <p className="geo-hint">{t('geo.denied')}</p>}

      <Favorites
        favorites={favorites}
        onSelect={loadWeather}
        onRemove={handleRemoveFavorite}
        onClear={handleClearFavorites}
      />
      <History history={history} onSelect={loadWeather} onClear={handleClearHistory} />

      {error && <p className="error">{t(error, { defaultValue: t('errors.generic') })}</p>}
      {loading && <p className="loading">{t('status.loading')}</p>}

      {current && daily && !loading && (
        <div className="results">
          <CurrentWeather
            location={displayLocation}
            current={current}
            daily={daily}
            air={air}
            units={units}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            isDark={isDark}
            sceneCanvasRef={sceneCanvasRef}
          />
          <CompareWeather
            primaryLocation={displayLocation}
            primaryCurrent={current}
            compareCity={compareCity}
            compareCurrent={compareWeather?.current}
            loading={compareLoading}
            units={units}
            language={language}
            onSearch={handleCompareSearch}
            onSelectCity={loadCompare}
            onRemove={handleRemoveCompare}
          />
          {hourlyNow.length > 0 && <HourlyForecast hours={hourlyNow} units={units} />}
          {hourlyNow.length > 0 && dailyChart.length > 0 && (
            <Suspense fallback={null}>
              <WeatherChart hourly={hourlyNow} daily={dailyChart} units={units} />
            </Suspense>
          )}
          <DailyForecast daily={daily} units={units} />
        </div>
      )}

      {!current && !loading && !error && <p className="hint">{t('status.hint')}</p>}

      <footer className="footer">{t('app.footer', { version })}</footer>

      {showAlerts && alerts.length > 0 && <WeatherAlerts alerts={alerts} onClose={handleCloseAlerts} />}
    </div>
  )
}

export default App