import { motion } from 'framer-motion'

/**
 * Ring-exchange scene — pure SVG + Framer Motion.
 *
 * Acts (seconds):
 *  0.0  rotating light rays + bokeh fade in
 *  0.2  both hands draw themselves as line-art, then fill with soft color
 *  1.9  bride's ring arcs down, lands 3.0 → flash, shockwave rings, sparkles
 *  3.6  groom's ring arcs down, lands 4.7 → same burst
 *  5.3  hands ease together, a glowing heart blooms between them
 *  6.2  couple monogram (from config initials) rises above; petals & hearts
 *       float upward on an infinite loop
 *
 * `play` starts the sequence; remount (change key) to replay.
 */

const GOLD = '#C9A227'
const GOLD_DEEP = '#8C6D12'
const GOLD_LIGHT = '#F5E08A'
const ROSE = '#B76E79'
const HENNA = '#A34D5F'

// One elegant hand silhouette, wrist left → fingertips right (local coords).
const HAND_PATH = `M58 150
C 88 141, 116 136, 140 133
C 152 129, 164 125, 178 122
C 198 114, 218 107, 236 105
C 245 104, 248 111, 241 115
C 225 122, 209 128, 195 133
C 214 130, 233 127, 251 127
C 260 127, 261 135, 252 138
C 233 141, 214 143, 198 146
C 214 147, 230 150, 244 154
C 252 157, 249 165, 241 164
C 225 161, 210 158, 197 158
C 207 162, 217 167, 225 173
C 230 178, 225 185, 218 182
C 206 175, 194 170, 183 167
C 167 172, 150 175, 133 176
C 121 186, 108 191, 97 187
C 89 184, 90 176, 98 173
C 84 173, 70 172, 58 170
Z`

// Ring landing points in world coords (see group transforms below)
const RING1 = { x: 202, y: 171.5 } // bride: local (212,151.5) + (-10,20)
const RING2 = { x: 278, y: 211.5 } // groom: mirrored via translate(490,60) scale(-1,1)

const T = {
  draw: 0.2,
  ring1: 1.9,
  burst1: 3.0,
  ring2: 3.6,
  burst2: 4.7,
  together: 5.3,
  heart: 5.8,
  monogram: 6.4,
  ambient: 6.2,
}

/* ------------------------------- pieces ------------------------------- */

