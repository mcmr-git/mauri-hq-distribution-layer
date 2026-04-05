'use client'

import { useEffect, useRef } from 'react'
import styles from './ParticleGlobe.module.css'

interface Particle {
  ox: number
  oy: number
  oz: number
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  baseAlpha: number
  seed: number
}

interface Projection {
  sx: number
  sy: number
  scale: number
  depth: number
}

const TWO_PI = Math.PI * 2
const GRID_X = 11
const GRID_Y = 10
const GRID_Z = 20
const PARTICLE_COUNT = GRID_X * GRID_Y * GRID_Z
const LATTICE_RADIUS_X = 0.4
const LATTICE_RADIUS_Y = 0.28
const LATTICE_RADIUS_Z = 0.4
const NODE_SPACING = 1
const REPULSE_RADIUS = 0.13
const REPULSE_STRENGTH = 0.017
const RETURN_STRENGTH = 0.038
const DAMPING = 0.83
const ROTATION_SPEED = 0.00115
const TILT = 0.24
const LATTICE_WAVE = 0.018

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function rotY(x: number, z: number, a: number) {
  return {
    rx: x * Math.cos(a) - z * Math.sin(a),
    rz: x * Math.sin(a) + z * Math.cos(a),
  }
}

function rotX(y: number, z: number, a: number) {
  return {
    ry: y * Math.cos(a) - z * Math.sin(a),
    rz: y * Math.sin(a) + z * Math.cos(a),
  }
}

function project(x: number, y: number, z: number, cx: number, cy: number) {
  const fov = 920
  const scale = fov / (fov + z)
  return { sx: cx + x * scale, sy: cy + y * scale, scale, depth: z }
}

