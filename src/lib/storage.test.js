import { describe, it, expect, beforeEach } from 'vitest'
import { toggleFavorite, addHistory, readTheme, writeTheme, STORAGE_KEYS } from './storage'

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