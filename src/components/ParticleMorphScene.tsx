'use client'

import { useEffect, useMemo, useRef } from 'react'
import styles from './ParticleMorphScene.module.css'

type Point = { x: number; y: number }
type MorphMode = 'thesis' | 'triad'
type ShapeDraw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

type Props = {
  mode: MorphMode
  stage: number
  stageLabels: readonly [string, string] | readonly [string, string, string]
}

const MAX_DPR = 2
const SAMPLE_W = 960
const SAMPLE_H = 640
const SAMPLE_STEP = 5
const BASE_PARTICLES = 760

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
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
  ctx.ellipse(cx, cy - h * 0.02, w * 0.122, h * 0.17, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.save()
  ctx.globalAlpha = 0.94
  roundRect(ctx, cx - w * 0.158, cy + h * 0.14, w * 0.316, h * 0.16, 54)
  ctx.fill()
  ctx.restore()
  ctx.save()
  ctx.globalAlpha = 0.24
  ctx.lineWidth = Math.max(6, w * 0.018)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.055, cy - h * 0.015)
  ctx.bezierCurveTo(cx - w * 0.012, cy - h * 0.075, cx + w * 0.028, cy - h * 0.075, cx + w * 0.064, cy - h * 0.012)
  ctx.stroke()
  ctx.restore()
}

function drawDistribution(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5
  const cy = h * 0.42
  ctx.lineWidth = Math.max(6, w * 0.016)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.17, cy - h * 0.04)
  ctx.lineTo(cx, cy - h * 0.12)
  ctx.lineTo(cx + w * 0.17, cy - h * 0.04)
  ctx.lineTo(cx + w * 0.12, cy + h * 0.12)
  ctx.lineTo(cx - w * 0.12, cy + h * 0.12)
  ctx.closePath()
  ctx.stroke()
  const nodes: readonly [number, number][] = [
    [cx - w * 0.17, cy - h * 0.04],
    [cx, cy - h * 0.12],
    [cx + w * 0.17, cy - h * 0.04],
    [cx + w * 0.12, cy + h * 0.12],
    [cx - w * 0.12, cy + h * 0.12],
    [cx, cy + h * 0.02],
  ]
  ctx.save()
  ctx.globalAlpha = 0.22
  ctx.lineWidth = Math.max(2, w * 0.008)
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
    ctx.arc(x, y, Math.max(8, w * 0.012), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.save()
  ctx.globalAlpha = 0.16
  roundRect(ctx, cx - w * 0.23, cy + h * 0.16, w * 0.46, h * 0.036, 24)
  ctx.fill()
  ctx.restore()
}

function drawFlow(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5
  const cy = h * 0.43
  ctx.lineWidth = Math.max(7, w * 0.022)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.22, cy + h * 0.04)
  ctx.bezierCurveTo(cx - w * 0.12, cy - h * 0.18, cx + w * 0.08, cy - h * 0.18, cx + w * 0.22, cy + h * 0.02)
  ctx.stroke()
  ctx.save()
  ctx.globalAlpha = 0.26
  ctx.lineWidth = Math.max(3, w * 0.01)
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.18, cy + h * 0.07)
  ctx.bezierCurveTo(cx - w * 0.05, cy - h * 0.06, cx + w * 0.07, cy - h * 0.06, cx + w * 0.18, cy + h * 0.06)
  ctx.stroke()
  ctx.restore()
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.25, cy + h * 0.12)
  ctx.bezierCurveTo(cx - w * 0.08, cy + h * 0.02, cx + w * 0.04, cy + h * 0.01, cx + w * 0.25, cy + h * 0.12)
  ctx.stroke()
  ctx.restore()
}

