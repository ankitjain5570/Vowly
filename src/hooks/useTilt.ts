import { useEffect } from 'react'
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion'

/**
 * Parallax driver: returns spring-smoothed normalized coordinates in [-1, 1].
 * Sections derive 3D tilt (rotateX/rotateY) and depth-layer translations from
 * these via useTransform, each with its own multiplier.
 *
 * Desktop: driven by mouse position. Phones/tablets: driven by the gyroscope
 * (deviceorientation), so physically tilting the phone shifts the depth
 * layers. The first sensor reading becomes the neutral "holding" pose, so the
 * effect is relative to however the guest is holding their phone. iOS gates
 * the sensor behind a permission prompt — see requestTiltPermission().
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

    // ±18° of tilt from the neutral pose maps to the full [-1, 1] range.
    const TILT_RANGE = 18
    let baseBeta: number | null = null
    let baseGamma: number | null = null
    const clamp = (v: number) => Math.max(-1, Math.min(1, v))
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return
      if (baseBeta === null || baseGamma === null) {
        baseBeta = e.beta
        baseGamma = e.gamma
        return
      }
      nxRaw.set(clamp((e.gamma - baseGamma) / TILT_RANGE))
      nyRaw.set(clamp((e.beta - baseBeta) / TILT_RANGE))
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('deviceorientation', onOrient)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onOrient)
    }
  }, [nxRaw, nyRaw])

  return { nx, ny }
}

/**
 * iOS 13+ only fires deviceorientation after DeviceOrientationEvent
 * .requestPermission() resolves, and that call must come from a user gesture.
 * The entry book's opening tap calls this; everywhere else (Android, desktop)
 * it is a silent no-op.
 */
export function requestTiltPermission(): void {
  const doe = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<string>
  }
  doe.requestPermission?.().catch(() => {})
}
