import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CompareWeather from './CompareWeather'

const primaryCurrent = { weather_code: 0, temperature_2m: 18, wind_speed_10m: 10, relative_humidity_2m: 50 }
const compareCurrent = { weather_code: 61, temperature_2m: 12, wind_speed_10m: 20, relative_humidity_2m: 80 }

describe('CompareWeather', () => {
  it('muestra el buscador cuando no hay ciudad de comparación', () => {
    render(
      <CompareWeather
        primaryLocation="Santiago, Chile"
        primaryCurrent={primaryCurrent}
        compareCity={null}
        compareCurrent={null}
        loading={false}
        units="metric"
        onSearch={() => {}}
        onSelectCity={() => {}}
        onRemove={() => {}}
      />,
    )
    expect(screen.getByLabelText('Buscar una ciudad')).toBeInTheDocument()
    expect(screen.queryByText('Quitar')).not.toBeInTheDocument()
  })

  it('busca al enviar el formulario', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(
      <CompareWeather
        primaryLocation="Santiago, Chile"
        primaryCurrent={primaryCurrent}
        compareCity={null}
        compareCurrent={null}
        loading={false}
        units="metric"
        onSearch={onSearch}
        onSelectCity={() => {}}
        onRemove={() => {}}
      />,
    )
    await user.type(screen.getByLabelText('Buscar una ciudad'), 'Talca')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(onSearch).toHaveBeenCalledWith('Talca')
  })

  it('muestra ambas ciudades lado a lado cuando hay comparación activa', () => {
    render(
      <CompareWeather
        primaryLocation="Santiago, Chile"
        primaryCurrent={primaryCurrent}
        compareCity={{ id: '2', name: 'Talca, Chile' }}
        compareCurrent={compareCurrent}
        loading={false}
        units="metric"
        onSearch={() => {}}
        onSelectCity={() => {}}
        onRemove={() => {}}
      />,
    )
    expect(screen.getByText('Santiago, Chile')).toBeInTheDocument()
    expect(screen.getByText('Talca, Chile')).toBeInTheDocument()
    expect(screen.getByText('18°C')).toBeInTheDocument()
    expect(screen.getByText('12°C')).toBeInTheDocument()
  })

  it('llama a onRemove al hacer clic en Quitar', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(
      <CompareWeather
        primaryLocation="Santiago, Chile"
        primaryCurrent={primaryCurrent}
        compareCity={{ id: '2', name: 'Talca, Chile' }}
        compareCurrent={compareCurrent}
        loading={false}
        units="metric"
        onSearch={() => {}}
        onSelectCity={() => {}}
        onRemove={onRemove}
      />,
    )
    await user.click(screen.getByText('Quitar'))
    expect(onRemove).toHaveBeenCalledOnce()
  })
})
