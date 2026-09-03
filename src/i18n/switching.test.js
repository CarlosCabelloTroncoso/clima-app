import { describe, it, expect, afterEach } from 'vitest'
import i18n from './index'

describe('cambio de idioma en tiempo de ejecución', () => {
  afterEach(async () => {
    await i18n.changeLanguage('es')
  })

  it('cambia las traducciones al llamar a changeLanguage', async () => {
    expect(i18n.t('search.button')).toBe('Buscar')
    await i18n.changeLanguage('en')
    expect(i18n.t('search.button')).toBe('Search')
  })

  it('interpola valores igual en ambos idiomas', async () => {
    expect(i18n.t('app.footer', { version: '3.1.0' })).toBe('Mi Clima · v3.1.0')
    await i18n.changeLanguage('en')
    expect(i18n.t('app.footer', { version: '3.1.0' })).toBe('My Weather · v3.1.0')
  })
})
