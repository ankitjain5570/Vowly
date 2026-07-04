import { useId } from 'react'
import type { FunctionTheme } from '../wedding.config'

/**
 * Subtle repeating SVG background patterns, tinted with the section's theme
 * color. Rendered as an absolutely-positioned layer behind section content.
 */

interface PatternProps {
  color: string
  opacity?: number
}

function PatternLayer({
  color,
  opacity = 0.06,
  tile,
  size,
}: PatternProps & { tile: React.ReactNode; size: number }) {
  // useId keeps pattern defs unique when the same motif appears in two sections
  const id = useId()
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity }}
    >
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth="1.2">
            {tile}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

/** Concentric-circle mandala motif */
export function MandalaPattern(props: PatternProps) {
  return (
    <PatternLayer
      {...props}
      size={140}
      tile={
        <>
          <circle cx="70" cy="70" r="52" />
          <circle cx="70" cy="70" r="38" />
          <circle cx="70" cy="70" r="24" />
          <circle cx="70" cy="70" r="10" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6
            return (
              <line
                key={i}
                x1={70 + 24 * Math.cos(a)}
                y1={70 + 24 * Math.sin(a)}
                x2={70 + 52 * Math.cos(a)}
                y2={70 + 52 * Math.sin(a)}
              />
            )
          })}
        </>
      }
    />
  )
}

/** Teardrop paisley motif */
export function PaisleyPattern(props: PatternProps) {
  return (
    <PatternLayer
      {...props}
      size={120}
      tile={
        <>
          <path d="M60 18 C88 30 88 66 66 82 C46 96 26 84 28 66 C30 50 46 44 54 52 C62 60 56 72 48 70" />
          <path d="M60 18 C88 30 88 66 66 82" transform="translate(10 8) scale(0.45)" />
        </>
      }
    />
  )
}

/** Four-petal floral motif */
export function FloralPattern(props: PatternProps) {
  return (
    <PatternLayer
      {...props}
      size={90}
      tile={
        <>
          <path d="M45 20 C55 30 55 40 45 45 C35 40 35 30 45 20" />
          <path d="M70 45 C60 55 50 55 45 45 C50 35 60 35 70 45" />
          <path d="M45 70 C35 60 35 50 45 45 C55 50 55 60 45 70" />
          <path d="M20 45 C30 35 40 35 45 45 C40 55 30 55 20 45" />
          <circle cx="45" cy="45" r="3" />
        </>
      }
    />
  )
}

/** Mughal jaali (lattice) motif */
export function JaaliPattern(props: PatternProps) {
  return (
    <PatternLayer
      {...props}
      size={80}
      tile={
        <>
          <path d="M40 0 C52 14 68 26 80 40 C68 54 52 66 40 80 C28 66 12 54 0 40 C12 26 28 14 40 0" />
          <circle cx="40" cy="40" r="8" />
        </>
      }
    />
  )
}

/** Marigold bloom motif — ring of petals around a centre */
export function MarigoldPattern(props: PatternProps) {
  return (
    <PatternLayer
      {...props}
      size={110}
      tile={
        <>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4
            return (
              <circle
                key={i}
                cx={55 + 16 * Math.cos(a)}
                cy={55 + 16 * Math.sin(a)}
                r="7"
              />
            )
          })}
          <circle cx="55" cy="55" r="6" />
          <circle cx="55" cy="55" r="27" strokeDasharray="2 5" />
        </>
      }
    />
  )
}

const PATTERNS = {
  mandala: MandalaPattern,
  paisley: PaisleyPattern,
  floral: FloralPattern,
  jaali: JaaliPattern,
  marigold: MarigoldPattern,
} as const

/** Renders the pattern named in a function's theme config. */
export function BackgroundPattern({
  pattern,
  color,
  opacity,
}: {
  pattern: FunctionTheme['backgroundPattern']
  color: string
  opacity?: number
}) {
  const Pattern = PATTERNS[pattern]
  return <Pattern color={color} opacity={opacity} />
}
