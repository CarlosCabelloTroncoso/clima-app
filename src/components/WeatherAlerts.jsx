import { memo, useEffect, useRef } from 'react'

// Modal de alertas meteorológicas. Aparece superpuesto sobre la página al
// cargar y se cierra al hacer clic en cualquier parte de la pantalla, con
// Escape, o restaurando el foco al elemento que lo tenía antes de abrirse.
function WeatherAlerts({ alerts, onClose }) {
  const closeButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (alerts.length === 0) return undefined

    previousFocusRef.current = document.activeElement
    closeButtonRef.current?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus?.()
    }
  }, [alerts.length, onClose])

  if (alerts.length === 0) return null
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Alertas meteorológicas"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Alertas meteorológicas</h3>
          <button type="button" className="modal-close" onClick={onClose} ref={closeButtonRef} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="modal-alerts">
          {alerts.map((alert, i) => (
            <div key={i} className={`alert ${alert.nivel}`}>
              <span className="alert-icon">{alert.nivel === 'strong' ? '⚠️' : '🌧️'}</span>
              <span>{alert.texto}</span>
            </div>
          ))}
        </div>
        <p className="modal-hint">Toca cualquier parte de la pantalla o presiona Escape para cerrar</p>
      </div>
    </div>
  )
}

export default memo(WeatherAlerts)