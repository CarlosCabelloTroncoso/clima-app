import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import i18n from '../i18n'
import CurrentWeather from './CurrentWeather'
import DailyForecast from './DailyForecast'

// Estos componentes están envueltos en memo() y reciben props que no cambian
// cuando solo cambia el idioma. Prueba que igual se actualizan: useTranslation
// se suscribe al evento languageChanged y fuerza su propio re-render, algo
// independiente de la comparación de props que hace memo.
describe('componentes memoizados reaccionan al cambio de idioma', () => {
  afterEach(async () => {
    await i18n.changeLanguage('es')
  })

  it('CurrentWeather traduce la condición del clima sin cambiar props', async () => {
    const current = { weather_code: 0, temperature_2m: 20, wind_speed_10m: 10, relative_humidity_2m: 50 }
    render(
      <CurrentWeather location="Test" current={current} isFavorite={false} onToggleFavorite={() => {}} units="metric" />,
    )
    expect(screen.getByText('Cielo despejado')).toBeInTheDocument()

    await act(() => i18n.changeLanguage('en'))
    expect(screen.getByText('Clear sky')).toBeInTheDocument()
  })

  it('DailyForecast traduce "Hoy" sin cambiar props', async () => {
    const daily = { time: ['2026-08-15'], weather_code: [0], temperature_2m_max: [20], temperature_2m_min: [10] }
    render(<DailyForecast daily={daily} units="metric" />)
    expect(screen.getByText('Hoy')).toBeInTheDocument()

    await act(() => i18n.changeLanguage('en'))
    expect(screen.getByText('Today')).toBeInTheDocument()
  })
})
