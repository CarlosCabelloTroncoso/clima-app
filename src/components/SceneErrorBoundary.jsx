import { Component } from 'react'

// Contiene los errores de render de la escena 3D (p. ej. fallos de Three.js
// en dispositivos con soporte de WebGL parcial o roto) para que no tumben el
// resto de la app. Suspense no captura errores de render, solo de carga
// diferida, por eso esto va aparte y por fuera del Suspense.
class SceneErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Error al renderizar la escena 3D:', error)
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

export default SceneErrorBoundary
