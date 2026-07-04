import { motion } from 'framer-motion'
import type { FunctionTheme } from '../wedding.config'

/**
 * Full ambient scenes for function sections, selected by `theme.decoration`
 * in the config. Each is a full-bleed, pointer-transparent layer:
 *
 *  - marigold-petals → Haldi: swaying marigold torans + turmeric dust + petals
 *  - henna-vine     → Mehendi: self-drawing peacock feathers + henna vines + leaves
 *  - gold-particles → Wedding: rotating mandala + rising sky lanterns + petal shower
 */

/** Deterministic pseudo-random in [0,1) so renders are stable across mounts. */
function prand(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/* ================================ HALDI ================================ */

function MarigoldBloom({ size, c1, c2 }: { size: number; c1: string; c2: string }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size}>
      {Array.from({ length: 8 }).map((_, p) => {
        const a = (p * Math.PI) / 4
        return (
          <circle
            key={p}
            cx={10 + 5.5 * Math.cos(a)}
            cy={10 + 5.5 * Math.sin(a)}
            r="3.6"
            fill={p % 2 ? c1 : c2}
          />
        )
      })}
      <circle cx="10" cy="10" r="3.2" fill={c2} />
    </svg>
  )
}

/** One hanging garland string of marigolds, swaying from its anchor. */
function ToranString({
  left,
  count,
  phase,
  c1,
  c2,
  leaf,
}: {
  left: number
  count: number
  phase: number
  c1: string
  c2: string
  leaf: string
}) {
  return (
    <motion.div
      className="absolute top-0 flex flex-col items-center"
      style={{ left: `${left}%`, transformOrigin: 'top center' }}
      animate={{ rotate: [-3.2, 3.2, -3.2] }}
      transition={{ duration: 4.5 + phase, repeat: Infinity, ease: 'easeInOut', delay: phase * 0.4 }}
    >
      <div className="h-5 w-px" style={{ backgroundColor: leaf }} />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="-mt-0.5 flex flex-col items-center">
          <MarigoldBloom size={i % 3 === 1 ? 26 : 20} c1={c1} c2={c2} />
          <svg viewBox="0 0 20 10" width="16" height="8">
            <path d="M2 5 Q 6 0 10 5 Q 14 10 18 5" fill="none" stroke={leaf} strokeWidth="1.6" />
          </svg>
        </div>
      ))}
      {/* small bell/drop at the end */}
      <svg viewBox="0 0 10 12" width="9" height="11">
        <path d="M5 0 C 9 4 9 8 5 11 C 1 8 1 4 5 0" fill={c2} />
      </svg>
    </motion.div>
  )
}

