import { useEffect } from 'react'
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion'

/**
 * Pointer-driven parallax: returns spring-smoothed normalized pointer
 * coordinates in [-1, 1]. Sections derive 3D tilt (rotateX/rotateY) and
 * depth-layer translations from these via useTransform, each with its own
 * multiplier. On touch devices (no pointermove) the values rest at 0 and
 * sections fall back to their ambient animations.
 */
export function useTilt(): { nx: MotionValue<number>; ny: MotionValue<number> } {
  const nxRaw = useMotionValue(0)
  const nyRaw = useMotionValue(0)
  const nx = useSpring(nxRaw, { stiffness: 45, damping: 14, mass: 0.6 })
  const ny = useSpring(nyRaw, { stiffness: 45, damping: 14, mass: 0.6 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      nxRaw.set((e.clientX / window.innerWidth) * 2 - 1)
      nyRaw.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [nxRaw, nyRaw])

  return { nx, ny }
}
