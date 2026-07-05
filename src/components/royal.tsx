import { motion } from 'framer-motion'
import { Fragment, type ReactNode } from 'react'

/**
 * Shared "royal cinematic" building blocks: gold dust atmosphere, god rays,
 * a palace skyline silhouette with flickering windows, an ornate Mughal
 * arch panel, glowing diyas and letter-by-letter gold-foil headings.
 */

/** Deterministic pseudo-random in [0,1) so renders are stable across mounts. */
function prand(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/* ----------------------------- atmosphere ----------------------------- */

/** Floating, twinkling gold dust filling the air. */
export function GoldDust({ count = 22 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const size = 1.5 + prand(i, 81) * 3.5
        return (
          <motion.span
            key={i}
            style={{
              position: 'absolute',
              left: `${prand(i, 82) * 100}%`,
              top: `${prand(i, 83) * 100}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: '#E8CF7A',
              boxShadow: `0 0 ${size * 3}px #E8CF7A`,
            }}
            animate={{
              x: [0, 14 - prand(i, 84) * 28, 0],
              y: [0, 20 - prand(i, 85) * 40, 0],
              opacity: [0.05, 0.28 + prand(i, 86) * 0.5, 0.05],
            }}
            transition={{
              duration: 6 + prand(i, 87) * 8,
              delay: prand(i, 88) * 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </div>
  )
}

/** Soft diagonal light beams falling from above. */
export function GodRays({ color = '#F5E08A' }: { color?: string }) {
  const rays = [
    { left: '32%', width: 46, rotate: -16, dur: 9 },
    { left: '50%', width: 70, rotate: -3, dur: 11 },
    { left: '64%', width: 38, rotate: 13, dur: 8 },
  ]
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {rays.map((r, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: '-12%',
            left: r.left,
            width: r.width,
            height: '85vh',
            transformOrigin: 'top center',
            rotate: r.rotate,
            background: `linear-gradient(to bottom, ${color}30, transparent 72%)`,
            filter: 'blur(16px)',
          }}
          animate={{ opacity: [0.45, 0.95, 0.45] }}
          transition={{ duration: r.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 1.4 }}
        />
      ))}
    </div>
  )
}

/* ------------------------- palace silhouette ------------------------- */

function dome(cx: number, baseY: number, r: number, h: number): string {
  return (
    `M${cx} ${baseY - h}` +
    ` C ${cx - r * 1.15} ${baseY - h + h * 0.42}, ${cx - r * 0.8} ${baseY - h * 0.12}, ${cx - r * 0.55} ${baseY}` +
    ` L ${cx + r * 0.55} ${baseY}` +
    ` C ${cx + r * 0.8} ${baseY - h * 0.12}, ${cx + r * 1.15} ${baseY - h + h * 0.42}, ${cx} ${baseY - h} Z`
  )
}

function chhatri(cx: number, baseY: number): string {
  // small pavilion: two pillars + mini dome
  return (
    `M${cx - 12} ${baseY} v-26 h24 v26 Z ` +
    dome(cx, baseY - 26, 13, 22) +
    ` M${cx} ${baseY - 48} v-8`
  )
}

/** Palace skyline anchored to the bottom edge, with flickering lit windows. */
export function PalaceSilhouette({
  windows = '#FFD95E',
  opacity = 0.55,
}: {
  windows?: string
  opacity?: number
}) {
  const windowXs = [180, 280, 420, 520, 640, 800, 920, 1020, 1160, 1260]
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 240"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute bottom-0 left-0 h-[22vh] min-h-28 w-full"
    >
      <g fill="#0A0406" opacity={opacity}>
        {/* base wall */}
        <rect x="0" y="196" width="1440" height="44" />
        {/* crenellations */}
        {Array.from({ length: 36 }).map((_, i) => (
          <rect key={i} x={i * 40 + 8} y="188" width="18" height="10" />
        ))}
        {/* grand central dome */}
        <path d={dome(720, 196, 92, 105)} />
        <rect x="716" y="66" width="8" height="28" />
        <circle cx="720" cy="62" r="5" />
        {/* flanking domes */}
        <path d={dome(480, 196, 55, 66)} />
        <path d={dome(960, 196, 55, 66)} />
        {/* chhatris + minarets */}
        <path d={chhatri(150, 196)} stroke="#0A0406" strokeWidth="4" fill="#0A0406" />
        <path d={chhatri(1290, 196)} stroke="#0A0406" strokeWidth="4" fill="#0A0406" />
        <rect x="30" y="96" width="16" height="100" />
        <path d={dome(38, 96, 14, 24)} />
        <rect x="1394" y="96" width="16" height="100" />
        <path d={dome(1402, 96, 14, 24)} />
      </g>
      {/* lit arched windows, flickering */}
      {windowXs.map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 228 v-14 a7 7 0 0 1 14 0 v14 Z`}
          fill={windows}
          animate={{ opacity: [0.18, 0.55, 0.25, 0.5, 0.18] }}
          transition={{
            duration: 4 + prand(i, 91) * 4,
            delay: prand(i, 92) * 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  )
}

/* ----------------------------- arch panel ----------------------------- */

/** Scalloped (cusped) Mughal arch line, drawn along the panel's round top. */
function CuspArch({ accent }: { accent: string }) {
  const R = 186
  const CX = 220
  const BASE = 230
  const pts = Array.from({ length: 13 }, (_, i) => {
    const a = Math.PI - (i * Math.PI) / 12
    return [CX + R * Math.cos(a), BASE - R * Math.sin(a)] as const
  })
  const d =
    `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} ` +
    pts
      .slice(1)
      .map((p) => `A 20 20 0 0 1 ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
      .join(' ')
  return (
    <svg
      viewBox="0 0 440 240"
      className="pointer-events-none absolute inset-x-3 top-3 w-[calc(100%-24px)]"
      aria-hidden="true"
    >
      <motion.path
        d={d}
        fill="none"
        stroke={accent}
        strokeWidth="1.6"
        opacity="0.55"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.2, delay: 0.5, ease: 'easeInOut' }}
      />
      {/* dots at each cusp */}
      {pts.slice(1, -1).map((p, i) => (
        <motion.circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r="2"
          fill={accent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.8 + i * 0.12 }}
        />
      ))}
    </svg>
  )
}

