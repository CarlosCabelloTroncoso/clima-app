import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { weatherInfo, formatTemp } from '../lib/weather'

const CARD_WIDTH = 1200
const CARD_HEIGHT = 675

// Recorta y escala `source` (imagen o canvas) para llenar el rectángulo
// destino completo sin deformarlo, tipo `object-fit: cover`.
function drawCover(ctx, source, sourceWidth, sourceHeight, x, y, width, height) {
  const sourceRatio = sourceWidth / sourceHeight
  const targetRatio = width / height
  let drawWidth = sourceWidth
  let drawHeight = sourceHeight
  let offsetX = 0
  let offsetY = 0

  if (sourceRatio > targetRatio) {
    drawWidth = sourceHeight * targetRatio
    offsetX = (sourceWidth - drawWidth) / 2
  } else {
    drawHeight = sourceWidth / targetRatio
    offsetY = (sourceHeight - drawHeight) / 2
  }

  ctx.drawImage(source, offsetX, offsetY, drawWidth, drawHeight, x, y, width, height)
}

// Compone una imagen "tarjeta de clima" a partir de la escena 3D vigente
// (si hay) más los datos actuales, y la comparte con la Web Share API o,
// si no está disponible, la descarga.
function buildCard({ canvasRef, current, location, units, condition, appName, isDark }) {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT
  const ctx = canvas.getContext('2d')

  const source = canvasRef?.current
  if (source && source.width > 0 && source.height > 0) {
    drawCover(ctx, source, source.width, source.height, 0, 0, CARD_WIDTH, CARD_HEIGHT)
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT)
    if (isDark) {
      gradient.addColorStop(0, '#0b1220')
      gradient.addColorStop(1, '#1c2b47')
    } else {
      gradient.addColorStop(0, '#7db9e8')
      gradient.addColorStop(1, '#bfe0f5')
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)
  }

  // Degradado inferior para que el texto sea legible sobre cualquier escena.
  const overlay = ctx.createLinearGradient(0, CARD_HEIGHT * 0.35, 0, CARD_HEIGHT)
  overlay.addColorStop(0, 'rgba(10,14,24,0)')
  overlay.addColorStop(1, 'rgba(10,14,24,0.75)')
  ctx.fillStyle = overlay
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#ffffff'

  ctx.font = '600 40px system-ui, sans-serif'
  ctx.fillText(location, 60, 100)

  const emoji = weatherInfo(current.weather_code).emoji
  ctx.font = '110px system-ui, sans-serif'
  ctx.fillText(emoji, 60, 260)

  ctx.font = '700 130px system-ui, sans-serif'
  ctx.fillText(formatTemp(current.temperature_2m, units), 60, 420)

  ctx.font = '500 42px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.fillText(condition, 60, 480)

  ctx.font = '600 30px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.textAlign = 'right'
  ctx.fillText(`⛅ ${appName}`, CARD_WIDTH - 50, CARD_HEIGHT - 40)
  ctx.textAlign = 'left'

  return canvas
}

async function shareOrDownload(canvas, fileBase, shareTitle, shareText) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return

  const file = new File([blob], `${fileBase}.png`, { type: 'image/png' })

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: shareTitle, text: shareText })
      return
    } catch {
      // El usuario canceló el share o falló: cae al método de descarga.
    }
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${fileBase}.png`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

// Botón que genera y comparte/descarga una imagen con la escena 3D del
// clima actual más los datos principales, para compartir en redes o chats.
function ShareSnapshot({ canvasRef, current, location, units, isDark }) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    if (busy) return
    setBusy(true)
    try {
      const condition = t(weatherInfo(current.weather_code).key)
      const appName = t('app.name')
      const canvas = buildCard({ canvasRef, current, location, units, condition, appName, isDark })
      const fileBase = `weather-${location.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      await shareOrDownload(canvas, fileBase, appName, `${location} · ${formatTemp(current.temperature_2m, units)} · ${condition}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" className="share-btn" onClick={handleClick} disabled={busy} aria-label={t('share.button')}>
      {busy ? '⏳' : '📤'}
    </button>
  )
}

export default memo(ShareSnapshot)
