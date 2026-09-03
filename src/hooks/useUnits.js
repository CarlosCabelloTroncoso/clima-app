import { useEffect, useState } from 'react'
import { readUnits, writeUnits } from '../lib/storage'

// Hook que gestiona el sistema de unidades (métrico o imperial) y persiste
// la preferencia del usuario.
export default function useUnits(storage) {
  const [units, setUnits] = useState(() => readUnits(storage))

  useEffect(() => {
    writeUnits(storage, units)
  }, [units, storage])

  return { units, setUnits }
}
