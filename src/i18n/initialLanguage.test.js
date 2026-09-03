import { describe, it, expect, beforeEach, vi } from 'vitest'

// Prueba que i18next arranca ya en el idioma guardado (no en DEFAULT_LANGUAGE
// seguido de un cambio async), que es justamente lo que evita el parpadeo en
// español que un usuario con "en" guardado vería en cada carga si esto
// estuviera roto. Cada test reimporta el módulo desde cero (vi.resetModules)
// porque i18n/index.js resuelve el idioma inicial una sola vez, al importarse.
describe('idioma inicial de i18next', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
  })

  it('arranca en el idioma guardado en localStorage, sin pasar por el default primero', async () => {
    localStorage.setItem('weather-app:language', '"en"')
    const { default: i18n } = await import('./index')
    expect(i18n.language).toBe('en')
  })

  it('arranca en español si no hay nada guardado', async () => {
    const { default: i18n } = await import('./index')
    expect(i18n.language).toBe('es')
  })

  it('ignora un valor guardado que no sea un idioma soportado', async () => {
    localStorage.setItem('weather-app:language', '"fr"')
    const { default: i18n } = await import('./index')
    expect(i18n.language).toBe('es')
  })

  it('sincroniza document.documentElement.lang desde el arranque', async () => {
    localStorage.setItem('weather-app:language', '"en"')
    await import('./index')
    expect(document.documentElement.lang).toBe('en')
  })
})
