import Link from 'next/link'
import styles from './page.module.css'

const notes = [
  'Messaggerie Italiane gives the thesis a real operating backbone: distribution as infrastructure, not decoration.',
  '€800m revenue scale changes the conversation. Distribution becomes a capital allocation discipline, not a channel tactic.',
  '61M units a year implies systems thinking: forecasting, routing, inventory, and service levels have to stay in sync.',
  'The Kadokawa joint venture points to a future where distribution is both regional and platform-native.',
  'Consumer AI does not remove the need for distribution. It raises the value of selective, trusted placement.'
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
            Michele Mauri sits inside a rare operating context: shareholder in Messaggerie Italiane,
            a business system shaped by €800m revenue, 61M units a year, and a joint venture with
            Kadokawa. That makes distribution legible as something larger than logistics. It is the
            layer where product, capital, trust, and timing all meet.
          </p>
        </div>

        <aside className={styles.notes} aria-label="Margin notes">
          {notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </aside>

        <div className={styles.column}>
          <p>
            In the old model, distribution was what happened after the important decisions were made.
            In the new model, it is the place where the important decisions are tested. Every route,
            every ranking, every partner choice reveals whether the system is built for scale or merely
            for movement.
          </p>
          <p>
            Messaggerie Italiane matters because it anchors the conversation in real operating weight.
            It is a context where inventory, service levels, and commercial relationships are not
            abstract. They are measured, negotiated, and maintained with precision. That discipline is
            exactly what consumer AI will demand from its distribution layer.
          </p>

          <div className={styles.fullBleedMedia} aria-label="Full-bleed editorial media break">
            <div className={styles.mediaGlyph}>
              <div className={styles.mediaOverlay}>
                <span>distribution as infrastructure</span>
                <p>High-trust systems move quietly, but they move everything.</p>
              </div>
            </div>
          </div>

          <p>
            At 61M units a year, the underlying logic is obvious: scale only matters if it is legible.
            The future distribution layer will belong to teams that can orchestrate inventory, demand,
            and intelligence in one continuous motion, without forcing the user to feel the machinery.
          </p>
          <p>
            The Kadokawa joint venture adds an important dimension. It suggests that the next phase of
            distribution is not only domestic or linear. It is increasingly cross-market, cross-format,
            and culturally negotiated. That is where the strategic edge lives: in deciding how content
            and commerce should travel across ecosystems without losing value.
          </p>
          <p>
            Consumer AI raises the bar for all of this. Discovery becomes more personalized, but trust
            becomes more scarce. The winners will not simply be the fastest or largest. They will be the
            operators who can place value with restraint, preserve quality, and make the system feel
            almost inevitable.
          </p>

          <div className={styles.pullQuote}>
            Distribution is no longer the back office of attention. It is the architecture of
            credibility.
          </div>

          <p>
            In that environment, Michele's background matters because it blends capital discipline,
            operating memory, and future-facing product judgment. The work is not to make distribution
            louder. It is to make it more exact.
          </p>

          <div className={styles.fullBleedMediaAlt} aria-label="Second full-bleed editorial media break">
            <div className={styles.mediaPanel}>
              <p>
                Placeholder for a full-bleed image or video sequence that marks a shift in the essay.
              </p>
            </div>
          </div>

          <p>
            In consumer AI, the distribution layer will increasingly decide what gets amplified,
            what gets filtered, and what gets protected from noise. That is a high-status problem
            because it is ultimately a problem of judgment. The future belongs to systems that know
            where to place attention, and when to leave it alone.
          </p>
        </div>
      </article>
    </main>
  )
}