function TurmericDust({ color }: { color: string }) {
  return (
    <>
      {Array.from({ length: 16 }).map((_, i) => {
        const size = 2 + prand(i, 31) * 4
        return (
          <motion.span
            key={i}
            style={{
              position: 'absolute',
              left: `${prand(i, 32) * 100}%`,
              bottom: -8,
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: color,
              boxShadow: `0 0 ${size * 2}px ${color}`,
            }}
            animate={{ y: ['0vh', '-70vh'], x: [0, 20, -14, 0], opacity: [0, 0.8, 0] }}
            transition={{
              duration: 8 + prand(i, 33) * 7,
              delay: prand(i, 34) * 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </>
  )
}

function FallingPetals({ color, accent, count }: { color: string; accent: string; count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const size = 10 + prand(i, 2) * 12
        const sway = 20 + prand(i, 5) * 40
        return (
          <motion.svg
            key={i}
            viewBox="0 0 20 20"
            style={{
              position: 'absolute',
              left: `${prand(i, 1) * 100}%`,
              top: -30,
              width: size,
              height: size,
            }}
            animate={{ y: ['0vh', '110vh'], x: [0, sway, -sway * 0.5, 0], rotate: [0, 200, 360] }}
            transition={{
              duration: 9 + prand(i, 3) * 7,
              delay: prand(i, 4) * 9,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {Array.from({ length: 6 }).map((_, p) => {
              const a = (p * Math.PI) / 3
              return (
                <circle
                  key={p}
                  cx={10 + 5 * Math.cos(a)}
                  cy={10 + 5 * Math.sin(a)}
                  r="4"
                  fill={p % 2 ? color : accent}
                  opacity="0.75"
                />
              )
            })}
            <circle cx="10" cy="10" r="3" fill={color} />
          </motion.svg>
        )
      })}
    </>
  )
}

function HaldiScene({ primary, accent }: { primary: string; accent: string }) {
  // arch layout: long strings at the edges, short in the middle
  const strings = [
    { left: 4, count: 7 },
    { left: 15, count: 5 },
    { left: 27, count: 4 },
    { left: 49, count: 3 },
    { left: 71, count: 4 },
    { left: 83, count: 5 },
    { left: 94, count: 7 },
  ]
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {strings.map((s, i) => (
        <ToranString
          key={i}
          left={s.left}
          count={s.count}
          phase={prand(i, 41) * 2}
          c1={accent}
          c2={primary}
          leaf="#5C8A3C"
        />
      ))}
      <TurmericDust color={accent} />
      <FallingPetals color={accent} accent={primary} count={8} />
    </div>
  )
}

/* =============================== MEHENDI =============================== */

/** A peacock feather that draws itself barb by barb, then sways. */
function PeacockFeather({ className, sway }: { className: string; sway: number }) {
  const BARBS = 24
  return (
    <svg viewBox="0 0 200 340" className={className}>
      <motion.g
        animate={{ rotate: [sway, -sway, sway] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: 0.5, originY: 1 }}
      >
        {/* spine */}
        <motion.path
          d="M100 336 C 101 260, 98 170, 100 100"
          fill="none"
          stroke="#3E7C4F"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        />
        {/* barbs, fanning out and drawing in sequence */}
        {Array.from({ length: BARBS }).map((_, i) => {
          const t = i / (BARBS - 1)
          const y = 320 - t * 210
          const len = 24 + Math.sin(t * Math.PI * 0.85) * 42
          const rise = -(14 + t * 30)
          const color = i % 2 ? '#0E7C7B' : '#3E7C4F'
          const common = {
            fill: 'none',
            stroke: color,
            strokeWidth: 1.4,
            strokeLinecap: 'round' as const,
            initial: { pathLength: 0, opacity: 0 },
            animate: { pathLength: 1, opacity: 0.55 },
            transition: { duration: 0.5, delay: 0.5 + i * 0.055, ease: 'easeOut' as const },
          }
          return (
            <g key={i}>
              <motion.path d={`M100 ${y} q ${len * 0.55} ${rise * 0.35} ${len} ${rise}`} {...common} />
              <motion.path d={`M100 ${y} q ${-len * 0.55} ${rise * 0.35} ${-len} ${rise}`} {...common} />
            </g>
          )
        })}
        {/* the eye */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.9, ease: 'backOut' }}
          style={{ originX: '100px', originY: '80px' }}
        >
          <ellipse cx="100" cy="80" rx="30" ry="38" fill="#3E7C4F" opacity="0.9" />
          <ellipse cx="100" cy="82" rx="20" ry="27" fill="#0E7C7B" />
          <ellipse cx="100" cy="85" rx="12" ry="17" fill="#C9A227" />
          <ellipse cx="100" cy="88" rx="5.5" ry="8" fill="#1B3A5C" />
          {/* shimmer sweep */}
          <motion.ellipse
            cx="100"
            cy="80"
            rx="30"
            ry="38"
            fill="#fff"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2.6, delay: 3, repeat: Infinity, repeatDelay: 2.5 }}
          />
        </motion.g>
      </motion.g>
    </svg>
  )
}

/** Henna vine drawing itself along the section edges. */
function HennaVine({ color }: { color: string }) {
  const vine =
    'M20 0 C 45 60, -5 120, 25 180 C 55 240, 0 300, 30 360 C 60 420, 5 480, 30 540 C 55 600, 10 660, 30 720'
  const leaves = [80, 200, 320, 440, 560, 680]

  const side = (flip: boolean) => (
    <svg
      viewBox="0 0 60 720"
      preserveAspectRatio="xMidYMin meet"
      className={`absolute top-0 h-full w-10 sm:w-14 ${flip ? 'right-0 -scale-x-100' : 'left-0'}`}
    >
      <motion.path
        d={vine}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      />
      {leaves.map((y, i) => (
        <motion.path
          key={y}
          d={`M24 ${y} q 14 -6 22 6 q -14 8 -22 -6`}
          fill="none"
          stroke={color}
          strokeWidth="1.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 1.2, delay: 1 + i * 0.45, ease: 'easeOut' }}
        />
      ))}
    </svg>
  )

  return (
    <div className="absolute inset-0 opacity-60">
      {side(false)}
      {side(true)}
    </div>
  )
}

function FloatingLeaves({ color }: { color: string }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 24 12"
          style={{
            position: 'absolute',
            left: `${10 + prand(i, 51) * 80}%`,
            top: -20,
            width: 16 + prand(i, 52) * 10,
          }}
          animate={{ y: ['0vh', '108vh'], rotate: [0, 160, 320], x: [0, 30, -20, 0] }}
          transition={{
            duration: 13 + prand(i, 53) * 8,
            delay: prand(i, 54) * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <path d="M2 6 Q 8 0 14 3 Q 20 6 22 6 Q 16 12 10 9 Q 4 8 2 6" fill={color} opacity="0.5" />
        </motion.svg>
      ))}
    </>
  )
}

