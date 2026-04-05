'use client'

import Link from 'next/link'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import ParticleGlobe from '../components/ParticleGlobe'
import styles from './page.module.css'

function BeatMark({ label }: { label: string }) {
  return <p className={styles.beatLabel}>{label}</p>
}

export default function HomePage() {
  const pageRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ['start start', 'end end'] })

  const heroScale = useSpring(useTransform(scrollYProgress, [0, 0.18], [1.08, 0.82]), {
    stiffness: 120,
    damping: 26,
    mass: 0.7,
  })
  const heroY = useSpring(useTransform(scrollYProgress, [0, 0.22], [0, -70]), {
    stiffness: 120,
    damping: 26,
    mass: 0.7,
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.14, 0.22], [1, 0.88, 0.55])

  const thesisScale = useTransform(scrollYProgress, [0.1, 0.38], [0.94, 1.08])
  const thesisY = useTransform(scrollYProgress, [0.1, 0.38], [40, -40])

  const triadFlow = useTransform(scrollYProgress, [0.34, 0.58], [0.18, 1])
  const triadScale = useTransform(scrollYProgress, [0.38, 0.62], [0.18, 1])
  const triadIntel = useTransform(scrollYProgress, [0.42, 0.66], [0.18, 1])

  const bridgeOpacity = useTransform(scrollYProgress, [0.62, 0.78], [0.1, 1])
  const entryY = useTransform(scrollYProgress, [0.72, 1], [100, 0])
  const entryOpacity = useTransform(scrollYProgress, [0.72, 0.88, 1], [0.1, 0.75, 1])

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
        <div className={styles.globeStage} aria-hidden="true">
          <ParticleGlobe />
        </div>
        <motion.div className={styles.heroVisual} aria-hidden="true" style={{ y: heroY }}>
          <div className={styles.signalField} />
          <motion.div className={styles.heroOrb} style={{ scale: heroScale }} />
          <div className={styles.nodeA} />
          <div className={styles.nodeB} />
          <div className={styles.nodeC} />
        </motion.div>

        <div className={styles.heroInner}>
          <p className={styles.kicker}>Michele Mauri</p>
          <motion.h1 className={styles.headline} style={{ scale: heroScale, y: heroY, opacity: heroOpacity }}>
            Michele Mauri
          </motion.h1>
          <p className={styles.dek}>Distribution and consumer AI.</p>
          <div className={styles.actions}>
            <Link className={styles.actionPrimary} href="/distribution">
              Enter
            </Link>
            <span className={styles.actionSecondary}>Scroll</span>
          </div>
        </div>
      </section>

      <section className={styles.beatSection}>
        <BeatMark label="Beat 1" />
        <div className={styles.beatLayout}>
          <motion.div className={styles.thesisMark} style={{ scale: thesisScale, y: thesisY }} aria-hidden="true">
            <div className={styles.thesisRing} />
            <div className={styles.thesisCore} />
          </motion.div>
          <div className={styles.beatCopy}>
            <h2>The Thesis</h2>
            <p>Distribution is the visible edge of value.</p>
          </div>
        </div>
      </section>

      <section className={styles.beatSection}>
        <BeatMark label="Beat 2" />
        <div className={styles.triadGrid}>
          <motion.div className={styles.triadCard} style={{ opacity: triadFlow }}>
            <div className={styles.triadGlyph} />
            <h3>Flow</h3>
            <p>Move cleanly.</p>
          </motion.div>
          <motion.div className={styles.triadCard} style={{ opacity: triadScale }}>
            <div className={styles.triadGlyphAlt} />
            <h3>Scale</h3>
            <p>Stay legible.</p>
          </motion.div>
          <motion.div className={styles.triadCard} style={{ opacity: triadIntel }}>
            <div className={styles.triadGlyphThird} />
            <h3>Intelligence</h3>
            <p>Place with judgment.</p>
          </motion.div>
        </div>
      </section>

      <section className={styles.beatSection}>
        <BeatMark label="Beat 3" />
        <motion.div className={styles.bridgeBlock} style={{ opacity: bridgeOpacity }}>
          <div className={styles.bridgeLine} />
          <p>Distribution and consumer AI turn selection into value.</p>
        </motion.div>
      </section>

      <section className={styles.beatSection}>
        <BeatMark label="Beat 4" />
        <motion.div className={styles.entryBlock} style={{ y: entryY, opacity: entryOpacity }}>
          <div className={styles.entryVisual} aria-hidden="true">
            <div className={styles.entryGlow} />
            <div className={styles.entryPath} />
          </div>
          <Link className={styles.entryLink} href="/distribution">
            Enter Distribution
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
