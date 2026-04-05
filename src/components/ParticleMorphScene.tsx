'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './ParticleMorphScene.module.css'

type Point3 = { x: number; y: number; z: number }

type ShapeDraw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

type Particle = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  baseAlpha: number
}

const TWO_PI = Math.PI * 2
const PARTICLE_COUNT = 2200
const GLOBE_RADIUS = 0.36
const REPULSE_RADIUS = 0.16
const REPULSE_STRENGTH = 0.012
const RETURN_STRENGTH = 0.028
const DAMPING = 0.84
const ROTATION_SPEED = 0.00105
const TILT = 0.22
const MAX_DPR = 2
const STAGE_MS = 4200
const STAGE_LABELS = [
  'Personal Identity',
  'Infrastructure',
  'Flow',
  'Scale',
  'Intelligence',
] as const

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeInOutQuint(t: number) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2
}

function fibonacciSphere(n: number): [number, number, number][] {
  const pts: [number, number, number][] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    pts.push([Math.cos(theta) * r, y, Math.sin(theta) * r])
  }
  return pts
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function qbez(
  x0: number, y0: number,
  cx: number, cy: number,
  x1: number, y1: number,
  n: number,
) {
  if (n <= 1) return [[x0, y0] as const]
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    const u = 1 - t
    return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1] as const
  })
}

function cbez(
  x0: number, y0: number,
  c1x: number, c1y: number,
  c2x: number, c2y: number,
  x1: number, y1: number,
  n: number,
) {
  if (n <= 1) return [[x0, y0] as const]
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    const u = 1 - t
    return [
      u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x1,
      u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y1,
    ] as const
  })
}

function drawIdentity(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5
  const cy = h * 0.42
  ctx.beginPath()
  ctx.ellipse(cx, cy - h * 0.06, w * 0.11, h * 0.15, 0, 0, Math.PI * 2)
  ctx.fill()
  roundRect(ctx, cx - w * 0.15, cy + h * 0.12, w * 0.3, h * 0.14, 52)
  ctx.fill()
  ctx.save()
  ctx.globalAlpha = 0.32
  ctx.lineWidth = Math.max(5, w * 0.014)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.045, cy - h * 0.01)
  ctx.bezierCurveTo(cx - w * 0.01, cy - h * 0.065, cx + w * 0.025, cy - h * 0.065, cx + w * 0.058, cy - h * 0.01)
  ctx.stroke()
  ctx.restore()
}

function drawInfrastructure(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5
  const cy = h * 0.43
  const width = w * 0.36
  const height = h * 0.28
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(4, w * 0.013)
  roundRect(ctx, cx - width * 0.5, cy - height * 0.44, width, height, 34)
  ctx.stroke()
  const nodes = [
    [cx - width * 0.33, cy - height * 0.12],
    [cx, cy - height * 0.28],
    [cx + width * 0.33, cy - height * 0.12],
    [cx - width * 0.2, cy + height * 0.17],
    [cx + width * 0.2, cy + height * 0.17],
    [cx, cy + height * 0.04],
  ] as const
  ctx.save()
  ctx.globalAlpha = 0.22
  ctx.lineWidth = Math.max(2, w * 0.007)
  ctx.beginPath()
  ctx.moveTo(nodes[0][0], nodes[0][1])
  ctx.lineTo(nodes[5][0], nodes[5][1])
  ctx.lineTo(nodes[2][0], nodes[2][1])
  ctx.moveTo(nodes[1][0], nodes[1][1])
  ctx.lineTo(nodes[4][0], nodes[4][1])
  ctx.stroke()
  ctx.restore()
  for (const [x, y] of nodes) {
    ctx.beginPath()
    ctx.arc(x, y, Math.max(6, w * 0.01), 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawFlow(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5
  const cy = h * 0.43
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(7, w * 0.022)
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.24, cy + h * 0.05)
  ctx.bezierCurveTo(cx - w * 0.12, cy - h * 0.18, cx + w * 0.1, cy - h * 0.18, cx + w * 0.24, cy + h * 0.02)
  ctx.stroke()
  ctx.save()
  ctx.globalAlpha = 0.24
  ctx.lineWidth = Math.max(3, w * 0.01)
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.2, cy + h * 0.08)
  ctx.bezierCurveTo(cx - w * 0.04, cy - h * 0.06, cx + w * 0.06, cy - h * 0.06, cx + w * 0.2, cy + h * 0.07)
  ctx.stroke()
  ctx.restore()
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.26, cy + h * 0.15)
  ctx.bezierCurveTo(cx - w * 0.08, cy + h * 0.04, cx + w * 0.08, cy + h * 0.02, cx + w * 0.26, cy + h * 0.15)
  ctx.stroke()
  ctx.restore()
}

