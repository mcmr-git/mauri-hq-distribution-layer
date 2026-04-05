'use client'

import Link from 'next/link'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import styles from './page.module.css'

const notes = [
  'Messaggerie Italiane',
  '€800m scale',
  '61M units/year',
  'Kadokawa JV',
  'Consumer AI'
]

export default function DistributionPage() {
  const pageRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ['start start', 'end end'] })

  const posterY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -140]), {
    stiffness: 90,
    damping: 22,
    mass: 0.8,
  })
  const posterScale = useSpring(useTransform(scrollYProgress, [0, 1], [1.06, 0.9]), {
    stiffness: 90,
    damping: 22,
    mass: 0.8,
  })
  const captionOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 0.9, 0.8, 0.6])

  return (
    <main ref={pageRef} className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.back} href="/">Mauri HQ</Link>
        <div className={styles.eyebrow}>Distribution Layer</div>
      </header>

      <section className={styles.heroBand}>
        <motion.div className={styles.heroArtwork} style={{ y: posterY, scale: posterScale }} aria-hidden="true">
          <div className={styles.posterGlow} />
          <div className={styles.posterGrid} />
          <div className={styles.posterNodeA} />
          <div className={styles.posterNodeB} />
          <div className={styles.posterNodeC} />
          <div className={styles.posterLine} />
        </motion.div>

        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Longform / visual essay</p>
          <h1 className={styles.title}>The future of the distribution layer.</h1>
          <p className={styles.intro}>
            A high-trust system for capital, content, and AI-native discovery.
          </p>
        </div>
      </section>

      <article className={styles.article}>
        <aside className={styles.notes} aria-label="Margin notes">
          {notes.map((note) => (
            <span key={note}>{note}</span>
          ))}
        </aside>

        <div className={styles.column}>
          <div className={styles.mediaBreak}>
            <motion.div className={styles.mediaFrame} style={{ y: posterY }}>
              <div className={styles.mediaImageA} />
            </motion.div>
            <p style={{ opacity: captionOpacity }}>Distribution as infrastructure.</p>
          </div>

          <p>
            Michele Mauri’s context suggests a future where distribution behaves less like logistics
            and more like orchestration. The visible surface stays calm; the underlying system does the
            heavy lifting.
          </p>

          <div className={styles.mediaBreakAlt}>
            <motion.div className={styles.mediaFrame} style={{ y: useTransform(scrollYProgress, [0, 1], [0, 110]) }}>
              <div className={styles.mediaImageB} />
            </motion.div>
            <p>Trust, placement, and timing.</p>
          </div>

          <p>
            At Messaggerie Italiane scale, every routing decision is an argument about value. At
            €800m revenue, the distribution layer becomes a capital discipline. At 61M units a year,
            the system has to stay legible. The Kadokawa JV signals how global the conversation is now.
          </p>

          <div className={styles.pullQuote}>Place less. Mean more.</div>

          <div className={styles.mediaBreak}>
            <motion.div className={styles.mediaFrame} style={{ y: useTransform(scrollYProgress, [0, 1], [0, -90]) }}>
              <div className={styles.mediaImageC} />
            </motion.div>
            <p>AI discovers, distribution decides.</p>
          </div>

          <p>
            The next distribution layer is selective, AI-aware, and difficult to fake. It will reward
            systems that can protect quality while moving with speed.
          </p>
        </div>
      </article>
    </main>
  )
}
