import { useEffect, useRef, useState } from 'react'
import WeatherScene from './WeatherScene'

const TRANSITION_MS = 900
let layerId = 0

// Una capa individual de la escena: aparece con un fundido suave cuando se
// monta, para que el cambio de clima no se sienta como un salto brusco.
function SceneLayer({ code, isDark }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className={visible ? 'weather-scene-layer is-visible' : 'weather-scene-layer'}>
      <WeatherScene code={code} isDark={isDark} />
    </div>
  )
}

// Envuelve WeatherScene: al cambiar de ciudad o de tema, monta la escena
// nueva encima de la anterior y la desvanece hacia adentro, en vez de
// reemplazar la escena de golpe.
function WeatherSceneCrossfade({ code, isDark }) {
  const [layers, setLayers] = useState(() => [{ id: layerId, code, isDark }])
  const lastKey = useRef(`${code}-${isDark}`)

  useEffect(() => {
    const key = `${code}-${isDark}`
    if (key === lastKey.current) return undefined
    lastKey.current = key

    layerId += 1
    const id = layerId
    setLayers((prev) => [...prev, { id, code, isDark }])

    const timeout = setTimeout(() => {
      setLayers((prev) => prev.filter((layer) => layer.id === id))
    }, TRANSITION_MS)

    return () => clearTimeout(timeout)
  }, [code, isDark])

  return (
    <div className="weather-scene-stack">
      {layers.map((layer) => (
        <SceneLayer key={layer.id} code={layer.code} isDark={layer.isDark} />
      ))}
    </div>
  )
}

export default WeatherSceneCrossfade