function MehendiScene({ primary }: { primary: string }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <HennaVine color={primary} />
      <PeacockFeather
        className="absolute -bottom-8 -left-6 h-[44vh] max-h-96 w-auto rotate-[16deg]"
        sway={2.5}
      />
      <PeacockFeather
        className="absolute -bottom-8 -right-6 h-[44vh] max-h-96 w-auto -scale-x-100 rotate-[-16deg]"
        sway={2}
      />
      <FloatingLeaves color={primary} />
    </div>
  )
}

/* =============================== WEDDING =============================== */

function petalArc(cx: number, cy: number, r1: number, r2: number, deg: number, halfDeg: number) {
  const a = (deg * Math.PI) / 180
  const w = (halfDeg * Math.PI) / 180
  const x1 = cx + r1 * Math.cos(a - w)
  const y1 = cy + r1 * Math.sin(a - w)
  const x2 = cx + r2 * Math.cos(a)
  const y2 = cy + r2 * Math.sin(a)
  const x3 = cx + r1 * Math.cos(a + w)
  const y3 = cy + r1 * Math.sin(a + w)
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q ${x2.toFixed(1)} ${y2.toFixed(1)} ${x3.toFixed(1)} ${y3.toFixed(1)}`
}

/** Giant slowly-rotating mandala behind the content. */
function RotatingMandala({ color }: { color: string }) {
  return (
    <motion.svg
      viewBox="0 0 400 400"
      className="absolute left-1/2 top-1/2 h-[100vmin] w-[100vmin] -translate-x-1/2 -translate-y-1/2"
      style={{ opacity: 0.1 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}
    >
      <g fill="none" stroke={color} strokeWidth="1">
        <circle cx="200" cy="200" r="58" />
        <circle cx="200" cy="200" r="116" />
        <circle cx="200" cy="200" r="180" strokeDasharray="3 6" />
        {Array.from({ length: 16 }).map((_, i) => (
          <path key={`p1-${i}`} d={petalArc(200, 200, 62, 112, i * 22.5, 9)} />
        ))}
        {Array.from({ length: 24 }).map((_, i) => (
          <path key={`p2-${i}`} d={petalArc(200, 200, 120, 176, i * 15, 6)} />
        ))}
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i * 10 * Math.PI) / 180
          return (
            <circle
              key={`d-${i}`}
              cx={200 + 190 * Math.cos(a)}
              cy={200 + 190 * Math.sin(a)}
              r="1.6"
              fill={color}
              stroke="none"
            />
          )
        })}
      </g>
    </motion.svg>
  )
}

/** Sky lanterns drifting upward with a warm flicker. */
function SkyLanterns() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => {
        const scale = 0.45 + prand(i, 61) * 0.75
        const sway = 14 + prand(i, 62) * 26
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: `${6 + prand(i, 63) * 88}%`,
              bottom: '-10%',
              scale,
              filter: 'drop-shadow(0 0 12px rgba(245,185,66,0.7))',
            }}
            animate={{ y: ['0vh', '-120vh'], x: [0, sway, -sway * 0.4, 0] }}
            transition={{
              duration: 17 + prand(i, 64) * 13,
              delay: prand(i, 65) * 15,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <motion.svg
              width="34"
              height="46"
              viewBox="0 0 34 46"
              animate={{ opacity: [0.75, 1, 0.82, 1, 0.75] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M7 5 h20 l4 28 q -14 11 -28 0 Z" fill="#F5B942" opacity="0.9" />
              <path d="M7 5 h20 l1.5 10 h-23 Z" fill="#E9A319" opacity="0.9" />
              <rect x="5" y="2" width="24" height="4" rx="2" fill="#C9A227" />
              <ellipse cx="17" cy="38" rx="6.5" ry="3" fill="#FFE9A8" />
            </motion.svg>
          </motion.div>
        )
      })}
    </>
  )
}

function GoldParticles({ color }: { color: string }) {
  return (
    <>
      {Array.from({ length: 20 }).map((_, i) => {
        const size = 2 + prand(i, 12) * 4
        return (
          <motion.span
            key={i}
            style={{
              position: 'absolute',
              left: `${prand(i, 11) * 100}%`,
              bottom: -10,
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: color,
              boxShadow: `0 0 ${size * 2.5}px ${color}`,
            }}
            animate={{ y: ['0vh', '-105vh'], opacity: [0, 0.9, 0.6, 0] }}
            transition={{
              duration: 7 + prand(i, 13) * 8,
              delay: prand(i, 14) * 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </>
  )
}

/** Rose/gold petals tumbling down with a faked 3D flip. */
function PetalShower() {
  const colors = ['#8C2B3D', '#C9A227', '#D98A96']
  return (
    <>
      {Array.from({ length: 9 }).map((_, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 16 22"
          style={{
            position: 'absolute',
            left: `${prand(i, 71) * 100}%`,
            top: -24,
            width: 10 + prand(i, 72) * 9,
          }}
          animate={{
            y: ['0vh', '112vh'],
            x: [0, 24, -18, 0],
            rotate: [0, 220, 360],
            scaleY: [1, 0.35, 1, 0.5, 1],
          }}
          transition={{
            duration: 10 + prand(i, 73) * 8,
            delay: prand(i, 74) * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <path
            d="M8 0 C 15 6 16 14 8 21 C 0 14 1 6 8 0"
            fill={colors[i % colors.length]}
            opacity="0.65"
          />
        </motion.svg>
      ))}
    </>
  )
}

function WeddingScene({ primary, accent }: { primary: string; accent: string }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <RotatingMandala color={primary} />
      <SkyLanterns />
      <GoldParticles color={accent} />
      <PetalShower />
    </div>
  )
}

/* ================================ EXPORT ================================ */

/** Renders the scene named in a function's theme config. */
export function SectionDecoration({
  decoration,
  primary,
  accent,
}: {
  decoration: FunctionTheme['decoration']
  primary: string
  accent: string
}) {
  switch (decoration) {
    case 'marigold-petals':
      return <HaldiScene primary={primary} accent={accent} />
    case 'henna-vine':
      return <MehendiScene primary={primary} />
    case 'gold-particles':
      return <WeddingScene primary={primary} accent={accent} />
    case 'none':
      return null
  }
}
