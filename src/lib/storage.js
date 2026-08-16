// Claves usadas para guardar datos en el almacenamiento local.
export const STORAGE_KEYS = {
  favorites: 'weather-app:favorites',
  history: 'weather-app:history',
  theme: 'weather-app:theme',
}

const MAX_HISTORY = 8

// Lee y parsea un valor JSON del almacenamiento. Devuelve `fallback` si no existe
// o si el contenido está corrupto.
export function readJSON(storage, key, fallback) {
  try {
    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// Guarda un valor como JSON en el almacenamiento. Ignora errores de cuota o privacidad.
export function writeJSON(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // No hacer nada: si el almacenamiento falla, los datos se pierden sin romper la app.
  }
}

// Añade o quita un elemento de la lista de favoritos (sin duplicados).
export function toggleFavorite(storage, city) {
  const favorites = readJSON(storage, STORAGE_KEYS.favorites, [])
  const exists = favorites.some((f) => f.id === city.id)
  const next = exists ? favorites.filter((f) => f.id !== city.id) : [...favorites, city]
  writeJSON(storage, STORAGE_KEYS.favorites, next)
  return next
}

// Registra una ciudad en el historial, moviendo los repetidos al inicio y
// manteniendo un tamaño máximo.
export function addHistory(storage, city) {
  const history = readJSON(storage, STORAGE_KEYS.history, [])
  const filtered = history.filter((h) => h.id !== city.id)
  const next = [city, ...filtered].slice(0, MAX_HISTORY)
  writeJSON(storage, STORAGE_KEYS.history, next)
  return next
}

// Vacía la lista de favoritos.
export function clearFavorites(storage) {
  writeJSON(storage, STORAGE_KEYS.favorites, [])
  return []
}

// Vacía el historial de búsquedas.
export function clearHistory(storage) {
  writeJSON(storage, STORAGE_KEYS.history, [])
  return []
}

// Lee el tema guardado, validando que sea uno de los valores permitidos.
export function readTheme(storage) {
  const theme = readJSON(storage, STORAGE_KEYS.theme, 'auto')
  return ['light', 'dark', 'auto'].includes(theme) ? theme : 'auto'
}

// Guarda el tema seleccionado.
export function writeTheme(storage, theme) {
  writeJSON(storage, STORAGE_KEYS.theme, theme)
}