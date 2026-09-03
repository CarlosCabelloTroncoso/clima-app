import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CurrentWeather from './CurrentWeather'

const baseCurrent = {
  weather_code: 0,
  temperature_2m: 18.4,
  wind_speed_10m: 12.3,
  relative_humidity_2m: 55,
}

describe('CurrentWeather', () => {
  it('muestra la temperatura, condición y métricas principales', () => {
    render(
      <CurrentWeather
        location="Santiago, Chile"
        current={baseCurrent}
        isFavorite={false}
        onToggleFavorite={() => {}}
        units="metric"
      />,
    )
    expect(screen.getByText('Santiago, Chile')).toBeInTheDocument()
    expect(screen.getByText('18°C')).toBeInTheDocument()
    expect(screen.getByText('Cielo despejado')).toBeInTheDocument()
  })

  it('convierte a fahrenheit cuando units es imperial', () => {
    render(
      <CurrentWeather
        location="Santiago, Chile"
        current={baseCurrent}
        isFavorite={false}
        onToggleFavorite={() => {}}
        units="imperial"
      />,
    )
    expect(screen.getByText('65°F')).toBeInTheDocument()
  })

  it('no muestra sensación térmica, UV ni amanecer si no vienen en los datos', () => {
    render(
      <CurrentWeather
        location="Santiago, Chile"
        current={baseCurrent}
        isFavorite={false}
        onToggleFavorite={() => {}}
        units="metric"
      />,
    )
    expect(screen.queryByText(/Sensación térmica/)).not.toBeInTheDocument()
    expect(screen.queryByText(/UV/)).not.toBeInTheDocument()
  })

  it('muestra sensación térmica, presión, UV y calidad del aire cuando vienen en los datos', () => {
    render(
      <CurrentWeather
        location="Santiago, Chile"
        current={{ ...baseCurrent, apparent_temperature: 16.2, surface_pressure: 1013 }}
        daily={{ uv_index_max: [6.2], sunrise: ['2026-09-03T06:57'], sunset: ['2026-09-03T18:26'] }}
        air={{ european_aqi: 15 }}
        isFavorite={false}
        onToggleFavorite={() => {}}
        units="metric"
      />,
    )
    expect(screen.getByText(/Sensación térmica 16°C/)).toBeInTheDocument()
    expect(screen.getByText('1013')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('Buena')).toBeInTheDocument()
  })

  it('llama a onToggleFavorite al hacer clic en la estrella', async () => {
    const user = userEvent.setup()
    const onToggleFavorite = vi.fn()
    render(
      <CurrentWeather
        location="Santiago, Chile"
        current={baseCurrent}
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
        units="metric"
      />,
    )
    await user.click(screen.getByLabelText('Agregar a favoritos'))
    expect(onToggleFavorite).toHaveBeenCalledOnce()
  })
})
