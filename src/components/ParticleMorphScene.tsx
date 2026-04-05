'use client'

import { useEffect, useMemo, useRef } from 'react'
import styles from './ParticleMorphScene.module.css'

type Point = { x: number; y: number }

type ShapeDraw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

type Props = {
  stage: number
  stageLabels: readonly [string, string, string, string, string]
}

const MAX_DPR = 2
const SAMPLE_W = 1200
const SAMPLE_H = 840
const SAMPLE_STEP = 4
const PARTICLE_COUNT = 16000

const STAGE_COUNT = 5

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

function easeInOutQuint(t: number) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2
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

function drawIdentity(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5
  const cy = h * 0.43

  ctx.beginPath()
  ctx.ellipse(cx, cy - h * 0.04, w * 0.118, h * 0.155, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.save()
  ctx.globalAlpha = 0.92
  roundRect(ctx, cx - w * 0.16, cy + h * 0.12, w * 0.32, h * 0.16, 56)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = 0.34
  ctx.lineWidth = Math.max(6, w * 0.018)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.05, cy - h * 0.015)
  ctx.bezierCurveTo(cx - w * 0.012, cy - h * 0.08, cx + w * 0.026, cy - h * 0.08, cx + w * 0.062, cy - h * 0.012)
  ctx.stroke()
  ctx.restore()
}

function drawInfrastructure(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5
  const cy = h * 0.43
  const width = w * 0.34
  const height = h * 0.28
  const cols = 5
  const rows = 4

  ctx.save()
  ctx.lineWidth = Math.max(4, w * 0.012)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  roundRect(ctx, cx - width * 0.5, cy - height * 0.42, width, height, 34)
  ctx.stroke()

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const px = cx - width * 0.38 + (c / (cols - 1)) * width * 0.76
      const py = cy - height * 0.29 + (r / (rows - 1)) * height * 0.62
      ctx.beginPath()
      ctx.arc(px, py, Math.max(4, w * 0.007), 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.globalAlpha = 0.22
  ctx.lineWidth = Math.max(2, w * 0.006)
  ctx.beginPath()
  ctx.moveTo(cx - width * 0.32, cy - height * 0.03)
  ctx.lineTo(cx + width * 0.32, cy - height * 0.03)
  ctx.moveTo(cx - width * 0.18, cy - height * 0.18)
  ctx.lineTo(cx - width * 0.18, cy + height * 0.18)
  ctx.moveTo(cx + width * 0.18, cy - height * 0.18)
  ctx.lineTo(cx + width * 0.18, cy + height * 0.18)
  ctx.stroke()

  ctx.restore()

  ctx.save()
  ctx.globalAlpha = 0.18
  roundRect(ctx, cx - w * 0.22, cy + h * 0.16, w * 0.44, h * 0.036, 24)
  ctx.fill()
  ctx.restore()
}

function drawFlow(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5
  const cy = h * 0.43

  ctx.lineWidth = Math.max(8, w * 0.022)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(cx - w * 0.24, cy + h * 0.04)
  ctx.bezierCurveTo(cx - w * 0.12, cy - h * 0.2, cx + w * 0.08, cy - h * 0.2, cx + w * 0.24, cy + h * 0.02)
  ctx.stroke()

  ctx.save()
  ctx.globalAlpha = 0.34
  ctx.lineWidth = Math.max(4, w * 0.011)
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.2, cy + h * 0.08)
  ctx.bezierCurveTo(cx - w * 0.06, cy - h * 0.05, cx + w * 0.08, cy - h * 0.05, cx + w * 0.2, cy + h * 0.06)
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = 0.2
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.26, cy + h * 0.14)
  ctx.bezierCurveTo(cx - w * 0.08, cy + h * 0.04, cx + w * 0.06, cy + h * 0.02, cx + w * 0.26, cy + h * 0.14)
  ctx.stroke()
  ctx.restore()
}

