import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WeatherAlerts from './WeatherAlerts'

const alerts = [{ nivel: 'light', tipo: 'hourly', texto: 'Hoy hay lluvia en las próximas horas.' }]

describe('WeatherAlerts', () => {
  it('no renderiza nada si no hay alertas', () => {
    const { container } = render(<WeatherAlerts alerts={[]} onClose={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('mueve el foco al botón de cerrar al abrirse', () => {
    render(<WeatherAlerts alerts={alerts} onClose={() => {}} />)
    expect(screen.getByLabelText('Cerrar')).toHaveFocus()
  })

  it('cierra al presionar Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<WeatherAlerts alerts={alerts} onClose={onClose} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('cierra al hacer clic en el fondo pero no en el contenido', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<WeatherAlerts alerts={alerts} onClose={onClose} />)
    await user.click(screen.getByText(alerts[0].texto))
    expect(onClose).not.toHaveBeenCalled()
    await user.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
