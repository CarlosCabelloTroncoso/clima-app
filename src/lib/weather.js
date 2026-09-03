// Constantes de acceso a la API de Open-Meteo.
export const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
export const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
export const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

// Mapa de códigos WMO a emoji del estado del clima. La descripción vive en
// los archivos de idioma (clave `weather.<código>`), no acá: esta función se
// mantiene independiente de i18n para poder testearla sin cargar traducciones.
const WEATHER_EMOJI = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌧️',
  56: '🌧️',
  57: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  66: '🌧️',
  67: '🌧️',
  71: '🌨️',
  73: '🌨️',
  75: '❄️',
  77: '🌨️',
  80: '🌧️',
  81: '🌧️',
  82: '⛈️',
  85: '🌨️',
  86: '❄️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
}

// Devuelve el emoji y la clave de traducción (`weather.<código>` o
// `weather.unknown`) para un código WMO.
export function weatherInfo(code) {
  if (code in WEATHER_EMOJI) return { emoji: WEATHER_EMOJI[code], key: `weather.${code}` }
  return { emoji: '🌡️', key: 'weather.unknown' }
}

// Formatea una fecha ISO como nombre de día largo (p. ej. "sábado" / "Saturday").
export function formatWeekday(iso, locale = 'es-ES') {
  return new Date(iso).toLocaleDateString(locale, { weekday: 'long' })
}

// Convierte una temperatura en °C al sistema de unidades pedido, sin el sufijo de unidad.
export function convertTemp(celsius, units = 'metric') {
  return units === 'imperial' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius)
}

// Convierte y formatea una temperatura en °C, incluyendo el sufijo de unidad (°C/°F).
export function formatTemp(celsius, units = 'metric') {
  return `${convertTemp(celsius, units)}°${units === 'imperial' ? 'F' : 'C'}`
}

// Convierte una velocidad de viento en km/h al sistema de unidades pedido y la formatea.
export function formatWind(kmh, units = 'metric') {
  if (units === 'imperial') return `${Math.round(kmh * 0.621371)} mph`
  return `${Math.round(kmh)} km/h`
}

// Formatea una hora ISO como HH:MM.
export function formatTime(iso, locale = 'es-ES') {
  return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}

// Construye la lista de las próximas N horas con temperatura, código y lluvia.
// `now` se inyecta como parámetro para poder testear el filtrado temporal.
export function buildHourly(hourly, limit = 24, now = new Date()) {
  if (!hourly) return []
  return hourly.time
    .filter((t) => new Date(t) >= now)
    .slice(0, limit)
    .map((t) => {
      const i = hourly.time.indexOf(t)
      return {
        time: t,
        temp: Math.round(hourly.temperature_2m[i]),
        code: hourly.weather_code[i],
        rain: hourly.precipitation_probability[i],
      }
    })
}

// Construye la serie diaria para el gráfico de temperatura máxima/mínima.
export function buildDaily(daily, locale = 'es-ES') {
  if (!daily) return []
  return daily.time.map((date, i) => ({
    day: formatWeekday(date, locale),
    max: Math.round(daily.temperature_2m_max[i]),
    min: Math.round(daily.temperature_2m_min[i]),
  }))
}

// Clasifica un código WMO según la intensidad de precipitación.
// Devuelve un nivel o null si no hay lluvia.
function rainLevel(code) {
  const heavy = new Set([57, 65, 67, 82, 86, 95, 96, 99])
  const moderate = new Set([53, 55, 63, 80, 81])
  const light = new Set([51, 56, 61, 66])
  if (heavy.has(code)) return 'strong'
  if (moderate.has(code)) return 'moderate'
  if (light.has(code)) return 'light'
  return null
}

// Genera las alertas meteorológicas a partir de los códigos de las próximas
// horas y los próximos días. Devuelve datos estructurados (nivel, tipo, día)
// sin texto: el mensaje final se arma en el componente con i18n, según el
// idioma activo.
export function buildAlerts(hourly, daily, locale = 'es-ES') {
  const alerts = []
  const today = new Date().toISOString().slice(0, 10)

  // Revisa las próximas 24 horas en busca de precipitación.
  if (hourly) {
    const codes = []
    for (let i = 0; i < hourly.time.length; i += 1) {
      const date = hourly.time[i].slice(0, 10)
      if (date === today) codes.push(hourly.weather_code[i])
    }
    const level = codes.map(rainLevel).filter(Boolean).sort((a, b) => levelOrder(a) - levelOrder(b))[0]
    if (level) alerts.push({ nivel: level, tipo: 'hourly' })
  }

  // Revisa los próximos días (excluye hoy) en busca de precipitación.
  if (daily) {
    for (let i = 0; i < daily.time.length; i += 1) {
      if (daily.time[i] === today) continue
      const level = rainLevel(daily.weather_code[i])
      if (level) {
        alerts.push({ nivel: level, tipo: 'daily', dia: formatWeekday(daily.time[i], locale) })
      }
    }
  }

  return alerts
}

