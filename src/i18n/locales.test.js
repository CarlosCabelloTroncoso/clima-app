import { describe, it, expect } from 'vitest'
import es from './locales/es.json'
import en from './locales/en.json'

// Recorre un objeto de traducciones y devuelve todas sus claves como rutas
// planas (p. ej. "alerts.level.light"), para poder comparar dos idiomas.
function flattenKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object') return flattenKeys(value, path)
    return [path]
  })
}

describe('paridad de traducciones es/en', () => {
  it('ambos idiomas tienen exactamente las mismas claves', () => {
    const esKeys = flattenKeys(es).sort()
    const enKeys = flattenKeys(en).sort()
    expect(enKeys).toEqual(esKeys)
  })

  it('ningún valor de traducción está vacío', () => {
    const allValues = [...flattenKeys(es).map((k) => [k, es]), ...flattenKeys(en).map((k) => [k, en])]
    for (const [path, dict] of allValues) {
      const value = path.split('.').reduce((acc, key) => acc?.[key], dict)
      expect(value, `clave vacía: ${path}`).toBeTruthy()
    }
  })
})