function LightRays({ play }: { play: boolean }) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={play ? { opacity: 1 } : undefined}
      transition={{ duration: 1.5 }}
    >
      <motion.g
        animate={play ? { rotate: 360 } : undefined}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '240px', originY: '190px' }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            d="M240 190 L228 -60 L252 -60 Z"
            fill={GOLD}
            opacity="0.05"
            transform={`rotate(${i * 30} 240 190)`}
          />
        ))}
      </motion.g>
      {/* soft bokeh orbs */}
      {[
        [60, 80, 16],
        [420, 70, 12],
        [70, 300, 12],
        [410, 300, 18],
        [240, 40, 9],
      ].map(([cx, cy, r], i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill={ROSE}
          opacity="0.1"
          style={{ filter: 'blur(5px)' }}
          animate={play ? { cy: [cy, cy - 14, cy], opacity: [0.08, 0.16, 0.08] } : undefined}
          transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </motion.g>
  )
}

function Hand({
  play,
  bride,
  transform,
  togetherX,
}: {
  play: boolean
  bride: boolean
  transform: string
  togetherX: number
}) {
  const skin = bride ? '#FBE3D0' : '#EDCBA8'
  const line = bride ? '#C08A66' : '#A87D52'
  return (
    <motion.g
      initial={{ x: 0 }}
      animate={play ? { x: togetherX } : undefined}
      transition={{ duration: 0.9, delay: T.together, ease: 'easeInOut' }}
    >
      <g transform={transform}>
        {/* sleeve */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={play ? { opacity: 1 } : undefined}
          transition={{ duration: 0.8, delay: T.draw + 0.9 }}
        >
          {bride ? (
            <>
              <rect x="-34" y="132" width="100" height="52" rx="12" fill="#F3C6CD" stroke={ROSE} strokeWidth="1.5" />
              <path d="M64 134 v48" stroke={ROSE} strokeWidth="1.2" />
              <rect x="70" y="132" width="5" height="50" rx="2.5" fill={GOLD} />
              <rect x="78" y="134" width="4" height="46" rx="2" fill={GOLD_LIGHT} />
              <rect x="85" y="135" width="4" height="44" rx="2" fill={GOLD} />
            </>
          ) : (
            <>
              <rect x="-34" y="132" width="100" height="52" rx="12" fill="#6B1F2F" stroke="#4A121F" strokeWidth="1.5" />
              <rect x="62" y="130" width="11" height="56" rx="4" fill={GOLD_LIGHT} stroke={GOLD} strokeWidth="1" />
              <circle cx="67" cy="158" r="2.2" fill={GOLD_DEEP} />
            </>
          )}
        </motion.g>

        {/* hand: draws as line-art, then fills */}
        <motion.path
          d={HAND_PATH}
          stroke={line}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill={skin}
          initial={{ pathLength: 0, fillOpacity: 0, opacity: 1 }}
          animate={play ? { pathLength: 1, fillOpacity: 0.95 } : undefined}
          transition={{
            pathLength: { duration: 1.6, delay: T.draw, ease: 'easeInOut' },
            fillOpacity: { duration: 0.9, delay: T.draw + 1.3 },
          }}
        />

        {/* mehendi line-art on the bride's hand */}
        {bride && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={play ? { opacity: 1 } : undefined}
            transition={{ duration: 0.9, delay: T.draw + 1.5 }}
          >
            <circle cx="126" cy="152" r="10" fill="none" stroke={HENNA} strokeWidth="1" strokeDasharray="2.5 2.5" />
            <circle cx="126" cy="152" r="3.6" fill="none" stroke={HENNA} strokeWidth="1" />
            <path d="M104 142 q 8 -7 15 -1" fill="none" stroke={HENNA} strokeWidth="1" />
            <path d="M106 164 q 8 7 15 1" fill="none" stroke={HENNA} strokeWidth="1" />
            {[150, 158, 166].map((cx, i) => (
              <circle key={cx} cx={cx} cy={136 - i * 2} r="1.2" fill={HENNA} />
            ))}
          </motion.g>
        )}
      </g>
    </motion.g>
  )
}

function Ring({ x, y, delay, play }: { x: number; y: number; delay: number; play: boolean }) {
  return (
    <motion.g
      initial={{ x: 0, y: -230, scale: 1.7, rotate: 30, opacity: 0 }}
      animate={
        play
          ? {
              x: [40, -34, 0],
              y: [-230, -100, 0],
              scale: [1.7, 1.3, 1],
              rotate: [30, -14, 0],
              opacity: [0, 1, 1],
            }
          : undefined
      }
      transition={{ duration: 1.1, delay, ease: 'easeInOut', times: [0, 0.55, 1] }}
    >
      {/* band with gradient + inner highlight */}
      <circle cx={x} cy={y} r="10" fill="none" stroke="url(#rx-gold)" strokeWidth="4.5" />
      <path
        d={`M${x - 7} ${y - 6} A 9.2 9.2 0 0 1 ${x + 5} ${y - 7.5}`}
        fill="none"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* faceted gem */}
      <g>
        <path d={`M${x} ${y - 20} l5.5 5.5 -5.5 6.5 -5.5 -6.5 Z`} fill={GOLD_LIGHT} stroke={GOLD_DEEP} strokeWidth="0.9" />
        <path d={`M${x - 5.5} ${y - 14.5} h11 l-5.5 6.5 Z`} fill="#fff" opacity="0.45" />
        {/* gem flare */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={play ? { scale: [0, 1, 0.6, 1], opacity: [0, 1, 0.5, 0.9] } : undefined}
          transition={{ duration: 2.4, delay: delay + 1.3, repeat: Infinity, repeatDelay: 1.6 }}
          style={{ originX: `${x}px`, originY: `${y - 15}px` }}
        >
          <path
            d={`M${x} ${y - 24} v5 M${x} ${y - 11} v5 M${x - 9} ${y - 15} h5 M${x + 4} ${y - 15} h5`}
            stroke="#fff"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </motion.g>
      </g>
    </motion.g>
  )
}

function LandingBurst({ x, y, delay, play }: { x: number; y: number; delay: number; play: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* white flash */}
      <motion.circle
        r="6"
        fill="#fff"
        initial={{ opacity: 0 }}
        animate={play ? { opacity: [0, 0.9, 0], scale: [0.4, 1.6, 2] } : undefined}
        transition={{ duration: 0.5, delay }}
      />
      {/* two expanding shockwave rings */}
      {[0, 0.18].map((extra, i) => (
        <motion.circle
          key={i}
          r="8"
          fill="none"
          stroke={i ? GOLD_LIGHT : GOLD}
          strokeWidth={i ? 1 : 1.8}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={play ? { opacity: [0, 0.8, 0], scale: [0.4, 3.4 + i, 4.4 + i] } : undefined}
          transition={{ duration: 1.1, delay: delay + extra, ease: 'easeOut' }}
        />
      ))}
      {/* sparkle particles */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 2 * Math.PI) / 12 + 0.4
        const dist = 30 + (i % 3) * 10
        return (
          <motion.path
            key={i}
            d="M0 -4.5 L2.8 0 L0 4.5 L-2.8 0 Z"
            fill={i % 2 ? GOLD : GOLD_LIGHT}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={
              play
                ? {
                    x: Math.cos(a) * dist,
                    y: Math.sin(a) * dist,
                    scale: [0, 1.25, 0.2],
                    opacity: [0, 1, 0],
                    rotate: 120,
                  }
                : undefined
            }
            transition={{ duration: 0.95, delay: delay + 0.06, ease: 'easeOut' }}
          />
        )
      })}
    </g>
  )
}