function levelOrder(level) {
  return level === 'strong' ? 0 : level === 'moderate' ? 1 : 2
}

const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86])
const HEAVY_SNOW_CODES = new Set([75, 86])
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82])
const HEAVY_RAIN_CODES = new Set([55, 57, 65, 67, 82])
const STORM_CODES = new Set([95, 96, 99])

// Traduce un código WMO a los parámetros que necesita la escena 3D:
// visibilidad del sol, cantidad de nubes, tipo de precipitación e intensidad.
export function sceneConfig(code) {
  if (STORM_CODES.has(code)) return { sun: 0, clouds: 1, precip: 'rain', heavy: true, storm: true }
  if (SNOW_CODES.has(code)) {
    return { sun: HEAVY_SNOW_CODES.has(code) ? 0 : 0.3, clouds: 1, precip: 'snow', heavy: HEAVY_SNOW_CODES.has(code) }
  }
  if (RAIN_CODES.has(code)) return { sun: 0, clouds: 1, precip: 'rain', heavy: HEAVY_RAIN_CODES.has(code) }
  if (code === 45 || code === 48) return { sun: 0, clouds: 1, precip: null, heavy: false }
  if (code === 3) return { sun: 0, clouds: 0.9, precip: null, heavy: false }
  if (code === 2) return { sun: 0.7, clouds: 0.5, precip: null, heavy: false }
  if (code === 1) return { sun: 1, clouds: 0.25, precip: null, heavy: false }
  return { sun: 1, clouds: 0, precip: null, heavy: false }
}

// Solicita el pronóstico a Open-Meteo y devuelve la respuesta JSON.
export async function fetchWeatherData(latitude, longitude) {
  const res = await fetch(
    `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature,surface_pressure` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max` +
      `&hourly=temperature_2m,weather_code,precipitation_probability` +
      `&timezone=auto&forecast_days=7`,
  )
  if (!res.ok) throw new Error('errors.forecastFailed')
  return res.json()
}

// Solicita la calidad del aire a Open-Meteo. Devuelve null si falla, para no
// romper el resto de la página por un servicio secundario.
export async function fetchAirQuality(latitude, longitude, fetchFn = fetch) {
  try {
    const res = await fetchFn(
      `${AIR_QUALITY_URL}?latitude=${latitude}&longitude=${longitude}` +
        `&current=european_aqi,pm2_5,pm10&timezone=auto`,
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.current || null
  } catch {
    return null
  }
}

// Clasifica el índice europeo de calidad del aire (EAQI) en un nivel. La
// etiqueta correspondiente vive en los archivos de idioma (clave `aqi.<nivel>`).
export function airQualityLevel(aqi) {
  if (aqi == null) return null
  if (aqi <= 20) return { level: 'good' }
  if (aqi <= 40) return { level: 'fair' }
  if (aqi <= 60) return { level: 'moderate' }
  if (aqi <= 80) return { level: 'poor' }
  if (aqi <= 100) return { level: 'very-poor' }
  return { level: 'extreme' }
}

// Busca ciudades por nombre y devuelve hasta 5 coincidencias, con los
// resultados de Chile primero. Si la búsqueda completa no encuentra nada,
// reintenta solo con la primera palabra (p. ej. "talca chile"). `language`
// es el código corto (es/en) que le pide a la API los nombres traducidos.
export async function searchCities(name, language = 'es', fetchFn = fetch) {
  async function request(q) {
    const res = await fetchFn(`${GEO_URL}?name=${encodeURIComponent(q)}&count=5&language=${language}`)
    if (!res.ok) throw new Error('errors.searchFailed')
    const data = await res.json()
    const results = data.results || []
    return [...results].sort((a, b) => (b.country_code === 'CL') - (a.country_code === 'CL'))
  }

  let results = await request(name)
  if (results.length === 0) {
    const baseName = name.trim().split(/[,\s]+/)[0]
    if (baseName && baseName !== name.trim()) {
      results = await request(baseName)
    }
  }
  return results
}

// Busca una ciudad por nombre y devuelve la mejor coincidencia (Chile primero).
export async function searchCity(name, language = 'es', fetchFn = fetch) {
  const results = await searchCities(name, language, fetchFn)
  return results[0]
}