function drawScale(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5
  const cy = h * 0.4

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(5, w * 0.015)

  roundRect(ctx, cx - w * 0.22, cy + h * 0.09, w * 0.44, h * 0.09, 26)
  ctx.fill()
  roundRect(ctx, cx - w * 0.16, cy - h * 0.04, w * 0.32, h * 0.1, 24)
  ctx.fill()
  roundRect(ctx, cx - w * 0.1, cy - h * 0.18, w * 0.2, h * 0.08, 20)
  ctx.fill()
  roundRect(ctx, cx - w * 0.05, cy - h * 0.31, w * 0.1, h * 0.055, 16)
  ctx.fill()

  ctx.save()
  ctx.globalAlpha = 0.2
  ctx.lineWidth = Math.max(2, w * 0.008)
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.24, cy + h * 0.12)
  ctx.lineTo(cx + w * 0.24, cy + h * 0.12)
  ctx.moveTo(cx - w * 0.18, cy + h * 0.0)
  ctx.lineTo(cx + w * 0.18, cy + h * 0.0)
  ctx.stroke()
  ctx.restore()

  ctx.beginPath()
  ctx.arc(cx, cy - h * 0.37, Math.max(20, w * 0.03), 0, Math.PI * 2)
  ctx.fill()
}

function drawIntelligence(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5
  const cy = h * 0.42
  const radius = Math.min(w, h) * 0.14

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(4, w * 0.012)

  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()

  const satellites = [
    [cx - w * 0.17, cy - h * 0.08],
    [cx + w * 0.15, cy - h * 0.1],
    [cx - w * 0.12, cy + h * 0.12],
    [cx + w * 0.2, cy + h * 0.06],
    [cx, cy - h * 0.2],
  ] as const

  ctx.save()
  ctx.globalAlpha = 0.28
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
  ctx.globalAlpha = 0.22
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

const drawFns: ShapeDraw[] = [
  drawIdentity,
  drawInfrastructure,
  drawFlow,
  drawScale,
  drawIntelligence,
]

function sampleShape(draw: ShapeDraw): Point[] {
  const canvas = document.createElement('canvas')
  canvas.width = SAMPLE_W
  canvas.height = SAMPLE_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return Array.from({ length: PARTICLE_COUNT }, () => ({ x: 0.5, y: 0.5 }))

  ctx.clearRect(0, 0, SAMPLE_W, SAMPLE_H)
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#fff'
  draw(ctx, SAMPLE_W, SAMPLE_H)

  const data = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data
  const points: Point[] = []
  for (let y = 0; y < SAMPLE_H; y += SAMPLE_STEP) {
    for (let x = 0; x < SAMPLE_W; x += SAMPLE_STEP) {
      const alpha = data[(y * SAMPLE_W + x) * 4 + 3]
      if (alpha > 12) points.push({ x: x / SAMPLE_W, y: y / SAMPLE_H })
    }
  }
  return points
}

function resamplePoints(points: Point[], count: number) {
  if (points.length === 0) return Array.from({ length: count }, () => ({ x: 0.5, y: 0.5 }))
  if (points.length === 1) return Array.from({ length: count }, () => ({ ...points[0] }))

  return Array.from({ length: count }, (_, i) => {
    const t = (i / (count - 1)) * (points.length - 1)
    const lo = Math.floor(t)
    const hi = Math.min(lo + 1, points.length - 1)
    const f = t - lo
    return {
      x: lerp(points[lo].x, points[hi].x, f),
      y: lerp(points[lo].y, points[hi].y, f),
    }
  })
}

function buildShapes() {
  return drawFns.map((draw) => resamplePoints(sampleShape(draw), PARTICLE_COUNT))
}

type Particle = {
  ampX: number
  ampY: number
  freqX: number
  freqY: number
  phaseX: number
  phaseY: number
  size: number
  sparkle: number
  drift: number
}

export default function ParticleMorphScene({ stage, stageLabels }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const shapesRef = useRef<Point[][]>([])
  const stageRef = useRef(0)
  const targetStageRef = useRef(stage)
  const transitionRef = useRef({ start: performance.now(), duration: 2.2, from: 0, to: stage })

  const stageLabel = useMemo(() => stageLabels[stage] ?? stageLabels[0], [stage, stageLabels])

  useEffect(() => {
    targetStageRef.current = clamp(stage, 0, STAGE_COUNT - 1)
  }, [stage])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    shapesRef.current = buildShapes()

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      ampX: 0.0018 + Math.random() * 0.0065,
      ampY: 0.0024 + Math.random() * 0.008,
      freqX: 0.1 + Math.random() * 0.19,
      freqY: 0.08 + Math.random() * 0.17,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      size: 0.45 + (i % 12) * 0.07 + Math.random() * 0.18,
      sparkle: Math.random(),
      drift: Math.random(),
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
    window.addEventListener('resize', resize)

    const tick = (now: number) => {
      const rect = wrap.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const particles = particlesRef.current
      const shapes = shapesRef.current
      const currentStage = stageRef.current
      const desiredStage = targetStageRef.current

      if (desiredStage !== currentStage) {
        transitionRef.current = {
          start: now,
          duration: 2.25,
          from: currentStage,
          to: desiredStage,
        }
        stageRef.current = desiredStage
      }

      const transition = transitionRef.current
      const progress = clamp((now - transition.start) / (transition.duration * 1000), 0, 1)
      const eased = easeInOutQuint(progress)
      const fromShape = shapes[transition.from] ?? shapes[0]
      const toShape = shapes[transition.to] ?? shapes[shapes.length - 1]

      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, width, height)

      const vignette = ctx.createRadialGradient(width * 0.5, height * 0.44, height * 0.06, width * 0.5, height * 0.44, Math.max(width, height) * 0.78)
      vignette.addColorStop(0, 'rgba(247, 244, 238, 0.05)')
      vignette.addColorStop(0.35, 'rgba(247, 244, 238, 0.02)')
      vignette.addColorStop(1, 'rgba(247, 244, 238, 0)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, width, height)

      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = '#f7f4ee'
      ctx.shadowColor = 'rgba(247, 244, 238, 0.28)'
      ctx.shadowBlur = 14

      const scale = Math.min(width * 0.88, height * 0.76)
      const ox = width * 0.5
      const oy = height * 0.5 + (Math.sin(now * 0.0004) * 12)
      const morphNoise = Math.sin(now * 0.0007) * 0.016

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]
        const a = fromShape[i]
        const b = toShape[i]
        const t = smoothstep(clamp((eased - particle.drift * 0.12) / (1 - particle.drift * 0.12), 0, 1))

        const mixX = lerp(a.x, b.x, t)
        const mixY = lerp(a.y, b.y, t)
        const orbital = Math.sin(now * 0.001 * particle.freqX * Math.PI * 2 + particle.phaseX) * particle.ampX
        const shimmer = Math.sin(now * 0.0011 * particle.freqY * Math.PI * 2 + particle.phaseY) * particle.ampY
        const swell = Math.sin(now * 0.00046 + particle.phaseX * 0.5) * morphNoise
        const x = (mixX + orbital + swell) * scale + ox - scale * 0.5
        const y = (mixY + shimmer + swell * 0.7) * scale + oy - scale * 0.5
        const size = particle.size * (1 + particle.sparkle * 0.6)
        const alpha = 0.15 + size * 0.08 + (particle.sparkle * 0.2)

        ctx.globalAlpha = clamp(alpha, 0.08, 0.42)
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()

        if (particle.sparkle > 0.88) {
          ctx.globalAlpha = 0.08 + particle.sparkle * 0.08
          ctx.beginPath()
          ctx.arc(x, y, size * 2.8, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div ref={wrapRef} className={styles.sceneWrap}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.sheen} aria-hidden="true" />
      <div className={styles.badge} aria-hidden="true">
        <span>{stageLabel}</span>
      </div>
    </div>
  )
}
