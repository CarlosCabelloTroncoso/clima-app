import { describe, it, expect } from 'vitest'
import { sunPosition, moonPosition, moonIllumination, skyPosition } from './astronomy'

describe('sunPosition', () => {
  it('devuelve azimut y altitud en rangos válidos', () => {
    const pos = sunPosition(new Date('2026-06-21T12:00:00Z'), -33.45, -70.67)
    expect(pos.azimuth).toBeGreaterThanOrEqual(0)
    expect(pos.azimuth).toBeLessThan(360)
    expect(pos.altitude).toBeGreaterThanOrEqual(-90)
    expect(pos.altitude).toBeLessThanOrEqual(90)
  })

  it('el sol está más alto al mediodía solar que a medianoche', () => {
    const noon = sunPosition(new Date('2026-06-21T16:00:00Z'), -33.45, -70.67)
    const midnight = sunPosition(new Date('2026-06-21T04:00:00Z'), -33.45, -70.67)
    expect(noon.altitude).toBeGreaterThan(midnight.altitude)
  })
})

describe('moonPosition', () => {
  it('devuelve azimut y altitud en rangos válidos', () => {
    const pos = moonPosition(new Date('2026-06-21T12:00:00Z'), -33.45, -70.67)
    expect(pos.azimuth).toBeGreaterThanOrEqual(0)
    expect(pos.azimuth).toBeLessThan(360)
    expect(pos.altitude).toBeGreaterThanOrEqual(-90)
    expect(pos.altitude).toBeLessThanOrEqual(90)
  })
})

describe('moonIllumination', () => {
  it('la fracción iluminada está entre 0 y 1', () => {
    const illum = moonIllumination(new Date('2026-06-21T12:00:00Z'))
    expect(illum.fraction).toBeGreaterThanOrEqual(0)
    expect(illum.fraction).toBeLessThanOrEqual(1)
  })
})

describe('skyPosition', () => {
  it('altitud 90° (cenit) queda directamente arriba', () => {
    const p = skyPosition(0, 90, 10)
    expect(p.y).toBeCloseTo(10, 5)
    expect(p.x).toBeCloseTo(0, 5)
  })

  it('altitud 0° (horizonte) queda a la altura de la cámara', () => {
    const p = skyPosition(90, 0, 10)
    expect(p.y).toBeCloseTo(0, 5)
  })

  it('mayor altitud siempre da mayor altura en la escena', () => {
    const low = skyPosition(120, 10, 10)
    const high = skyPosition(120, 60, 10)
    expect(high.y).toBeGreaterThan(low.y)
  })

  it('acepta un offset de profundidad', () => {
    const withoutOffset = skyPosition(0, 45, 10)
    const withOffset = skyPosition(0, 45, 10, 3)
    expect(withOffset.z).toBeCloseTo(withoutOffset.z - 3, 5)
  })

  it('siempre queda detrás del origen (z negativo) sin importar el azimut', () => {
    // Un azimut sur (habitual al mediodía en el hemisferio norte) no debe
    // empujar el punto hacia +z, es decir hacia o más allá de la cámara.
    for (const azimuth of [0, 45, 90, 135, 180, 225, 270, 315]) {
      const p = skyPosition(azimuth, 20, 6, 3)
      expect(p.z).toBeLessThanOrEqual(-3)
    }
  })
})
