import Link from 'next/link'
import styles from './page.module.css'

const notes = [
  'Revenue scale matters because distribution is now a capital allocation problem, not just a channel problem.',
  'Messaggerie Italiane sits inside a legacy of operational rigor that still maps cleanly to modern infrastructure thinking.',
  'Consumer AI changes discovery, but distribution still decides who gets seen, when, and at what cost.'
]

export default function DistributionPage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.back} href="/">Mauri HQ</Link>
        <div className={styles.eyebrow}>Distribution Layer</div>
      </header>

      <article className={styles.article}>
        <div className={styles.articleHead}>
          <p className={styles.kicker}>Longform editorial</p>
          <h1 className={styles.title}>The future of the distribution layer is quiet, expensive, and decisive.</h1>
          <p className={styles.intro}>
            Michele Mauri operates at the intersection of distribution infrastructure, revenue scale,
            and consumer AI. This draft frames the distribution layer as a strategic system: one that
            moves value efficiently, protects quality, and keeps the surface area of complexity out of
            the user’s way.
          </p>
        </div>

        <aside className={styles.notes} aria-label="Margin notes">
          {notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </aside>

        <div className={styles.column}>
          <p>
            In a market shaped by high-volume media flows and software-native discovery, distribution
            is no longer a background function. It is the mechanism that decides whether attention is
            converted into durable value. At €800m scale, every decision downstream becomes visible in
            margin, velocity, and market position.
          </p>
          <p>
            The Messaggerie Italiane context matters because it gives distribution a physical memory:
            contracts, logistics, schedules, and the discipline required to move complex inventories
            through real systems. That legacy translates directly into modern platform design, where the
            challenge is not simply reach, but reliable orchestration.
          </p>
          <div className={styles.mediaBreak}>
            <div className={styles.mediaGlyph} />
            <p>Distribution is the hidden interface between quality and scale.</p>
          </div>
          <p>
            Consumer AI changes the front end, but not the need for robust routing, ranking, and
            relationship design underneath. The best systems will feel almost invisible: curated, fast,
            and strangely calm. That is the new luxury in infrastructure.
          </p>
          <p>
            For Michele, the work is to make the layer legible without making it loud. The best
            distribution strategy does not ask for attention; it earns trust through precision.
          </p>
          <div className={styles.mediaBreakAlt}>
            <div className={styles.mediaPanel} />
            <p>
              Placeholder media break for an image, a data strip, or a short film still that marks a
              shift in the essay’s rhythm.
            </p>
          </div>
          <p>
            The next generation of distribution will reward those who can combine operational rigor,
            product judgment, and a clear understanding of how content or commerce should surface in
            an AI-shaped environment.
          </p>
        </div>
      </article>
    </main>
  )
}
