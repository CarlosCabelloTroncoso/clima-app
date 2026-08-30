import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { sceneConfig } from '../lib/weather'

// Fondo animado en 3D detrás de la tarjeta del clima actual: sol/luna, nubes
// en capas con parallax y partículas de lluvia o nieve según el código WMO.
// Se degrada de forma silenciosa (no renderiza nada) si WebGL no está
// disponible, para no romper el resto de la interfaz.
function WeatherScene({ code, isDark }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const width = mount.clientWidth
    const height = mount.clientHeight
    if (!width || !height) return undefined

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch {
      return undefined
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.position.z = 10

    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    mount.appendChild(renderer.domElement)

    const config = sceneConfig(code)
    const disposables = []

    // Sol o luna: esfera simple cuya opacidad depende de la nubosidad.
    const sunGeometry = new THREE.SphereGeometry(1.1, 32, 32)
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: isDark ? 0xd8dee9 : 0xffd166,
      transparent: true,
      opacity: config.sun,
    })
    const sun = new THREE.Mesh(sunGeometry, sunMaterial)
    sun.position.set(2.5, 2.2, -3)
    sun.visible = config.sun > 0
    scene.add(sun)
    disposables.push(sunGeometry, sunMaterial)

    // Nubes: grupos de esferas superpuestas, en capas con distinta velocidad
    // y profundidad para dar sensación de parallax.
    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: isDark ? 0x4c566a : 0xffffff,
      transparent: true,
      opacity: config.storm ? 0.95 : 0.85,
    })
    const cloudGeometry = new THREE.SphereGeometry(0.6, 12, 12)
    disposables.push(cloudMaterial, cloudGeometry)

    const puffOffsets = [
      [0, 0, 0],
      [0.7, 0.15, 0],
      [-0.7, 0.1, 0],
      [0.35, 0.4, 0.2],
      [-0.35, 0.35, -0.2],
    ]

    function makeCloud(x, y, z, scale) {
      const group = new THREE.Group()
      puffOffsets.forEach(([px, py, pz]) => {
        const mesh = new THREE.Mesh(cloudGeometry, cloudMaterial)
        mesh.position.set(px, py, pz)
        group.add(mesh)
      })
      group.position.set(x, y, z)
      group.scale.setScalar(scale)
      scene.add(group)
      return group
    }

    const cloudCount = Math.round(config.clouds * 6)
    const clouds = []
    for (let i = 0; i < cloudCount; i += 1) {
      const layer = i % 3
      const x = (Math.random() - 0.5) * 12
      const y = 1.4 + Math.random() * 1.6 - layer * 0.3
      const z = -1 - layer * 1.5
      const scale = 0.8 + Math.random() * 0.6
      clouds.push({ group: makeCloud(x, y, z, scale), speed: 0.15 + layer * 0.1 })
    }

    // Precipitación: nube de puntos que cae y se recicla al salir de cuadro.
    let particles = null
    let velocities = null
    if (config.precip) {
      const count = config.heavy ? 400 : 180
      const positions = new Float32Array(count * 3)
      velocities = new Float32Array(count)
      for (let i = 0; i < count; i += 1) {
        positions[i * 3] = (Math.random() - 0.5) * 14
        positions[i * 3 + 1] = Math.random() * 10 - 3
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6
        velocities[i] = config.precip === 'snow' ? 0.02 + Math.random() * 0.02 : 0.15 + Math.random() * 0.15
      }
      const particleGeometry = new THREE.BufferGeometry()
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const particleMaterial = new THREE.PointsMaterial({
        color: config.precip === 'snow' ? 0xffffff : isDark ? 0x88c0d0 : 0x4a90d9,
        size: config.precip === 'snow' ? 0.12 : 0.06,
        transparent: true,
        opacity: 0.8,
      })
      particles = new THREE.Points(particleGeometry, particleMaterial)
      scene.add(particles)
      disposables.push(particleGeometry, particleMaterial)
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frameId = null

    function tick() {
      frameId = requestAnimationFrame(tick)
      if (document.hidden) return

      sun.rotation.y += 0.002

      clouds.forEach(({ group, speed }) => {
        group.position.x += speed * 0.01
        if (group.position.x > 7) group.position.x = -7
      })

      if (particles) {
        const position = particles.geometry.attributes.position
        for (let i = 0; i < position.count; i += 1) {
          const idx = i * 3 + 1
          position.array[idx] -= velocities[i]
          if (config.precip === 'snow') {
            position.array[idx - 1] += Math.sin(position.array[idx] + i) * 0.01
          }
          if (position.array[idx] < -5) position.array[idx] = 5
        }
        position.needsUpdate = true
      }

      renderer.render(scene, camera)
    }

    if (reducedMotion) {
      renderer.render(scene, camera)
    } else {
      tick()
    }

    function handleResize() {
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (!w || !h) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [code, isDark])

  return <div ref={mountRef} className="weather-scene" aria-hidden="true" />
}

export default WeatherScene
