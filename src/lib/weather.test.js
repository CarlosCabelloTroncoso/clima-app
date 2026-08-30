import { describe, it, expect } from 'vitest'
import { buildHourly, buildAlerts, searchCity, sceneConfig } from './weather'

describe('buildHourly', () => {
  const hourly = {
    time: ['2026-08-15T18:00', '2026-08-15T19:00', '2026-08-15T20:00'],
    temperature_2m: [10.2, 11.4, 12.1],
    weather_code: [3, 51, 61],
    precipitation_probability: [0, 40, 90],
  }

  it('devuelve una lista vacía si no hay datos horarios', () => {
    expect(buildHourly(null)).toEqual([])
  })

  it('filtra solo las horas posteriores al momento de referencia', () => {
    const now = new Date('2026-08-15T19:00')
    const result = buildHourly(hourly, 24, now)
    expect(result.map((h) => h.time)).toEqual(['2026-08-15T19:00', '2026-08-15T20:00'])
  })

  it('redondea la temperatura y conserva código y probabilidad de lluvia', () => {
    const now = new Date('2026-08-15T18:00')
    const result = buildHourly(hourly, 24, now)
    expect(result[0]).toEqual({
      time: '2026-08-15T18:00',
      temp: 10,
      code: 3,
      rain: 0,
    })
  })

  it('limita la cantidad de horas devueltas', () => {
    const now = new Date('2026-08-15T18:00')
    expect(buildHourly(hourly, 2, now)).toHaveLength(2)
  })
})

describe('searchCity', () => {
  // Simula una respuesta de la API de geocodificación.
  function fakeFetch(results) {
    return async () => ({
      ok: true,
      json: async () => ({ results }),
    })
  }

  it('prioriza un resultado de Chile cuando existe', async () => {
    const cl = { name: 'Maule', country_code: 'CL', country: 'Chile' }
    const fr = { name: 'Maule', country_code: 'FR', country: 'Francia' }
    const result = await searchCity('maule', fakeFetch([fr, cl]))
    expect(result.name).toBe('Maule')
    expect(result.country_code).toBe('CL')
  })

  it('cae al primer resultado si no hay coincidencias chilenas', async () => {
    const fr = { name: 'Maule', country_code: 'FR', country: 'Francia' }
    const result = await searchCity('maule', fakeFetch([fr]))
    expect(result.country_code).toBe('FR')
  })

  it('reintenta con la primera palabra si la búsqueda completa falla', async () => {
    const calls = []
    const fetchFn = async (url) => {
      calls.push(url)
      const hasResults = url.includes('name=talca%20chile')
      return {
        ok: true,
        json: async () =>
          hasResults
            ? { results: [] }
            : { results: [{ name: 'Talca', country_code: 'CL', country: 'Chile' }] },
      }
    }
    const result = await searchCity('talca chile', fetchFn)
    expect(calls).toHaveLength(2)
    expect(result.name).toBe('Talca')
  })
})

describe('buildAlerts', () => {
  const today = new Date().toISOString().slice(0, 10)
  // Fechas futuras (después de hoy) para el pronóstico diario.
  const day1 = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  const day2 = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10)

  function makeDaily(codes, dates) {
    return {
      time: dates,
      weather_code: codes,
    }
  }

  it('no genera alertas si no hay lluvia', () => {
    const daily = makeDaily([0, 0], [day1, day2])
    expect(buildAlerts(null, daily)).toEqual([])
  })

  it('alerta sobre lluvia en las próximas horas de hoy', () => {
    const hourly = {
      time: [`${today}T10:00`, `${today}T11:00`],
      weather_code: [0, 61],
    }
    const daily = makeDaily([0], [today])
    const alerts = buildAlerts(hourly, daily)
    expect(alerts.some((a) => a.tipo === 'hourly')).toBe(true)
    expect(alerts[0].nivel).toBe('light')
  })

  it('marca lluvia fuerte para códigos severos', () => {
    const daily = makeDaily([95], [day1])
    const alerts = buildAlerts(null, daily)
    expect(alerts[0].nivel).toBe('strong')
    expect(alerts[0].texto).toContain('lluvia fuerte')
  })

  it('genera una alerta por cada día con lluvia', () => {
    const daily = makeDaily([0, 61, 65], [today, day1, day2])
    const alerts = buildAlerts(null, daily)
    expect(alerts.filter((a) => a.tipo === 'daily')).toHaveLength(2)
  })
})

describe('sceneConfig', () => {
  it('cielo despejado muestra sol sin nubes ni precipitación', () => {
    expect(sceneConfig(0)).toEqual({ sun: 1, clouds: 0, precip: null, heavy: false })
  })

  it('lluvia oculta el sol y activa precipitación', () => {
    const config = sceneConfig(61)
    expect(config.sun).toBe(0)
    expect(config.precip).toBe('rain')
    expect(config.heavy).toBe(false)
  })

  it('lluvia intensa marca heavy', () => {
    expect(sceneConfig(65).heavy).toBe(true)
  })

  it('nieve activa precipitación de tipo snow', () => {
    expect(sceneConfig(71).precip).toBe('snow')
  })

  it('tormenta marca storm y precipitación heavy', () => {
    const config = sceneConfig(95)
    expect(config.storm).toBe(true)
    expect(config.heavy).toBe(true)
  })
})