import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LanguageToggle from './LanguageToggle'

describe('LanguageToggle', () => {
  it('muestra el idioma actual y cambia al otro al hacer clic', async () => {
    const user = userEvent.setup()
    const onLanguageChange = vi.fn()
    render(<LanguageToggle language="es" onLanguageChange={onLanguageChange} />)

    const button = screen.getByRole('button', { name: 'Cambiar a inglés' })
    expect(button).toHaveTextContent('ES')

    await user.click(button)
    expect(onLanguageChange).toHaveBeenCalledWith('en')
  })

  it('ofrece cambiar a español cuando el idioma actual es inglés', () => {
    render(<LanguageToggle language="en" onLanguageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Cambiar a español' })).toHaveTextContent('EN')
  })
})
