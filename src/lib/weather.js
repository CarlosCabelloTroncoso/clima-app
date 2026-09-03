// Constantes de acceso a la API de Open-Meteo.
export const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
export const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
export const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

// Mapa de códigos WMO a descripción y emoji del estado del clima.
const WEATHER_CODES = {
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

// Devuelve la descripción y emoji para un código WMO, con un valor por defecto.
export function weatherInfo(code) {
  return WEATHER_CODES[code] || { label: 'Desconocido', emoji: '🌡️' }
}

// Formatea una fecha ISO a formato largo en español (p. ej. "sábado 15 de agosto").
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
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

// Formatea una hora ISO como HH:MM en formato de 24 horas.
export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
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
export function buildDaily(daily) {
  if (!daily) return []
  return daily.time.map((date, i) => ({
    day: formatDate(date).split(',')[0],
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
// horas y los próximos días. Devuelve un arreglo de { nivel, tipo, texto }.
export function buildAlerts(hourly, daily) {
  const alerts = []
  const levels = { light: 'lluvia', moderate: 'lluvia', strong: 'lluvia fuerte' }

  const today = new Date().toISOString().slice(0, 10)

  // Revisa las próximas 24 horas en busca de precipitación.
  if (hourly) {
    const codes = []
    for (let i = 0; i < hourly.time.length; i += 1) {
      const date = hourly.time[i].slice(0, 10)
      if (date === today) codes.push(hourly.weather_code[i])
    }
    const level = codes.map(rainLevel).filter(Boolean).sort((a, b) => levelOrder(a) - levelOrder(b))[0]
    if (level) alerts.push({ nivel: level, tipo: 'hourly', texto: `Hoy hay ${levels[level]} en las próximas horas.` })
  }

  // Revisa los próximos días (excluye hoy) en busca de precipitación.
  if (daily) {
    for (let i = 0; i < daily.time.length; i += 1) {
      if (daily.time[i] === today) continue
      const level = rainLevel(daily.weather_code[i])
      if (level) {
        const day = formatDate(daily.time[i]).split(',')[0]
        alerts.push({
          nivel: level,
          tipo: 'daily',
          texto: `${levels[level]} esperada el ${day}.`,
        })
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
  if (!res.ok) throw new Error('No se pudo obtener el clima.')
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

// Clasifica el índice europeo de calidad del aire (EAQI) en nivel y etiqueta.
export function airQualityLevel(aqi) {
  if (aqi == null) return null
  if (aqi <= 20) return { level: 'good', label: 'Buena' }
  if (aqi <= 40) return { level: 'fair', label: 'Aceptable' }
  if (aqi <= 60) return { level: 'moderate', label: 'Moderada' }
  if (aqi <= 80) return { level: 'poor', label: 'Mala' }
  if (aqi <= 100) return { level: 'very-poor', label: 'Muy mala' }
  return { level: 'extreme', label: 'Extrema' }
}

// Busca una ciudad por nombre. Prioriza resultados de Chile y, si la búsqueda
// completa falla, reintenta solo con la primera palabra (p. ej. "talca chile").
export async function searchCity(name, fetchFn = fetch) {
  async function request(q) {
    const res = await fetchFn(`${GEO_URL}?name=${encodeURIComponent(q)}&count=5&language=es`)
    if (!res.ok) throw new Error('No se pudo buscar la ciudad.')
    const data = await res.json()
    const results = data.results || []
    return results.find((r) => r.country_code === 'CL') || results[0]
  }

  let result = await request(name)
  if (!result) {
    const baseName = name.trim().split(/[,\s]+/)[0]
    if (baseName && baseName !== name.trim()) {
      result = await request(baseName)
    }
  }
  return result
}