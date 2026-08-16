// Constantes de acceso a la API de Open-Meteo.
export const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
export const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

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

// Solicita el pronóstico a Open-Meteo y devuelve la respuesta JSON.
export async function fetchWeatherData(latitude, longitude) {
  const res = await fetch(
    `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&hourly=temperature_2m,weather_code,precipitation_probability` +
      `&timezone=auto&forecast_days=7`,
  )
  if (!res.ok) throw new Error('No se pudo obtener el clima.')
  return res.json()
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