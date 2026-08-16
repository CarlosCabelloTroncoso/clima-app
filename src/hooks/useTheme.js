import { useEffect, useState } from 'react'
import { readTheme, writeTheme } from '../lib/storage'

// Hook que gestiona el tema visual. Aplica una clase al documento según el
// modo elegido (light, dark o auto) y persiste la preferencia del usuario.
export default function useTheme(storage) {
  const [theme, setTheme] = useState(() => readTheme(storage))

  useEffect(() => {
    writeTheme(storage, theme)
  }, [theme, storage])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark')
    if (theme !== 'auto') root.classList.add(`theme-${theme}`)
  }, [theme])

  return { theme, setTheme }
}