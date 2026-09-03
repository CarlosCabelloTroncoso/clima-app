import { describe, it, expect, beforeEach } from 'vitest'
import {
  toggleFavorite,
  addHistory,
  clearFavorites,
  clearHistory,
  readTheme,
  writeTheme,
  readUnits,
  writeUnits,
  readLanguage,
  writeLanguage,
  STORAGE_KEYS,
} from './storage'

// Almacenamiento simulado en memoria para aislar los tests.
function createMemoryStorage() {
  const data = {}
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v)
    },
    removeItem: (k) => {
      delete data[k]
    },
  }
}

const santiago = { id: '1', name: 'Santiago, Chile', lat: -33, lon: -70 }
const talca = { id: '2', name: 'Talca, Chile', lat: -35, lon: -71 }

describe('toggleFavorite', () => {
  let storage
  beforeEach(() => {
    storage = createMemoryStorage()
  })

  it('agrega una ciudad que no estaba en favoritos', () => {
    const result = toggleFavorite(storage, santiago)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('quita una ciudad que ya estaba en favoritos', () => {
    toggleFavorite(storage, santiago)
    const result = toggleFavorite(storage, santiago)
    expect(result).toHaveLength(0)
  })

  it('no duplica ciudades al agregar', () => {
    toggleFavorite(storage, santiago)
    const result = toggleFavorite(storage, talca)
    expect(result).toHaveLength(2)
  })
})

describe('addHistory', () => {
  let storage
  beforeEach(() => {
    storage = createMemoryStorage()
  })

  it('pone la ciudad más reciente al inicio', () => {
    addHistory(storage, santiago)
    const result = addHistory(storage, talca)
    expect(result[0].id).toBe('2')
  })

  it('mueve una ciudad repetida al inicio sin duplicarla', () => {
    addHistory(storage, santiago)
    addHistory(storage, talca)
    const result = addHistory(storage, santiago)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('1')
  })
})

describe('clearFavorites / clearHistory', () => {
  let storage
  beforeEach(() => {
    storage = createMemoryStorage()
  })

  it('vacía la lista de favoritos', () => {
    toggleFavorite(storage, santiago)
    const result = clearFavorites(storage)
    expect(result).toEqual([])
    expect(toggleFavorite(storage, santiago)).toHaveLength(1)
  })

  it('vacía el historial', () => {
    addHistory(storage, santiago)
    const result = clearHistory(storage)
    expect(result).toEqual([])
    expect(addHistory(storage, santiago)).toHaveLength(1)
  })
})

describe('tema', () => {
  let storage
  beforeEach(() => {
    storage = createMemoryStorage()
  })

  it('por defecto devuelve "auto"', () => {
    expect(readTheme(storage)).toBe('auto')
  })

  it('guarda y recupera el tema seleccionado', () => {
    writeTheme(storage, 'dark')
    expect(readTheme(storage)).toBe('dark')
  })

  it('valida y descarta valores no permitidos', () => {
    storage.setItem(STORAGE_KEYS.theme, '"rojo"')
    expect(readTheme(storage)).toBe('auto')
  })
})

describe('unidades', () => {
  let storage
  beforeEach(() => {
    storage = createMemoryStorage()
  })

  it('por defecto devuelve "metric"', () => {
    expect(readUnits(storage)).toBe('metric')
  })

  it('guarda y recupera el sistema de unidades seleccionado', () => {
    writeUnits(storage, 'imperial')
    expect(readUnits(storage)).toBe('imperial')
  })

  it('valida y descarta valores no permitidos', () => {
    storage.setItem(STORAGE_KEYS.units, '"kelvin"')
    expect(readUnits(storage)).toBe('metric')
  })
})

describe('idioma', () => {
  let storage
  beforeEach(() => {
    storage = createMemoryStorage()
  })

  it('devuelve null si no hay preferencia guardada', () => {
    expect(readLanguage(storage)).toBeNull()
  })

  it('guarda y recupera el idioma seleccionado', () => {
    writeLanguage(storage, 'en')
    expect(readLanguage(storage)).toBe('en')
  })

  it('devuelve null para valores no soportados', () => {
    storage.setItem(STORAGE_KEYS.language, '"fr"')
    expect(readLanguage(storage)).toBeNull()
  })
})