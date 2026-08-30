import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { sceneConfig } from '../lib/weather'

// Fondo animado en 3D a pantalla completa: sol/luna con resplandor, nubes
// volumétricas con parallax e iluminación real, estrellas de noche despejada
// y partículas de lluvia o nieve según el código WMO. Se degrada en silencio
// (no renderiza nada) si WebGL no está disponible.

// Textura radial usada como resplandor detrás del sol/luna.
function makeGlowTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)')
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.35)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

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
    scene.fog = new THREE.Fog(isDark ? 0x0b1220 : 0xbfe0f5, 10, 26)

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.position.set(0, 0, 10)

    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    mount.appendChild(renderer.domElement)

    const disposables = []
    const config = sceneConfig(code)

    // Iluminación: ambiental suave + direccional desde el sol/luna, pra que
    // las nubes tengan volumen real en vez de verse planas.
    const ambient = new THREE.AmbientLight(isDark ? 0x334166 : 0xffffff, isDark ? 0.6 : 0.85)
    scene.add(ambient)
    const sunLight = new THREE.DirectionalLight(isDark ? 0x8fa5d9 : 0xfff3d6, config.sun > 0 ? 1.3 : 0.6)
    sunLight.position.set(2.5, 2.2, 4)
    scene.add(sunLight)

    // Sol o luna con resplandor detrás.
    const sunGeometry = new THREE.SphereGeometry(1.1, 32, 32)
    const sunMaterial = new THREE.MeshStandardMaterial({
      color: isDark ? 0xe8edf5 : 0xffd166,
      emissive: isDark ? 0x8a93a8 : 0xffb703,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: config.sun,
    })
    const sun = new THREE.Mesh(sunGeometry, sunMaterial)
    sun.position.set(2.5, 2.2, -3)
    sun.visible = config.sun > 0
    scene.add(sun)
    disposables.push(sunGeometry, sunMaterial)

    const glowTexture = makeGlowTexture()
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: isDark ? 0xaeb9d9 : 0xffe1a3,
      transparent: true,
      opacity: config.sun * 0.9,
      depthWrite: false,
    })
    const glow = new THREE.Sprite(glowMaterial)
    glow.scale.set(5, 5, 1)
    glow.position.copy(sun.position)
    glow.visible = config.sun > 0
    scene.add(glow)
    disposables.push(glowTexture, glowMaterial)

    // Estrellas: solo de noche con cielo despejado.
    let stars = null
    if (isDark && config.clouds < 0.4) {
      const starCount = 200
      const starPositions = new Float32Array(starCount * 3)
      for (let i = 0; i < starCount; i += 1) {
        starPositions[i * 3] = (Math.random() - 0.5) * 20
        starPositions[i * 3 + 1] = Math.random() * 8
        starPositions[i * 3 + 2] = -5 - Math.random() * 5
      }
      const starGeometry = new THREE.BufferGeometry()
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
      const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.8 })
      stars = new THREE.Points(starGeometry, starMaterial)
      scene.add(stars)
      disposables.push(starGeometry, starMaterial)
    }

    // Nubes: grupos de esferas superpuestas con iluminación real, en capas
    // con distinta velocidad y profundidad pra dar parallax.
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: isDark ? 0x5c6a8a : 0xffffff,
      roughness: 0.9,
      transparent: true,
      opacity: config.storm ? 0.95 : 0.88,
    })
    disposables.push(cloudMaterial)

    function makeCloud(x, y, z, scale) {
      const group = new THREE.Group()
      const puffCount = 4 + Math.floor(Math.random() * 3)
      for (let i = 0; i < puffCount; i += 1) {
        const geometry = new THREE.SphereGeometry(0.45 + Math.random() * 0.3, 12, 12)
        const mesh = new THREE.Mesh(geometry, cloudMaterial)
        mesh.position.set((Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.4)
        group.add(mesh)
        disposables.push(geometry)
      }
      group.position.set(x, y, z)
      group.scale.setScalar(scale)
      scene.add(group)
      return group
    }

    const cloudCount = Math.round(config.clouds * 7)
    const clouds = []
    for (let i = 0; i < cloudCount; i += 1) {
      const layer = i % 3
      const x = (Math.random() - 0.5) * 14
      const y = 1.2 + Math.random() * 2 - layer * 0.3
      const z = -1 - layer * 1.8
      const scale = 0.8 + Math.random() * 0.7
      clouds.push({
        group: makeCloud(x, y, z, scale),
        speed: 0.35 + layer * 0.25 + Math.random() * 0.15,
        bobSpeed: 0.4 + Math.random() * 0.4,
        bobOffset: Math.random() * Math.PI * 2,
        baseY: y,
        // Las nubes más cercanas (layer 0) reaccionan más al scroll que las
        // del fondo (layer 2), simulando profundidad real.
        parallax: 0.0026 - layer * 0.0008,
      })
    }

    // Precipitación: nube de puntos que cae y se recicla al salir de cuadro.
    let particles = null
    let velocities = null
    if (config.precip) {
      const count = config.heavy ? 500 : 220
      const positions = new Float32Array(count * 3)
      velocities = new Float32Array(count)
      for (let i = 0; i < count; i += 1) {
        positions[i * 3] = (Math.random() - 0.5) * 16
        positions[i * 3 + 1] = Math.random() * 10 - 3
        positions[i * 3 + 2] = (Math.random() - 0.5) * 7
        velocities[i] = config.precip === 'snow' ? 0.025 + Math.random() * 0.025 : 0.2 + Math.random() * 0.2
      }
      const particleGeometry = new THREE.BufferGeometry()
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const particleMaterial = new THREE.PointsMaterial({
        color: config.precip === 'snow' ? 0xffffff : isDark ? 0x88c0d0 : 0x4a90d9,
        size: config.precip === 'snow' ? 0.12 : 0.07,
        transparent: true,
        opacity: 0.85,
      })
      particles = new THREE.Points(particleGeometry, particleMaterial)
      scene.add(particles)
      disposables.push(particleGeometry, particleMaterial)
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frameId = null
    let elapsed = 0

    function tick() {
      frameId = requestAnimationFrame(tick)
      if (document.hidden) return
      elapsed += 0.016

      sun.rotation.y += 0.0015
      glow.material.rotation += 0.0005

      const scrollY = window.scrollY || document.documentElement.scrollTop || 0

      // Leve deriva de cámara: sensación de profundidad y vida en la escena.
      camera.position.x = Math.sin(elapsed * 0.12) * 0.6
      camera.position.y = Math.cos(elapsed * 0.09) * 0.3 + scrollY * 0.0015
      camera.lookAt(0, 1, 0)

      clouds.forEach(({ group, speed, bobSpeed, bobOffset, baseY, parallax }) => {
        group.position.x += speed * 0.01
        if (group.position.x > 8) group.position.x = -8
        group.position.y = baseY + Math.sin(elapsed * bobSpeed + bobOffset) * 0.15 + scrollY * parallax
        group.rotation.z = Math.sin(elapsed * 0.2 + bobOffset) * 0.03
      })

      if (stars) stars.rotation.y += 0.0003

      if (particles) {
        const position = particles.geometry.attributes.position
        for (let i = 0; i < position.count; i += 1) {
          const idx = i * 3 + 1
          position.array[idx] -= velocities[i]
          if (config.precip === 'snow') {
            position.array[idx - 1] += Math.sin(position.array[idx] + i) * 0.012
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
