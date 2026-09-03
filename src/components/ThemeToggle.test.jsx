import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from './ThemeToggle'

describe('ThemeToggle', () => {
  it('muestra "Oscuro" cuando isDark es true, sin importar si vino de auto o explícito', () => {
    render(<ThemeToggle isDark onThemeChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Cambiar a tema claro' })).toHaveTextContent('Oscuro')
  })

  it('muestra "Claro" cuando isDark es false', () => {
    render(<ThemeToggle isDark={false} onThemeChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Cambiar a tema oscuro' })).toHaveTextContent('Claro')
  })

  it('siempre alterna al estado visual contrario, no al valor de theme guardado', async () => {
    const user = userEvent.setup()
    const onThemeChange = vi.fn()
    // Caso clave: theme='auto' resuelto a oscuro por el sistema. Debe ofrecer
    // pasar a 'light', no a 'dark' (que dejaría la página visualmente igual).
    render(<ThemeToggle isDark onThemeChange={onThemeChange} />)
    await user.click(screen.getByRole('button'))
    expect(onThemeChange).toHaveBeenCalledWith('light')
  })
})