function drawScale(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.5
  const cy = h * 0.41
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(5, w * 0.014)
  roundRect(ctx, cx - w * 0.18, cy + h * 0.07, w * 0.36, h * 0.08, 24)
  ctx.fill()
  roundRect(ctx, cx - w * 0.14, cy - h * 0.06, w * 0.28, h * 0.09, 22)
  ctx.fill()
  roundRect(ctx, cx - w * 0.09, cy - h * 0.18, w * 0.18, h * 0.07, 18)
  ctx.fill()
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.lineWidth = Math.max(2, w * 0.008)
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.20, cy + h * 0.10)
  ctx.lineTo(cx + w * 0.20, cy + h * 0.10)
  ctx.moveTo(cx - w * 0.17, cy - h * 0.03)
  ctx.lineTo(cx + w * 0.17, cy - h * 0.03)
  ctx.stroke()
  ctx.restore()
  ctx.beginPath()
  ctx.arc(cx, cy - h * 0.28, Math.max(18, w * 0.03), 0, Math.PI * 2)
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
  const satellites: readonly [number, number][] = [
    [cx - w * 0.15, cy - h * 0.08],
    [cx + w * 0.14, cy - h * 0.1],
    [cx - w * 0.12, cy + h * 0.11],
    [cx + w * 0.17, cy + h * 0.06],
    [cx, cy - h * 0.19],
  ]
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
  ctx.globalAlpha = 0.24
  ctx.beginPath()
  ctx.arc(cx, cy, Math.min(w, h) * 0.045, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function sampleShape(draw: ShapeDraw): Point[] {
  const canvas = document.createElement('canvas')
  canvas.width = SAMPLE_W
  canvas.height = SAMPLE_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return Array.from({ length: BASE_PARTICLES }, () => ({ x: 0.5, y: 0.5 }))
  ctx.clearRect(0, 0, SAMPLE_W, SAMPLE_H)
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#fff'
  draw(ctx, SAMPLE_W, SAMPLE_H)
  const data = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data
  const points: Point[] = []
  for (let y = 0; y < SAMPLE_H; y += SAMPLE_STEP) {
    for (let x = 0; x < SAMPLE_W; x += SAMPLE_STEP) {
      const alpha = data[(y * SAMPLE_W + x) * 4 + 3]
      if (alpha > 18) points.push({ x: x / SAMPLE_W, y: y / SAMPLE_H })
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

function buildShapes(mode: MorphMode) {
  const drawFns: ShapeDraw[] = mode === 'thesis'
    ? [drawIdentity, drawDistribution]
    : [drawFlow, drawScale, drawIntelligence]
  return drawFns.map((draw) => resamplePoints(sampleShape(draw), BASE_PARTICLES))
}

type Particle = {
  baseX: number; baseY: number
  startX: number; startY: number
  ampX: number; ampY: number
  freqX: number; freqY: number
  phaseX: number; phaseY: number
  size: number; stagger: number
}

export default function ParticleMorphScene({ mode, stage, stageLabels }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const shapesRef = useRef<Point[][]>([])
  const stageRef = useRef(stage)
  const targetStageRef = useRef(stage)
  const transitionRef = useRef({ start: 0, duration: 1.6, from: stage, to: stage })

  const stageLabel = useMemo(() => stageLabels[stage] ?? stageLabels[0], [stage, stageLabels])

  useEffect(() => {
    targetStageRef.current = stage
  }, [stage])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const shapes = buildShapes(mode)
    shapesRef.current = shapes
    const firstShape = shapes[0]

    particlesRef.current = Array.from({ length: BASE_PARTICLES }, (_, i) => {
      const point = firstShape[i % firstShape.length] ?? { x: 0.5, y: 0.5 }
      return {
        baseX: point.x, baseY: point.y,
        startX: point.x, startY: point.y,
        ampX: 0.0025 + Math.random() * 0.007,
        ampY: 0.0035 + Math.random() * 0.009,
        freqX: 0.11 + Math.random() * 0.18,
        freqY: 0.09 + Math.random() * 0.16,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        size: 0.65 + (i % 6) * 0.15,
        stagger: Math.random() * (mode === 'thesis' ? 0.22 : 0.33),
      }
    })

    stageRef.current = 0
    targetStageRef.current = 0
    transitionRef.current = { start: performance.now(), duration: 1.6, from: 0, to: 0 }

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
      const shapesNow = shapesRef.current
      const currentStage = stageRef.current
      const desiredStage = targetStageRef.current

      if (desiredStage !== currentStage) {
        for (let i = 0; i < particles.length; i++) {
          particles[i].startX = particles[i].baseX
          particles[i].startY = particles[i].baseY
        }
        transitionRef.current = {
          start: now,
          duration: mode === 'thesis' ? 1.7 : 2.05,
          from: currentStage,
          to: desiredStage,
        }
        stageRef.current = desiredStage
      }

      const transition = transitionRef.current
      const progress = clamp((now - transition.start) / (transition.duration * 1000), 0, 1)
      const eased = easeInOutCubic(progress)
      const targetShape = shapesNow[stageRef.current] ?? shapesNow[0]

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#f0ece4'
      ctx.shadowColor = 'rgba(240, 236, 228, 0.28)'
      ctx.shadowBlur = mode === 'thesis' ? 14 : 12

      const scale = Math.min(width * (mode === 'thesis' ? 0.76 : 0.72), height * 0.62)
      const ox = width * 0.5
      const oy = height * 0.5 + (mode === 'thesis' ? -10 : 0)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const staged = clamp((eased - p.stagger) / (1 - p.stagger), 0, 1)
        const mix = easeInOutCubic(staged)
        const target = targetShape[i]
        if (target) {
          p.baseX = lerp(p.startX, target.x, mix)
          p.baseY = lerp(p.startY, target.y, mix)
        }
        const swayX = Math.sin(now * 0.001 * p.freqX * Math.PI * 2 + p.phaseX) * p.ampX
        const swayY = Math.sin(now * 0.001 * p.freqY * Math.PI * 2 + p.phaseY) * p.ampY
        const pulse = Math.sin(now * 0.0008 + p.phaseX * 0.5) * 0.0015
        const x = (p.baseX + swayX + pulse) * scale + ox - scale * 0.5
        const y = (p.baseY + swayY) * scale + oy - scale * 0.5
        const radius = p.size * (mode === 'thesis' ? 1.04 : 1.08)
        ctx.globalAlpha = 0.46 + radius * 0.11
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
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
  }, [mode])

  return (
    <div ref={wrapRef} className={styles.sceneWrap}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.sheen} aria-hidden="true" />
      <div className={styles.badge}>
        <span>{stageLabel}</span>
      </div>
    </div>
  )
}
