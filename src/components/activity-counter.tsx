import { useState, useEffect, useRef } from 'react'
import type { ActivityCounter as ActivityCounterType } from '@/types/market'

interface ActivityCounterProps {
  config: ActivityCounterType
}

export function ActivityCounter({ config }: ActivityCounterProps) {
  const target = config.baseCount + Math.floor(Math.random() * 15)
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return

    const duration = 1500
    const steps = 40
    const increment = target / steps
    const stepTime = duration / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(Math.round(increment * step), target)
      setCount(current)
      if (step >= steps) clearInterval(timer)
    }, stepTime)

    return () => clearInterval(timer)
  }, [visible, target])

  return (
    <section ref={ref} className="py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex flex-col items-center bg-fg/5 backdrop-blur border border-line rounded-2xl px-8 sm:px-16 py-8">
          <span className="text-4xl sm:text-6xl font-bold text-fg animate-countUp tabular-nums">
            {count.toLocaleString('es-AR')}
          </span>
          <span className="text-fg-muted text-sm sm:text-base mt-2">
            {config.label}
          </span>
        </div>
      </div>
    </section>
  )
}
