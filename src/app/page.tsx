'use client'

import Link from 'next/link'
import { LayoutGroup, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import styles from './page.module.css'

function BeatMark({ label }: { label: string }) {
  return <p className={styles.beatLabel}>{label}</p>
}

export default function HomePage() {
  const pageRef = useRef<HTMLElement | null>(null)
  const thesisRef = useRef<HTMLElement | null>(null)
  const triadRef = useRef<HTMLElement | null>(null)

  const { scrollYProgress } = useScroll({ target: pageRef, offset: ['start start', 'end end'] })
  const { scrollYProgress: thesisProgress } = useScroll({ target: thesisRef, offset: ['start center', 'end center'] })
  const { scrollYProgress: triadProgress } = useScroll({ target: triadRef, offset: ['start center', 'end center'] })

  const [thesisStage, setThesisStage] = useState(0)
  const [triadStage, setTriadStage] = useState(0)

  useMotionValueEvent(thesisProgress, 'change', (latest) => {
    setThesisStage(latest > 0.52 ? 1 : 0)
  })

  useMotionValueEvent(triadProgress, 'change', (latest) => {
    if (latest < 0.34) setTriadStage(0)
    else if (latest < 0.68) setTriadStage(1)
    else setTriadStage(2)
  })

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

  const thesisGlow = useTransform(thesisProgress, [0, 1], [0.75, 1])
  const triadGlow = useTransform(triadProgress, [0, 1], [0.8, 1])

  const triadCaption = ['Flow', 'Scale', 'Intelligence'][triadStage]

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
        <motion.div className={styles.heroVisual} aria-hidden="true" style={{ y: heroY }}>
          <div className={styles.signalField} />
          <motion.div className={styles.heroOrb} style={{ scale: heroScale, opacity: heroOpacity }} />
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

      <section ref={thesisRef} className={styles.beatSection}>
        <div className={styles.beatSticky}>
          <div className={styles.beatMeta}>
            <BeatMark label="Beat 1" />
            <h2>The Thesis</h2>
            <p>Identity and infrastructure, one anchor.</p>
          </div>

          <LayoutGroup id="thesis-morph">
            <div className={styles.thesisScene}>
              <motion.div
                layoutId="thesis-left"
                className={thesisStage ? styles.thesisLeftMerged : styles.thesisLeft}
                style={{ opacity: thesisGlow }}
              />
              <motion.div
                layoutId="thesis-right"
                className={thesisStage ? styles.thesisRightMerged : styles.thesisRight}
                style={{ opacity: thesisGlow }}
              />
              <motion.div
                layoutId="thesis-anchor"
                className={thesisStage ? styles.thesisAnchorMerged : styles.thesisAnchor}
                style={{ scale: thesisStage ? 1 : 0.82, opacity: thesisGlow }}
              />
            </div>
          </LayoutGroup>
        </div>
      </section>

      <section ref={triadRef} className={styles.beatSection}>
        <div className={styles.beatSticky}>
          <div className={styles.beatMeta}>
            <BeatMark label="Beat 2" />
            <h2>The Triad</h2>
            <p>{triadCaption}</p>
          </div>

          <LayoutGroup id="triad-morph">
            <div className={styles.triadScene}>
              <motion.div
                layoutId="triad-a"
                className={
                  triadStage === 0
                    ? styles.triadAFlow
                    : triadStage === 1
                      ? styles.triadAScale
                      : styles.triadAIntel
                }
                style={{ opacity: triadGlow }}
              />
              <motion.div
                layoutId="triad-b"
                className={
                  triadStage === 0
                    ? styles.triadBFlow
                    : triadStage === 1
                      ? styles.triadBScale
                      : styles.triadBIntel
                }
                style={{ opacity: triadGlow }}
              />
              <motion.div
                layoutId="triad-c"
                className={
                  triadStage === 0
                    ? styles.triadCFlow
                    : triadStage === 1
                      ? styles.triadCScale
                      : styles.triadCIntel
                }
                style={{ opacity: triadGlow }}
              />
            </div>
          </LayoutGroup>
        </div>
      </section>

      <section className={styles.beatSectionShort}>
        <div className={styles.beatSticky}>
          <div className={styles.beatMetaCompact}>
            <BeatMark label="Beat 3" />
            <p>Distribution and consumer AI turn selection into value.</p>
          </div>
        </div>
      </section>

      <section className={styles.beatSectionShort}>
        <div className={styles.beatSticky}>
          <div className={styles.entryPanel}>
            <div className={styles.entryVisual} aria-hidden="true">
              <div className={styles.entryGlow} />
              <div className={styles.entryPath} />
            </div>
            <Link className={styles.entryLink} href="/distribution">
              Enter Distribution
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