/** Hanging bell + tassel swaying from the arch apex. */
function ApexBell({ accent }: { accent: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2"
      style={{ transformOrigin: 'top center' }}
      animate={{ rotate: [-7, 7, -7] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      <svg width="22" height="58" viewBox="0 0 22 58">
        <line x1="11" y1="0" x2="11" y2="22" stroke={accent} strokeWidth="1.2" opacity="0.8" />
        <path d="M11 20 C 17 22 19 28 19 33 H 3 C 3 28 5 22 11 20 Z" fill={accent} opacity="0.9" />
        <rect x="3" y="33" width="16" height="2.5" rx="1" fill={accent} />
        <circle cx="11" cy="40" r="2.4" fill={accent} />
        <line x1="11" y1="42" x2="11" y2="50" stroke={accent} strokeWidth="1" opacity="0.7" />
        <path d="M8 50 L14 50 L11 57 Z" fill={accent} opacity="0.8" />
      </svg>
    </motion.div>
  )
}

/** Corner filigree curl. */
function Filigree({ accent, flip }: { accent: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={`pointer-events-none absolute bottom-2 w-12 opacity-60 ${
        flip ? 'right-2 -scale-x-100' : 'left-2'
      }`}
      aria-hidden="true"
    >
      <g fill="none" stroke={accent} strokeWidth="1.3" strokeLinecap="round">
        <path d="M4 56 q 26 -2 34 -22 q 5 -13 -6 -16 q -9 -2 -10 7 q -1 8 8 7" />
        <path d="M4 56 q 2 -22 20 -30" opacity="0.7" />
        <circle cx="44" cy="18" r="1.8" fill={accent} stroke="none" />
        <circle cx="8" cy="50" r="1.5" fill={accent} stroke="none" />
      </g>
    </svg>
  )
}

/**
 * Ornate arch-topped panel: dark glass body, double gold border, cusped
 * arch detail, swaying apex bell and corner filigree. Portrait-oriented,
 * like a royal invitation card.
 */
export function ArchPanel({ accent, children }: { accent: string; children: ReactNode }) {
  return (
    <div className="relative w-[min(92vw,440px)]">
      <div
        className="relative rounded-t-full border bg-black/25 shadow-2xl backdrop-blur-[2px]"
        style={{ borderColor: `${accent}80`, boxShadow: `0 30px 80px -30px #000c, 0 0 40px -18px ${accent}66` }}
      >
        <div
          className="pointer-events-none absolute inset-2 rounded-t-full border"
          style={{ borderColor: `${accent}45` }}
        />
        <CuspArch accent={accent} />
        <ApexBell accent={accent} />
        <Filigree accent={accent} />
        <Filigree accent={accent} flip />
        <div className="relative px-6 pb-10 pt-28 sm:px-9">{children}</div>
      </div>
    </div>
  )
}

/* -------------------------------- diyas -------------------------------- */

/** A glowing oil lamp with a flickering flame. */
export function Diya({ delay = 0 }: { delay?: number }) {
  return (
    <div className="relative" aria-hidden="true">
      <svg width="44" height="40" viewBox="0 0 44 40">
        {/* glow */}
        <motion.circle
          cx="22"
          cy="14"
          r="10"
          fill="#FFC93C"
          style={{ filter: 'blur(7px)' }}
          animate={{ opacity: [0.35, 0.7, 0.45, 0.7, 0.35], scale: [1, 1.15, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay }}
        />
        {/* flame */}
        <motion.path
          d="M22 4 C 26 10 27 14 22 18 C 17 14 18 10 22 4 Z"
          fill="#FFD95E"
          stroke="#F5A623"
          strokeWidth="0.8"
          style={{ transformOrigin: '22px 18px' }}
          animate={{ scaleY: [1, 1.18, 0.94, 1.1, 1], skewX: [0, 3, -3, 2, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay }}
        />
        {/* bowl */}
        <path d="M6 24 q 16 12 32 0 l -3 6 q -13 8 -26 0 Z" fill="#7A3B22" />
        <path d="M6 24 q 16 12 32 0" fill="none" stroke="#C9A227" strokeWidth="1.6" />
      </svg>
    </div>
  )
}

/** A centered row of diyas. */
export function DiyaRow({ count = 3 }: { count?: number }) {
  return (
    <div className="flex items-end justify-center gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <Diya key={i} delay={i * 0.5} />
      ))}
    </div>
  )
}

/* ---------------------------- letter reveal ---------------------------- */

/** Gold-foil heading that reveals letter by letter with a blur-in. */
export function LetterReveal({
  text,
  className = '',
  delay = 0.5,
  step = 0.07,
}: {
  text: string
  className?: string
  delay?: number
  step?: number
}) {
  // Group letters into per-word spans so a line never breaks mid-word: each
  // word stays whole (whitespace-nowrap) and lines break only at the spaces
  // between words. `i` keeps the reveal stagger continuous across words.
  const words = text.split(' ')
  let i = 0
  return (
    <span className={className} aria-label={text}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className="inline-block whitespace-nowrap">
            {[...word].map((ch) => {
              const idx = i++
              return (
                <motion.span
                  key={idx}
                  className="gold-text inline-block"
                  initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: delay + idx * step, duration: 0.55, ease: 'easeOut' }}
                  aria-hidden="true"
                >
                  {ch}
                </motion.span>
              )
            })}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  )
}
