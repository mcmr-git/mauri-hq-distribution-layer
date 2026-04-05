'use client'

import Link from 'next/link'
import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import styles from './page.module.css'

function BeatMark({ label }: { label: string }) {
  return <p className={styles.beatLabel}>{label}</p>
}

const thesisPaths = {
  left: [
    'M125 342C145 236 255 170 372 188C448 199 494 245 510 301C523 350 493 392 432 417C354 449 233 452 168 410C126 383 114 369 125 342Z',
    'M206 316C229 225 306 183 392 184C476 185 541 227 552 299C562 364 532 430 445 454C360 478 249 452 208 386C187 352 197 338 206 316Z',
  ],
  right: [
    'M1077 342C1057 236 947 170 830 188C754 199 708 245 692 301C679 350 709 392 770 417C848 449 969 452 1034 410C1076 383 1088 369 1077 342Z',
    'M994 316C971 225 894 183 808 184C724 185 659 227 648 299C638 364 668 430 755 454C840 478 951 452 992 386C1013 352 1003 338 994 316Z',
  ],
  center: [
    'M392 352C392 265 458 208 550 195C639 182 727 205 808 254C885 300 912 364 889 421C865 480 792 516 709 522C619 529 542 504 483 465C420 423 392 394 392 352Z',
    'M408 348C408 266 466 224 542 208C628 190 721 205 798 252C866 294 893 357 878 410C859 476 795 520 715 529C626 539 546 513 492 474C434 432 408 395 408 348Z',
  ],
}

