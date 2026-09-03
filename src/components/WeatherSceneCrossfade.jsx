import { useEffect, useRef, useState } from 'react'
import WeatherScene from './WeatherScene'

const TRANSITION_MS = 900
let layerId = 0

// Una capa individual de la escena: aparece con un fundido suave cuando se
// monta, para que el cambio de clima no se sienta como un salto brusco.
function SceneLayer({ code, isDark, lat, lon, canvasRef }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className={visible ? 'weather-scene-layer is-visible' : 'weather-scene-layer'}>
      <WeatherScene code={code} isDark={isDark} lat={lat} lon={lon} canvasRef={canvasRef} />
    </div>
  )
}

// Envuelve WeatherScene: al cambiar de ciudad, de clima o de tema, monta la
// escena nueva encima de la anterior y la desvanece hacia adentro, en vez de
// reemplazar la escena de golpe. `canvasRef`, si se pasa, termina apuntando
// siempre al canvas de la capa más reciente (útil para capturas de pantalla).
function WeatherSceneCrossfade({ code, isDark, lat, lon, canvasRef }) {
  const [layers, setLayers] = useState(() => [{ id: layerId, code, isDark, lat, lon }])
  const lastKey = useRef(`${code}-${isDark}-${lat}-${lon}`)

  useEffect(() => {
    const key = `${code}-${isDark}-${lat}-${lon}`
    if (key === lastKey.current) return undefined
    lastKey.current = key

    layerId += 1
    const id = layerId
    setLayers((prev) => [...prev, { id, code, isDark, lat, lon }])

    const timeout = setTimeout(() => {
      setLayers((prev) => prev.filter((layer) => layer.id === id))
    }, TRANSITION_MS)

    return () => clearTimeout(timeout)
  }, [code, isDark, lat, lon])

  return (
    <div className="weather-scene-stack">
      {layers.map((layer) => (
        <SceneLayer
          key={layer.id}
          code={layer.code}
          isDark={layer.isDark}
          lat={layer.lat}
          lon={layer.lon}
          canvasRef={canvasRef}
        />
      ))}
    </div>
  )
}

export default WeatherSceneCrossfade
