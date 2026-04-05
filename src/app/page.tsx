'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export default function HomePage() {
  const headlineRef = useRef<HTMLHeadingElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const hero = heroRef.current
    const headline = headlineRef.current
    if (!hero || !headline) return

    let raf = 0
    const update = () => {
      const rect = hero.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const progress = clamp(1 - Math.max(rect.top, 0) / (vh * 0.92), 0, 1)
      const scale = lerp(1, 0.74, progress)
      const y = lerp(0, -34, progress)
      const opacity = lerp(1, 0.88, progress)
      headline.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`
      headline.style.opacity = String(opacity)
      raf = requestAnimationFrame(update)
    }

    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>Mauri HQ</div>
        <nav className={styles.nav} aria-label="Primary">
          <Link href="#home">Home</Link>
          <Link href="/distribution">Distribution</Link>
        </nav>
      </header>

      <section ref={heroRef} id="home" className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Michele Mauri</p>
          <h1 ref={headlineRef} className={styles.headline}>
            Editorial authority for the modern distribution layer.
          </h1>
          <p className={styles.dek}>
            Quiet luxury, high-status restraint, and a sharp point of view on how value,
            attention, and infrastructure move through consumer AI and media distribution.
          </p>
          <div className={styles.actions}>
            <Link className={styles.actionPrimary} href="/distribution">
              Read the distribution layer essay
            </Link>
            <a className={styles.actionSecondary} href="#overview">
              Explore the thesis
            </a>
          </div>
        </div>
      </section>

      <section id="overview" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>Visual thesis</p>
          <h2>Quiet luxury, art-directed as editorial architecture.</h2>
        </div>
        <div className={styles.split}>
          <p>
            Pure black space, slow typography, measured spacing, and a single dominant headline.
            The page should feel like a premium publication cover rather than a product grid.
          </p>
          <p>
            The composition stays minimal, but every line carries weight: strong hierarchy,
            precise alignment, and enough breathing room to make the page feel expensive.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>Content plan</p>
          <h2>Home sets the tone. Distribution carries the argument.</h2>
        </div>
        <div className={styles.split}>
          <p>
            The home page introduces Michele Mauri as a high-trust operator in distribution,
            infrastructure, and consumer-facing AI. The article section then expands into a longform
            editorial narrative about the future of the distribution layer.
          </p>
          <p>
            Placeholder copy should reference €800m revenue scale, Messaggerie Italiane context,
            and the operational logic that sits between supply, demand, and intelligence.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>Interaction thesis</p>
          <h2>Scroll-scaling headline, magnetic hover states, gentle spring motion.</h2>
        </div>
        <div className={styles.split}>
          <p>
            The hero title scales down as the user scrolls, creating a controlled editorial reveal.
            Links and editorial cues respond with a subtle magnetic pull.
          </p>
          <p>
            On the article side, media breaks and notes should transition with a soft spring feel,
            never abrupt, always composed.
          </p>
        </div>
      </section>
    </main>
  )
}