function drawScale(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5
  const cy = h * 0.4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(5, w * 0.014)
  roundRect(ctx, cx - w * 0.2, cy + h * 0.1, w * 0.4, h * 0.08, 24)
  ctx.fill()
  roundRect(ctx, cx - w * 0.15, cy - h * 0.03, w * 0.3, h * 0.09, 22)
  ctx.fill()
  roundRect(ctx, cx - w * 0.095, cy - h * 0.16, w * 0.19, h * 0.07, 18)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy - h * 0.29, Math.max(18, w * 0.028), 0, Math.PI * 2)
  ctx.fill()
}

function drawIntelligence(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5
  const cy = h * 0.42
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(4, w * 0.012)
  ctx.beginPath()
  ctx.arc(cx, cy, Math.min(w, h) * 0.14, 0, Math.PI * 2)
  ctx.stroke()
  const satellites = [
    [cx - w * 0.16, cy - h * 0.08],
    [cx + w * 0.15, cy - h * 0.1],
    [cx - w * 0.12, cy + h * 0.12],
    [cx + w * 0.19, cy + h * 0.06],
    [cx, cy - h * 0.2],
  ] as const
  ctx.save()
  ctx.globalAlpha = 0.22
  ctx.lineWidth = Math.max(2, w * 0.007)
  for (const [x, y] of satellites) {
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  ctx.restore()
  for (const [x, y] of satellites) {
    ctx.beginPath()
    ctx.arc(x, y, Math.max(7, w * 0.011), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.save()
  ctx.globalAlpha = 0.2
  ctx.beginPath()
  ctx.arc(cx, cy, Math.min(w, h) * 0.05, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

const SHAPE_DRAWS: readonly [ShapeDraw, ShapeDraw, ShapeDraw, ShapeDraw, ShapeDraw] = [
  drawIdentity,
  drawInfrastructure,
  drawFlow,
  drawScale,
  drawIntelligence,
]

function sampleShape(draw: ShapeDraw): Point3[] {
  const canvas = document.createElement('canvas')
  const w = 1200
  const h = 840
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return Array.from({ length: PARTICLE_COUNT }, () => ({ x: 0, y: 0, z: 0 }))

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#fff'
  draw(ctx, w, h)

  const data = ctx.getImageData(0, 0, w, h).data
  const points: Point3[] = []
  for (let y = 0; y < h; y += 4) {
    for (let x = 0; x < w; x += 4) {
      const alpha = data[(y * w + x) * 4 + 3]
      if (alpha > 12) {
        const nx = (x / w - 0.5) * 2
        const ny = (0.5 - y / h) * 2
        const radial = Math.sqrt(nx * nx + ny * ny)
        const nz = (1 - clamp(radial, 0, 1)) * 0.55 - 0.25
        points.push({ x: nx, y: ny, z: nz })
      }
    }
  }

  return resamplePoints(points, PARTICLE_COUNT)
}

function resamplePoints(points: Point3[], count: number) {
  if (points.length === 0) return Array.from({ length: count }, () => ({ x: 0, y: 0, z: 0 }))
  if (points.length === 1) return Array.from({ length: count }, () => ({ ...points[0] }))

  return Array.from({ length: count }, (_, i) => {
    const t = (i / (count - 1)) * (points.length - 1)
    const lo = Math.floor(t)
    const hi = Math.min(lo + 1, points.length - 1)
    const f = t - lo
    return {
      x: lerp(points[lo].x, points[hi].x, f),
      y: lerp(points[lo].y, points[hi].y, f),
      z: lerp(points[lo].z, points[hi].z, f),
    }
  })
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
  const fov = 900
  const scale = fov / (fov + z)
  return { sx: cx + x * scale, sy: cy + y * scale, scale }
}

export default function ParticleMorphScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef(0)
  const stageRef = useRef(0)
  const stateRef = useRef({ angle: 0, mouse: { x: -9999, y: -9999 }, particles: [] as Particle[] })
  const shapesRef = useRef<Point3[][]>([])
  const [stageLabel, setStageLabel] = useState<typeof STAGE_LABELS[number]>(STAGE_LABELS[0])

  const label = useMemo(() => stageLabel, [stageLabel])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const shapes = SHAPE_DRAWS.map((draw) => sampleShape(draw))
    shapesRef.current = shapes

    stateRef.current.particles = fibonacciSphere(PARTICLE_COUNT).map(([px, py, pz], i) => ({
      x: px * GLOBE_RADIUS,
      y: py * GLOBE_RADIUS,
      z: pz * GLOBE_RADIUS,
      vx: 0,
      vy: 0,
      vz: 0,
      size: 0.85 + (i % 7) * 0.12,
      baseAlpha: 0.5 + Math.random() * 0.45,
    }))

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect()
      stateRef.current.mouse.x = e.clientX - rect.left
      stateRef.current.mouse.y = e.clientY - rect.top
    }

    const onLeave = () => {
      stateRef.current.mouse.x = -9999
      stateRef.current.mouse.y = -9999
    }

    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = wrap.getBoundingClientRect()
        stateRef.current.mouse.x = e.touches[0].clientX - rect.left
        stateRef.current.mouse.y = e.touches[0].clientY - rect.top
      }
    }

    const onTouchEnd = () => {
      stateRef.current.mouse.x = -9999
      stateRef.current.mouse.y = -9999
    }

    const onResize = () => resize()

    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    const tick = (now: number) => {
      const rect = wrap.getBoundingClientRect()
      const W = rect.width
      const H = rect.height
      const cx = W / 2
      const cy = H / 2
      const state = stateRef.current
      const particles = state.particles
      const shapesNow = shapesRef.current

      const loop = (now / STAGE_MS) % STAGE_LABELS.length
      const stage = Math.floor(loop) % STAGE_LABELS.length
      const nextStage = (stage + 1) % STAGE_LABELS.length
      const t = easeInOutQuint(loop - Math.floor(loop))

      if (stageRef.current !== stage) {
        stageRef.current = stage
        setStageLabel(STAGE_LABELS[stage])
      }

      const fromShape = shapesNow[stage] ?? shapesNow[0]
      const toShape = shapesNow[nextStage] ?? shapesNow[0]

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, W, H)

      const glow = ctx.createRadialGradient(cx, cy * 0.92, H * 0.05, cx, cy * 0.92, Math.max(W, H) * 0.72)
      glow.addColorStop(0, 'rgba(247, 244, 238, 0.055)')
      glow.addColorStop(0.38, 'rgba(247, 244, 238, 0.02)')
      glow.addColorStop(1, 'rgba(247, 244, 238, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)

      state.angle += ROTATION_SPEED
      const mx = state.mouse.x
      const my = state.mouse.y
      const repR = Math.min(W, H) * REPULSE_RADIUS

      ctx.fillStyle = '#f0ece4'
      ctx.shadowColor = 'rgba(240, 236, 228, 0.24)'
      ctx.shadowBlur = 12

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const a = fromShape[i]
        const b = toShape[i]
        const stagger = (i % 97) / 97 * 0.12
        const localT = clamp((t - stagger) / (1 - stagger), 0, 1)
        const eased = easeInOutQuint(localT)

        const tx = lerp(a.x, b.x, eased) * Math.min(W, H) * GLOBE_RADIUS
        const ty = lerp(a.y, b.y, eased) * Math.min(W, H) * GLOBE_RADIUS
        const tz = lerp(a.z, b.z, eased) * Math.min(W, H) * GLOBE_RADIUS

        p.vx += (tx - p.x) * RETURN_STRENGTH
        p.vy += (ty - p.y) * RETURN_STRENGTH
        p.vz += (tz - p.z) * RETURN_STRENGTH

        const { rx: ox2, rz: oz2 } = rotY(p.x, p.z, state.angle)
        const { ry: oy2, rz: oz3 } = rotX(p.y, oz2, TILT)
        const proj = project(ox2, oy2, oz3, cx, cy)
        const dx = proj.sx - mx
        const dy = proj.sy - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < repR) {
          const force = (1 - dist / repR) * REPULSE_STRENGTH
          const safe = Math.max(0.0001, dist)
          p.vx += (dx / safe) * force * Math.min(W, H) * 0.24
          p.vy += (dy / safe) * force * Math.min(W, H) * 0.24
        }

        p.vx *= DAMPING
        p.vy *= DAMPING
        p.vz *= DAMPING
        p.x += p.vx * 0.016 * 60
        p.y += p.vy * 0.016 * 60
        p.z += p.vz * 0.016 * 60

        const { rx, rz: rz1 } = rotY(p.x, p.z, state.angle)
        const { ry, rz: rz2 } = rotX(p.y, rz1, TILT)
        const { sx, sy, scale } = project(rx, ry, rz2, cx, cy)

        const depthT = clamp((rz2 / (Math.min(W, H) * GLOBE_RADIUS) + 1) * 0.5, 0, 1)
        const alpha = p.baseAlpha * (0.18 + depthT * 0.84)
        const sz = p.size * scale * (0.58 + depthT * 0.7)
        const proximity = Math.max(0, 1 - dist / (repR * 1.75))
        const glowAlpha = alpha + proximity * 0.55

        ctx.beginPath()
        ctx.arc(sx, sy, Math.max(0.3, sz), 0, TWO_PI)
        ctx.fillStyle = proximity > 0.05 ? `rgba(247, 244, 238, ${glowAlpha})` : `rgba(247, 244, 238, ${alpha})`
        ctx.fill()
      }

      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <div ref={wrapRef} className={styles.sceneWrap}>
      <canvas ref={canvasRef} className={styles.canvas} aria-label="Morphing particle system" />
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.sheen} aria-hidden="true" />
      <div className={styles.copy} aria-hidden="true">
        <p className={styles.kicker}>Mauri HQ distribution layer</p>
        <h1 className={styles.title}>One supercharged particle system.</h1>
        <p className={styles.dek}>A globe-derived canvas morphing through identity, infrastructure, flow, scale, and intelligence.</p>
      </div>
      <div className={styles.badge} aria-hidden="true">
        <span>{label}</span>
      </div>
    </div>
  )
}
