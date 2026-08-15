import { describe, it, expect } from 'vitest'
import { buildHourly, searchCity } from './weather'

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