function HeartBloom({ play }: { play: boolean }) {
  return (
    <g transform="translate(240 186)">
      <motion.circle
        r="20"
        fill="#D98A96"
        style={{ filter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={play ? { opacity: [0, 0.5, 0.35] } : undefined}
        transition={{ duration: 1.2, delay: T.heart }}
      />
      <motion.path
        d="M0 5 C -11 -7 -24 4 0 20 C 24 4 11 -7 0 5 Z"
        fill="#C75B6E"
        stroke="#fff"
        strokeWidth="0.8"
        initial={{ scale: 0, opacity: 0 }}
        animate={play ? { scale: [0, 1.25, 1], opacity: 1 } : undefined}
        transition={{ duration: 0.7, delay: T.heart, ease: 'backOut' }}
      />
      <motion.path
        d="M0 5 C -11 -7 -24 4 0 20 C 24 4 11 -7 0 5 Z"
        fill="#C75B6E"
        initial={{ scale: 1, opacity: 0 }}
        animate={play ? { scale: [1, 1.14, 1], opacity: [0, 0.9, 0.9] } : undefined}
        transition={{ duration: 2.2, delay: T.heart + 0.7, repeat: Infinity, ease: 'easeInOut' }}
      />
    </g>
  )
}

function AmbientFloat({ play }: { play: boolean }) {
  return (
    <g transform="translate(240 180)">
      {Array.from({ length: 8 }).map((_, i) => {
        const x0 = -70 + i * 20
        const heart = i % 2 === 0
        return (
          <motion.g
            key={i}
            initial={{ x: x0, y: 26, opacity: 0, scale: 0.6 }}
            animate={
              play
                ? {
                    y: [26, -80, -130],
                    x: [x0, x0 + (i % 3 === 0 ? 16 : -13), x0],
                    opacity: [0, 0.85, 0],
                    scale: [0.6, 1, 0.8],
                    rotate: heart ? 0 : [0, 45, -25],
                  }
                : undefined
            }
            transition={{
              duration: 3.8,
              delay: T.ambient + i * 0.5,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: 'easeInOut',
            }}
          >
            {heart ? (
              <path d="M0 3 C -6 -4 -13 2 0 11 C 13 2 6 -4 0 3 Z" fill="#D98A96" opacity="0.9" />
            ) : (
              <ellipse rx="4" ry="7" fill={GOLD_LIGHT} opacity="0.9" />
            )}
          </motion.g>
        )
      })}
    </g>
  )
}

/* -------------------------------- scene -------------------------------- */

export function RingExchange({
  play,
  initials,
  primary,
}: {
  play: boolean
  initials: [string, string]
  primary: string
}) {
  return (
    <div style={{ perspective: 900 }}>
      <motion.svg
        viewBox="0 0 480 360"
        role="img"
        aria-label="Animated ring exchange between the bride and groom"
        className="mx-auto w-full max-w-xl"
        initial={{ rotateX: 8, opacity: 0 }}
        animate={play ? { rotateX: 0, opacity: 1 } : undefined}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <defs>
          <linearGradient id="rx-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={GOLD_LIGHT} />
            <stop offset="55%" stopColor={GOLD} />
            <stop offset="100%" stopColor={GOLD_DEEP} />
          </linearGradient>
        </defs>

        <LightRays play={play} />

        {/* monogram from config initials */}
        <motion.g
          initial={{ opacity: 0, y: 16 }}
          animate={play ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, delay: T.monogram, ease: 'easeOut' }}
        >
          <text
            x="240"
            y="52"
            textAnchor="middle"
            fontFamily="'Cormorant Garamond', Georgia, serif"
            fontStyle="italic"
            fontSize="34"
            fill={primary}
          >
            {initials[0]}
            <tspan fill={GOLD} fontSize="26">
              {' '}
              &amp;{' '}
            </tspan>
            {initials[1]}
          </text>
          <path d="M150 64 q 30 10 60 4 M330 64 q -30 10 -60 4" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.7" />
        </motion.g>

        {/* gentle joint breathing */}
        <motion.g
          animate={play ? { y: [0, -4, 0] } : undefined}
          transition={{ duration: 4.5, delay: T.ambient, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* bride: upper-left, fingers reaching right */}
          <Hand play={play} bride transform="translate(-10 20)" togetherX={12} />
          {/* groom: mirrored from the right, slightly lower */}
          <Hand play={play} bride={false} transform="translate(490 60) scale(-1 1)" togetherX={-12} />

          {/* rings ride along with their hand during the final coming-together */}
          <motion.g
            animate={play ? { x: 12 } : undefined}
            transition={{ duration: 0.9, delay: T.together, ease: 'easeInOut' }}
          >
            <Ring x={RING1.x} y={RING1.y} delay={T.ring1} play={play} />
            <LandingBurst x={RING1.x} y={RING1.y} delay={T.burst1} play={play} />
          </motion.g>
          <motion.g
            animate={play ? { x: -12 } : undefined}
            transition={{ duration: 0.9, delay: T.together, ease: 'easeInOut' }}
          >
            <Ring x={RING2.x} y={RING2.y} delay={T.ring2} play={play} />
            <LandingBurst x={RING2.x} y={RING2.y} delay={T.burst2} play={play} />
          </motion.g>

          <HeartBloom play={play} />
          <AmbientFloat play={play} />
        </motion.g>
      </motion.svg>
    </div>
  )
}
