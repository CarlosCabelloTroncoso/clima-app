import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShareSnapshot from './ShareSnapshot'

const current = { weather_code: 0, temperature_2m: 20, wind_speed_10m: 10, relative_humidity_2m: 50 }

// jsdom no implementa un contexto 2D de canvas real: se simula lo mínimo que
// usa buildCard (gradientes, texto, rects) para poder probar el flujo sin un
// navegador de verdad.
function fakeContext() {
  return {
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    set fillStyle(_v) {},
    set font(_v) {},
    set textAlign(_v) {},
    set textBaseline(_v) {},
  }
}

describe('ShareSnapshot', () => {
  let getContextSpy
  let toBlobSpy

  beforeEach(() => {
    getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fakeContext())
    toBlobSpy = vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => {
      cb(new Blob(['fake'], { type: 'image/png' }))
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('genera la imagen y descarga cuando no hay Web Share API', async () => {
    const user = userEvent.setup()
    render(<ShareSnapshot canvasRef={{ current: null }} current={current} location="Santiago, Chile" units="metric" />)

    const button = screen.getByRole('button', { name: 'Compartir el clima como imagen' })
    await user.click(button)

    await waitFor(() => expect(toBlobSpy).toHaveBeenCalled())
    expect(getContextSpy).toHaveBeenCalledWith('2d')
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it('usa el canvas de la escena si está disponible como fuente', async () => {
    const user = userEvent.setup()
    const sceneCanvas = document.createElement('canvas')
    Object.defineProperty(sceneCanvas, 'width', { value: 800 })
    Object.defineProperty(sceneCanvas, 'height', { value: 600 })

    render(
      <ShareSnapshot canvasRef={{ current: sceneCanvas }} current={current} location="Santiago, Chile" units="metric" />,
    )
    await user.click(screen.getByRole('button', { name: 'Compartir el clima como imagen' }))

    await waitFor(() => expect(toBlobSpy).toHaveBeenCalled())
  })
})
