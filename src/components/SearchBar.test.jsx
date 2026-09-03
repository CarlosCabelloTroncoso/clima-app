import { useState } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from './SearchBar'

function jsonResponse(results) {
  return { ok: true, json: async () => ({ results }) }
}

describe('SearchBar', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse([{ id: 1, name: 'Talca', country: 'Chile', country_code: 'CL', latitude: -35, longitude: -71 }]),
      ),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('no busca sugerencias con menos de 2 caracteres', async () => {
    const user = userEvent.setup()
    render(<SearchBar query="" onQueryChange={() => {}} onSubmit={() => {}} onSelectCity={() => {}} loading={false} />)
    await user.type(screen.getByLabelText('Buscar una ciudad'), 'a')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('muestra sugerencias y selecciona una ciudad', async () => {
    const user = userEvent.setup()
    const onSelectCity = vi.fn()

    function Wrapper() {
      const [query, setQuery] = useState('')
      return (
        <SearchBar query={query} onQueryChange={setQuery} onSubmit={() => {}} onSelectCity={onSelectCity} loading={false} />
      )
    }

    render(<Wrapper />)
    await user.type(screen.getByLabelText('Buscar una ciudad'), 'talca')

    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument(), { timeout: 1000 })
    const option = await screen.findByText(/Talca, Chile/)
    await user.click(option)

    expect(onSelectCity).toHaveBeenCalledWith({ id: '1', name: 'Talca, Chile', lat: -35, lon: -71 })
  })
})
