'use client'

import Link from 'next/link'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import ParticleMorphScene from '../components/ParticleMorphScene'
import styles from './page.module.css'

const stageLabels = [
  'Personal Identity',
  'Infrastructure',
  'Flow',
  'Scale',
  'Intelligence',
] as const

const stageNotes = [
  'A single self holding shape.',
  'Systems, rails, and connective tissue.',
  'Velocity without friction.',
  'Density that reads as scale.',
  'Adaptive intelligence emerging from the field.',
] as const

export default function HomePage() {
  const pageRef = useRef<HTMLElement | null>(null)
  const systemRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ['start start', 'end end'] })
  const { scrollYProgress: systemProgress } = useScroll({ target: systemRef, offset: ['start start', 'end end'] })

  const [stage, setStage] = useState(0)

  useMotionValueEvent(systemProgress, 'change', (latest) => {
    if (latest < 0.18) setStage(0)
    else if (latest < 0.36) setStage(1)
    else if (latest < 0.58) setStage(2)
    else if (latest < 0.8) setStage(3)
    else setStage(4)
  })

  const heroScale = useSpring(useTransform(scrollYProgress, [0, 0.25], [1.08, 0.95]), {
    stiffness: 120,
    damping: 24,
    mass: 0.75,
  })
  const heroY = useSpring(useTransform(scrollYProgress, [0, 0.3], [0, -40]), {
    stiffness: 120,
    damping: 24,
    mass: 0.75,
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2, 0.35], [1, 0.92, 0.7])

  return (
    <main ref={pageRef} className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>Mauri HQ</div>
        <nav className={styles.nav} aria-label="Primary">
          <Link href="/">Home</Link>
          <Link href="/distribution">Distribution</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <motion.div className={styles.heroInner} style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}>
          <p className={styles.kicker}>One system. Five states.</p>
          <h1 className={styles.headline}>Supercharged particle architecture.</h1>
          <p className={styles.dek}>
            A single oversized canvas that mutates from personal identity to infrastructure, flow,
            scale, and intelligence without breaking the visual field.
          </p>
          <div className={styles.legend} aria-label="Morph states">
            {stageLabels.map((label, index) => (
              <span key={label} className={index === stage ? styles.legendActive : undefined}>
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      <section ref={systemRef} className={styles.systemSection}>
        <div className={styles.systemSticky}>
          <div className={styles.systemMeta}>
            <p className={styles.systemLabel}>Mauri HQ distribution layer</p>
            <h2>{stageLabels[stage]}</h2>
            <p>{stageNotes[stage]}</p>
          </div>
          <ParticleMorphScene stage={stage} stageLabels={stageLabels} />
        </div>
      </section>

      <section className={styles.outro}>
        <p>
          The field stays bone and ivory on dark, but the motion should feel overworked, expensive,
          and alive.
        </p>
      </section>
    </main>
  )
}