export default function ParticleGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    angle: 0,
    mouse: { x: -9999, y: -9999 },
    particles: [] as Particle[],
    raf: 0,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const state = stateRef.current

    const buildParticles = () => {
      const W = window.innerWidth
      const H = window.innerHeight
      const R = Math.min(W, H)
      const particles: Particle[] = []

      for (let zi = 0; zi < GRID_Z; zi++) {
        for (let yi = 0; yi < GRID_Y; yi++) {
          for (let xi = 0; xi < GRID_X; xi++) {
            const nx = xi / (GRID_X - 1) - 0.5
            const ny = yi / (GRID_Y - 1) - 0.5
            const nz = zi / (GRID_Z - 1) - 0.5
            const rowShift = yi % 2 === 0 ? 0.018 : -0.018
            const layerShift = zi % 2 === 0 ? 0.016 : -0.016
            const bandShift = xi % 2 === 0 ? 0.012 : -0.012
            const warp = Math.sin((xi + yi * 1.7 + zi * 0.8) * 0.7) * 0.01
            const ox = (nx + rowShift + warp) * R * LATTICE_RADIUS_X
            const oy = (ny + layerShift - warp * 0.6) * R * LATTICE_RADIUS_Y
            const oz = (nz + bandShift + warp * 0.8) * R * LATTICE_RADIUS_Z

            particles.push({
              ox,
              oy,
              oz,
              x: ox,
              y: oy,
              z: oz,
              vx: 0,
              vy: 0,
              vz: 0,
              size: 0.8 + (1 - Math.abs(ny)) * 0.52 + Math.random() * 0.4,
              baseAlpha: 0.42 + Math.random() * 0.48,
              seed: Math.random() * Math.PI * 2,
            })
          }
        }
      }

      state.particles = particles
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildParticles()
    }

    const draw = () => {
      const W = window.innerWidth
      const H = window.innerHeight
      const cx = W / 2
      const cy = H / 2
      const minSide = Math.min(W, H)
      const mx = state.mouse.x
      const my = state.mouse.y
      const repR = minSide * REPULSE_RADIUS

      ctx.clearRect(0, 0, W, H)
      state.angle += ROTATION_SPEED

      const particles = state.particles
      const projections: Projection[] = new Array(particles.length)

      ctx.save()
      ctx.fillStyle = '#f0ece4'
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const { rx: tx0, rz: tz0 } = rotY(p.ox, p.oz, state.angle)
        const { ry: ty0, rz: tz1 } = rotX(p.oy, tz0, TILT)

        const wave = Math.sin(state.angle * 1.55 + p.seed + p.ox * 0.02 + p.oy * 0.03 + p.oz * 0.025)
        const twist = Math.cos(state.angle * 1.2 + p.seed * 0.7 + p.oy * 0.02)
        const tx = tx0 + wave * minSide * LATTICE_WAVE
        const ty = ty0 + twist * minSide * LATTICE_WAVE * 0.72
        const tz = tz1 + Math.sin(state.angle * 1.1 + p.seed) * minSide * LATTICE_WAVE * 0.55

        const projTarget = project(tx, ty, tz, cx, cy)
        const dx = projTarget.sx - mx
        const dy = projTarget.sy - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < repR) {
          const force = (1 - dist / repR) * REPULSE_STRENGTH
          const safe = Math.max(0.0001, dist)
          p.vx += (dx / safe) * force * minSide * 0.26
          p.vy += (dy / safe) * force * minSide * 0.26
          p.vz += ((wave + twist) * 0.5) * force * minSide * 0.08
        }

        p.vx += (tx - p.x) * RETURN_STRENGTH
        p.vy += (ty - p.y) * RETURN_STRENGTH
        p.vz += (tz - p.z) * RETURN_STRENGTH

        p.vx *= DAMPING
        p.vy *= DAMPING
        p.vz *= DAMPING
        p.x += p.vx * 0.016 * 60
        p.y += p.vy * 0.016 * 60
        p.z += p.vz * 0.016 * 60

        const proj = project(p.x, p.y, p.z, cx, cy)
        projections[i] = proj
      }

      // draw lattice mesh first
      for (let zi = 0; zi < GRID_Z; zi++) {
        for (let yi = 0; yi < GRID_Y; yi++) {
          for (let xi = 0; xi < GRID_X; xi++) {
            const index = xi + GRID_X * (yi + GRID_Y * zi)
            const a = projections[index]
            if (!a) continue

            const links: number[] = []
            if (xi < GRID_X - 1) links.push(index + 1)
            if (yi < GRID_Y - 1) links.push(index + GRID_X)
            if (zi < GRID_Z - 1) links.push(index + GRID_X * GRID_Y)
            if ((xi + yi + zi) % 3 === 0 && xi < GRID_X - 1 && yi < GRID_Y - 1) {
              links.push(index + 1 + GRID_X)
            }

            for (const linkIndex of links) {
              const b = projections[linkIndex]
              if (!b) continue
              const depthMix = clamp((a.depth + b.depth) / (minSide * LATTICE_RADIUS_Z * 1.8) * 0.5 + 0.5, 0, 1)
              const mouseMix = clamp(
                1 - Math.min(
                  Math.hypot(a.sx - mx, a.sy - my),
                  Math.hypot(b.sx - mx, b.sy - my),
                ) / (repR * 2.2),
                0,
                1,
              )
              ctx.globalAlpha = 0.03 + depthMix * 0.12 + mouseMix * 0.09
              ctx.lineWidth = 0.45 + depthMix * 0.45
              ctx.beginPath()
              ctx.moveTo(a.sx, a.sy)
              ctx.lineTo(b.sx, b.sy)
              ctx.stroke()
            }
          }
        }
      }

      // draw nodes back-to-front
      const sorted = particles
        .map((particle, index) => ({ particle, index }))
        .sort((a, b) => projections[a.index].depth - projections[b.index].depth)

      for (const item of sorted) {
        const proj = projections[item.index]
        const p = item.particle
        const depthT = clamp((proj.depth / (minSide * LATTICE_RADIUS_Z) + 1) * 0.5, 0, 1)
        const alpha = p.baseAlpha * (0.2 + depthT * 0.86)
        const proximity = Math.max(0, 1 - Math.hypot(proj.sx - mx, proj.sy - my) / (repR * 1.9))
        const glowAlpha = alpha + proximity * 0.45
        const sz = p.size * proj.scale * (0.56 + depthT * 0.64)

        ctx.beginPath()
        ctx.arc(proj.sx, proj.sy, Math.max(0.28, sz), 0, TWO_PI)
        ctx.fillStyle = proximity > 0.05
          ? `rgba(255, 255, 255, ${glowAlpha})`
          : `rgba(255, 255, 255, ${alpha})`
        ctx.fill()
      }

      ctx.globalAlpha = 1
      ctx.restore()
      state.raf = requestAnimationFrame(draw)
    }

    const onMove = (e: MouseEvent) => {
      state.mouse.x = e.clientX
      state.mouse.y = e.clientY
    }
    const onLeave = () => {
      state.mouse.x = -9999
      state.mouse.y = -9999
    }
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        state.mouse.x = e.touches[0].clientX
        state.mouse.y = e.touches[0].clientY
      }
    }
    const onTouchEnd = () => {
      state.mouse.x = -9999
      state.mouse.y = -9999
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    state.raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(state.raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-label="Interactive particle globe" />
}
