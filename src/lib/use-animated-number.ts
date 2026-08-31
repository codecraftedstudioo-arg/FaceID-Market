import { useEffect, useRef, useState } from 'react'

/**
 * Anima suavemente un número entre el valor previo y el nuevo target.
 * Útil para precios que cambian (variant switch, live updates).
 *
 * @param target valor final
 * @param duration ms (default 400)
 * @returns número interpolado (entero) que va actualizándose hasta llegar al target
 */
export function useAnimatedNumber(target: number, duration = 400): number {
  const [display, setDisplay] = useState(target)
  const displayRef = useRef(target)

  // Mantener ref siempre con el último display visible
  useEffect(() => {
    displayRef.current = display
  })

  useEffect(() => {
    if (target === displayRef.current) return
    const from = displayRef.current
    const start = performance.now()
    let raf = 0

    const tick = (t: number) => {
      const progress = Math.min((t - start) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(from + (target - from) * eased)
      setDisplay(current)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}
