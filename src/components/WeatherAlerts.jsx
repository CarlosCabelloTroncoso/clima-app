// Modal de alertas meteorológicas. Aparece superpuesto sobre la página al
// cargar y se cierra al hacer clic en cualquier parte de la pantalla.
function WeatherAlerts({ alerts, onClose }) {
  if (alerts.length === 0) return null
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-label="Alertas meteorológicas">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Alertas meteorológicas</h3>
        <div className="modal-alerts">
          {alerts.map((alert, i) => (
            <div key={i} className={`alert ${alert.nivel}`}>
              <span className="alert-icon">{alert.nivel === 'strong' ? '⚠️' : '🌧️'}</span>
              <span>{alert.texto}</span>
            </div>
          ))}
        </div>
        <p className="modal-hint">Toca cualquier parte de la pantalla para cerrar</p>
      </div>
    </div>
  )
}

export default WeatherAlerts