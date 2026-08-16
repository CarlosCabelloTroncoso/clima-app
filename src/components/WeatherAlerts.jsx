// Muestra las alertas meteorológicas detectadas en el pronóstico.
function WeatherAlerts({ alerts }) {
  if (alerts.length === 0) return null
  return (
    <div className="alerts">
      {alerts.map((alert, i) => (
        <div key={i} className={`alert ${alert.nivel}`}>
          <span className="alert-icon">{alert.nivel === 'strong' ? '⚠️' : '🌧️'}</span>
          <span>{alert.texto}</span>
        </div>
      ))}
    </div>
  )
}

export default WeatherAlerts