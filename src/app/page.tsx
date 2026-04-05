'use client'

import Link from 'next/link'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import styles from './page.module.css'

export default function HomePage() {
  const heroRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })

  const headlineScale = useSpring(useTransform(scrollYProgress, [0, 1], [1.08, 0.74]), {
    stiffness: 120,
    damping: 26,
    mass: 0.7,
  })
  const headlineY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -48]), {
    stiffness: 120,
    damping: 26,
    mass: 0.7,
  })
  const fade = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.92, 0.6])
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 120])

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>Mauri HQ</div>
        <nav className={styles.nav} aria-label="Primary">
          <Link href="/">Home</Link>
          <Link href="/distribution">Distribution</Link>
        </nav>
      </header>

      <section ref={heroRef} id="home" className={styles.hero}>
        <motion.div className={styles.heroVisual} style={{ y: glowY }} aria-hidden="true">
          <div className={styles.signalField} />
          <motion.div className={styles.orbitLarge} style={{ y: glowY }} />
          <motion.div className={styles.orbitSmall} style={{ y: glowY }} />
          <div className={styles.nodeA} />
          <div className={styles.nodeB} />
          <div className={styles.nodeC} />
        </motion.div>

        <div className={styles.heroInner}>
          <p className={styles.kicker}>Michele Mauri</p>
          <motion.h1 className={styles.headline} style={{ scale: headlineScale, y: headlineY, opacity: fade }}>
            Michele Mauri
          </motion.h1>
          <p className={styles.dek}>
            Distribution layer. Consumer AI. Quiet luxury.
          </p>
          <div className={styles.actions}>
            <Link className={styles.actionPrimary} href="/distribution">
              Distribution essay
            </Link>
            <span className={styles.actionSecondary}>Scroll</span>
          </div>
        </div>

        <div className={styles.heroFooter}>
          <span>operating signal</span>
          <span>minimal surface</span>
        </div>
      </section>
    </main>
  )
}
