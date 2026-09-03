import { getPosition, getMoonPosition, getMoonIllumination } from 'suncalc'

// Envuelve suncalc para exponer solo lo que usa la escena 3D, y agrega la
// proyección a coordenadas de escena. Se mantiene separado de Three.js para
// poder testear la trigonometría sin un contexto WebGL.

// Posición real del sol (azimut/altitud en grados) para una fecha y coordenadas.
export function sunPosition(date, lat, lon) {
  return getPosition(date, lat, lon)
}

// Posición real de la luna (azimut/altitud en grados) para una fecha y coordenadas.
export function moonPosition(date, lat, lon) {
  return getMoonPosition(date, lat, lon)
}

// Fracción iluminada de la luna (0 = nueva, 1 = llena) para una fecha.
export function moonIllumination(date) {
  return getMoonIllumination(date)
}

const DEG_TO_RAD = Math.PI / 180

// Proyecta azimut/altitud (grados, azimut medido desde el norte en sentido
// horario) a un punto en el domo visual de la escena. No es una proyección
// astronómicamente literal respecto a la orientación real del espectador
// (la cámara no representa un rumbo geográfico fijo) — es una proyección
// estilizada que preserva el arco real de salida/puesta: altitud alta queda
// arriba, altitud baja queda cerca del horizonte, y el azimut da variación
// de posición horizontal a medida que el astro recorre el cielo.
export function skyPosition(azimuthDeg, altitudeDeg, radius, depthOffset = 0) {
  const az = azimuthDeg * DEG_TO_RAD
  // Se deja bajar un poco más allá del horizonte (hasta -8°) para que el
  // sol/luna se vean "asomando" cerca del horizonte en vez de desaparecer
  // de golpe apenas cruzan los 0°.
  const alt = Math.max(altitudeDeg, -8) * DEG_TO_RAD
  const horizontal = Math.cos(alt) * radius
  return {
    x: Math.sin(az) * horizontal,
    y: Math.sin(alt) * radius,
    // Siempre negativo (hacia el fondo de la escena): la cámara es fija y
    // solo "mira" hacia adelante, no hay una orientación real de brújula
    // que decidir. Usar cos(az) sin valor absoluto haría que un azimut sur
    // (habitual al mediodía en el hemisferio norte) empujara el sol hacia
    // +z, es decir cerca o delante de la cámara — con abs() el azimut solo
    // varía qué tan profundo queda, nunca lo saca del fondo.
    z: -Math.abs(Math.cos(az)) * horizontal - depthOffset,
  }
}