const triadCaption = ['Flow', 'Scale', 'Intelligence'] as const

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
    setThesisStage(latest > 0.5 ? 1 : 0)
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

  const thesisGlow = useTransform(thesisProgress, [0, 1], [0.7, 1])
  const triadGlow = useTransform(triadProgress, [0, 1], [0.72, 1])

  const caption = triadCaption[triadStage]

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

          <div className={styles.thesisScene}>
            <svg className={styles.sceneSvg} viewBox="0 0 1200 700" role="img" aria-label="Morphing thesis form">
              <defs>
                <filter id="thesisGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                    result="goo"
                  />
                  <feMerge>
                    <feMergeNode in="goo" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <motion.g filter="url(#thesisGlow)">
                <motion.path
                  d={thesisPaths.left[thesisStage]}
                  animate={{ d: thesisPaths.left[thesisStage] }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  fill="rgba(247,244,238,0.04)"
                  stroke="rgba(247,244,238,0.18)"
                  strokeWidth="1.2"
                />
                <motion.path
                  d={thesisPaths.right[thesisStage]}
                  animate={{ d: thesisPaths.right[thesisStage] }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  fill="rgba(247,244,238,0.04)"
                  stroke="rgba(247,244,238,0.18)"
                  strokeWidth="1.2"
                />
                <motion.path
                  d={thesisPaths.center[thesisStage]}
                  animate={{ d: thesisPaths.center[thesisStage] }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  fill="rgba(247,244,238,0.03)"
                  stroke="rgba(247,244,238,0.28)"
                  strokeWidth="1.4"
                />
                <motion.path
                  d={
                    thesisStage
                      ? 'M470 350C520 330 673 330 729 350'
                      : 'M190 350C300 312 403 305 487 332M713 332C799 305 900 312 1010 350'
                  }
                  animate={{ opacity: thesisStage ? 1 : 0.7 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  fill="none"
                  stroke="rgba(247,244,238,0.34)"
                  strokeLinecap="round"
                  strokeWidth="1.2"
                />
              </motion.g>
            </svg>
            <div className={styles.thesisPulse} />
          </div>
        </div>
      </section>

      <section ref={triadRef} className={styles.beatSection}>
        <div className={styles.beatSticky}>
          <div className={styles.beatMeta}>
            <BeatMark label="Beat 2" />
            <h2>The Triad</h2>
            <p>{caption}</p>
          </div>

          <div className={styles.triadScene}>
            <svg className={styles.sceneSvg} viewBox="0 0 1200 700" role="img" aria-label="Morphing triad form">
              <defs>
                <filter id="goo" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
                    result="goo"
                  />
                  <feMerge>
                    <feMergeNode in="goo" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <motion.g filter="url(#goo)">
                <motion.path
                  d={
                    triadStage === 0
                      ? 'M160 350C250 295 320 293 410 350C320 407 250 405 160 350Z'
                      : triadStage === 1
                        ? 'M365 210C410 190 445 188 490 210C453 269 417 283 365 258C350 242 350 226 365 210Z'
                        : 'M335 246C392 184 442 170 505 202C485 266 435 312 368 303C327 297 314 271 335 246Z'
                  }
                  style={{ opacity: triadGlow, scale: triadStage === 1 ? 0.9 : 1 }}
                  transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                  fill="rgba(247,244,238,0.05)"
                  stroke="rgba(247,244,238,0.18)"
                  strokeWidth="1.1"
                />
                <motion.path
                  d={
                    triadStage === 0
                      ? 'M520 350C595 304 660 300 742 350C662 403 597 404 520 350Z'
                      : triadStage === 1
                        ? 'M531 316C579 272 640 272 689 316C651 363 606 374 531 353C510 338 510 327 531 316Z'
                        : 'M541 343C597 285 649 281 715 314C690 384 642 424 570 418C524 413 509 378 541 343Z'
                  }
                  style={{ opacity: triadGlow, scale: triadStage === 1 ? 1.02 : 1 }}
                  transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                  fill="rgba(247,244,238,0.06)"
                  stroke="rgba(247,244,238,0.2)"
                  strokeWidth="1.2"
                />
                <motion.path
                  d={
                    triadStage === 0
                      ? 'M790 350C880 293 950 295 1040 350C950 405 880 407 790 350Z'
                      : triadStage === 1
                        ? 'M728 290C775 270 812 271 857 291C836 352 799 372 747 354C725 338 723 310 728 290Z'
                        : 'M784 264C845 186 912 186 980 255C948 316 892 357 826 349C768 341 742 304 784 264Z'
                  }
                  style={{ opacity: triadGlow, scale: triadStage === 1 ? 0.96 : 1 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  fill="rgba(247,244,238,0.05)"
                  stroke="rgba(247,244,238,0.18)"
                  strokeWidth="1.1"
                />
                <motion.path
                  d={
                    triadStage === 2
                      ? 'M432 250C514 308 605 332 768 250'
                      : 'M220 350C406 335 513 330 994 350'
                  }
                  style={{ opacity: triadStage === 2 ? 1 : 0.72 }}
                  transition={{ duration: 0.85, ease: 'easeOut' }}
                  fill="none"
                  stroke="rgba(247,244,238,0.22)"
                  strokeLinecap="round"
                  strokeWidth="1.1"
                />
                <motion.circle
                  cx={triadStage === 0 ? 300 : triadStage === 1 ? 420 : 370}
                  cy={triadStage === 0 ? 350 : triadStage === 1 ? 230 : 255}
                  r={triadStage === 0 ? 54 : triadStage === 1 ? 34 : 40}
                  style={{ opacity: triadGlow }}
                  transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                  fill="rgba(247,244,238,0.18)"
                />
                <motion.circle
                  cx={triadStage === 0 ? 600 : triadStage === 1 ? 610 : 590}
                  cy={triadStage === 0 ? 350 : triadStage === 1 ? 345 : 350}
                  r={triadStage === 0 ? 60 : triadStage === 1 ? 78 : 50}
                  style={{ opacity: triadGlow, scale: triadStage === 1 ? 1.1 : 1 }}
                  transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                  fill="rgba(247,244,238,0.24)"
                />
                <motion.circle
                  cx={triadStage === 0 ? 900 : triadStage === 1 ? 780 : 870}
                  cy={triadStage === 0 ? 350 : triadStage === 1 ? 465 : 300}
                  r={triadStage === 0 ? 54 : triadStage === 1 ? 36 : 42}
                  style={{ opacity: triadGlow }}
                  transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
                  fill="rgba(247,244,238,0.18)"
                />
              </motion.g>
            </svg>
            <div className={styles.triadCaptionRow}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={caption}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={styles.triadStageLabel}
                >
                  {caption}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
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
","path":"src/app/page.module.css","content":".page {
  min-height: 100vh;
  background: var(--bg);
}

.topbar {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: min(1440px, calc(100vw - 40px));
  margin: 0 auto;
  padding: 22px 0;
  pointer-events: none;
  mix-blend-mode: screen;
}

.brand,
.nav a,
.kicker,
.actionPrimary,
.actionSecondary,
.beatLabel,
.entryLink {
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.68rem;
}

.brand,
.beatLabel {
  color: rgba(247, 244, 238, 0.56);
}

.nav {
  display: flex;
  align-items: center;
  gap: 18px;
  pointer-events: auto;
}

.nav a {
  color: rgba(247, 244, 238, 0.62);
  transition: transform 180ms ease, color 180ms ease;
}

.nav a:hover {
  color: rgba(247, 244, 238, 0.94);
  transform: translateY(-1px);
}

.hero,
.beatSection,
.beatSectionShort {
  position: relative;
  display: grid;
  place-items: center;
}

.hero {
  min-height: 100svh;
  overflow: hidden;
}

.beatSection {
  min-height: 128svh;
}

.beatSectionShort {
  min-height: 88svh;
}

.heroVisual {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.signalField {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 22%, rgba(247, 244, 238, 0.08), transparent 20%),
    radial-gradient(circle at 78% 34%, rgba(247, 244, 238, 0.06), transparent 18%),
    radial-gradient(circle at 50% 70%, rgba(247, 244, 238, 0.05), transparent 26%),
    linear-gradient(180deg, rgba(255,255,255,0.03), transparent 24%, transparent 76%, rgba(255,255,255,0.02));
}

.heroOrb {
  position: absolute;
  inset: 50% auto auto 50%;
  width: min(72vw, 920px);
  height: min(72vw, 920px);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(247, 244, 238, 0.1);
  box-shadow: inset 0 0 120px rgba(247, 244, 238, 0.03);
}

.nodeA,
.nodeB,
.nodeC {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(247, 244, 238, 0.92);
  box-shadow: 0 0 24px rgba(247, 244, 238, 0.38);
}

.nodeA { top: 26%; left: 18%; }
.nodeB { top: 58%; left: 74%; }
.nodeC { top: 72%; left: 42%; }

.heroInner {
  position: relative;
  z-index: 1;
  width: min(1440px, calc(100vw - 40px));
  margin: 0 auto;
  display: grid;
  justify-items: start;
  gap: 18px;
  padding-top: 8svh;
}

.kicker {
  color: rgba(247, 244, 238, 0.56);
}

.headline {
  font-family: var(--serif);
  font-size: clamp(4.8rem, 12vw, 11.4rem);
  line-height: 0.88;
  letter-spacing: -0.06em;
  max-width: 10ch;
  transform-origin: left top;
  will-change: transform, opacity;
}

.dek {
  max-width: 28ch;
  font-size: clamp(1rem, 1.25vw, 1.08rem);
  line-height: 1.7;
  color: rgba(247, 244, 238, 0.7);
}

.actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 10px;
}

.actionPrimary,
.actionSecondary {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.actionPrimary {
  background: var(--ink);
  color: #050505;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
}

.actionSecondary {
  color: rgba(247, 244, 238, 0.56);
  border: 1px solid rgba(247, 244, 238, 0.12);
}

.beatSticky {
  width: min(1440px, calc(100vw - 40px));
  margin: 0 auto;
  display: grid;
  gap: 22px;
  padding: 14svh 0 8svh;
  align-self: start;
  position: sticky;
  top: 12svh;
}

.beatMeta,
.beatMetaCompact {
  display: grid;
  gap: 8px;
}

.beatMeta h2 {
  font-family: var(--serif);
  font-size: clamp(2.6rem, 5.8vw, 5.6rem);
  line-height: 0.92;
  letter-spacing: -0.05em;
}

.beatMeta p,
.beatMetaCompact p {
  max-width: 30ch;
  color: rgba(247, 244, 238, 0.72);
  font-size: clamp(1rem, 1.25vw, 1.08rem);
  line-height: 1.7;
}

.thesisScene,
.triadScene {
  position: relative;
  min-height: min(58svh, 680px);
  border-top: 1px solid rgba(247, 244, 238, 0.08);
  border-bottom: 1px solid rgba(247, 244, 238, 0.08);
  overflow: hidden;
}

.sceneSvg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.thesisPulse {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 50%, rgba(247, 244, 238, 0.08), transparent 24%),
    radial-gradient(circle at 36% 34%, rgba(247, 244, 238, 0.03), transparent 18%),
    radial-gradient(circle at 66% 60%, rgba(247, 244, 238, 0.03), transparent 16%);
  mix-blend-mode: screen;
  pointer-events: none;
}

.triadCaptionRow {
  position: absolute;
  left: 24px;
  bottom: 24px;
  z-index: 2;
}

.triadStageLabel {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(247, 244, 238, 0.12);
  background: rgba(6, 6, 6, 0.4);
  color: rgba(247, 244, 238, 0.82);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 0.66rem;
}

.beatSectionShort .beatSticky {
  padding-top: 10svh;
}

.entryPanel {
  display: grid;
  gap: 20px;
}

.entryVisual {
  position: relative;
  width: 100%;
  min-height: 46svh;
  overflow: hidden;
  border-top: 1px solid rgba(247, 244, 238, 0.08);
  border-bottom: 1px solid rgba(247, 244, 238, 0.08);
  background:
    radial-gradient(circle at 50% 38%, rgba(247,244,238,0.1), transparent 18%),
    radial-gradient(circle at 20% 72%, rgba(247,244,238,0.05), transparent 16%),
    linear-gradient(180deg, rgba(255,255,255,0.03), transparent 24%, transparent 76%, rgba(255,255,255,0.02));
}

.entryGlow {
  position: absolute;
  inset: 14% 10%;
  border: 1px solid rgba(247, 244, 238, 0.1);
  border-radius: 999px;
}

.entryPath {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(130deg, transparent 44%, rgba(247,244,238,0.08) 50%, transparent 56%),
    linear-gradient(180deg, transparent 62%, rgba(247,244,238,0.05) 64%, transparent 66%);
}

.entryLink {
  color: var(--ink);
  border-bottom: 1px solid rgba(247, 244, 238, 0.22);
  padding-bottom: 6px;
  width: fit-content;
}

@media (max-width: 820px) {
  .topbar,
  .heroInner,
  .beatSticky {
    width: min(100vw - 28px, 1440px);
  }

  .headline {
    max-width: 9ch;
    font-size: clamp(4rem, 16vw, 6.6rem);
  }

  .heroOrb {
    width: 120vw;
    height: 120vw;
  }

  .beatMeta h2 {
    font-size: clamp(2.3rem, 11vw, 4rem);
  }

  .thesisScene,
  .triadScene {
    min-height: 46svh;
  }
}
"}]}}