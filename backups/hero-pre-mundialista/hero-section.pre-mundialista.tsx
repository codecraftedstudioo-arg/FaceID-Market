import { useState, useEffect, useRef } from 'react'

function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1500 }: {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const start = performance.now()
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * value))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration, hasAnimated])

  return <span ref={ref}>{prefix}{count.toLocaleString('es-AR')}{suffix}</span>
}

function scrollToPrecios() {
  const el = document.getElementById('precios')
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 80
  window.scrollTo({ top, behavior: 'smooth' })
}


export function HeroSection() {

  return (
    <>
    <section className="relative bg-[#0B0D0B] overflow-hidden">
      {/* Glow verde de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[8%] w-[55%] h-[70%] bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.10)_0%,transparent_65%)] blur-3xl" />
        <div className="absolute bottom-[-15%] left-[0%] w-[45%] h-[55%] bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.06)_0%,transparent_65%)] blur-3xl" />
        <div className="hidden lg:block absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Desktop: foto a la derecha, encuadrada en la clienta y fundida con el fondo */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-[50%] z-[1] overflow-hidden">
        <img
          src="/hero-store-cropped.jpg"
          alt="Cliente retirando su iPhone en el local"
          className="w-full h-full object-cover object-[42%_28%] [filter:contrast(1.06)_saturate(1.1)_brightness(1.02)]"
          loading="eager"
          fetchPriority="high"
        />
        {/* Fade hacia la izquierda (lado del texto) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D0B] via-[#0B0D0B]/55 to-transparent" />
        {/* Fades superior/inferior para fundir con el fondo */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0B0D0B] to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#0B0D0B]/60 to-transparent" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center">

          {/* Columna de texto */}
          <div className="lg:w-1/2 px-6 sm:px-10 lg:pl-16 xl:pl-24 lg:pr-10 pt-8 pb-10 lg:py-32 text-center lg:text-left flex flex-col items-center lg:items-start relative z-10">

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-5 leading-[1.05] tracking-tight animate-fadeSlideIn" style={{ animationDelay: '0.05s' }}>
              iPhones sellados.<br />
              Precio real.<br />
              <span className="text-green-400">Sin vueltas.</span>
            </h1>

            <p className="text-white/70 text-base sm:text-lg mb-8 max-w-md leading-relaxed animate-fadeSlideIn" style={{ animationDelay: '0.15s' }}>
              Stock disponible hoy. Pagás en dólares o pesos al tipo de cambio del día. Retiro inmediato en Buenos Aires.
            </p>

            {/* CTA */}
            <div className="animate-fadeSlideIn" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={scrollToPrecios}
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-9 py-4 text-base sm:text-lg transition-all cursor-pointer shadow-[0_0_40px_-6px_rgba(34,197,94,0.55)] hover:shadow-[0_0_50px_-4px_rgba(34,197,94,0.7)] hover:-translate-y-0.5"
              >
                Ver precios de hoy
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

          </div>

          {/* Spacer derecho — la imagen full-bleed va detrás (absolute) */}
          <div className="hidden lg:block lg:w-1/2" />
        </div>
      </div>

      {/* Mobile: imagen de la clienta full-bleed, fundida con el fondo, debajo del texto */}
      <div className="lg:hidden relative h-[320px] overflow-hidden">
        <img
          src="/hero-store-cropped.jpg"
          alt="Cliente retirando su iPhone en el local"
          className="w-full h-full object-cover object-[46%_32%] [filter:contrast(1.05)_saturate(1.08)] animate-heroImgIn"
        />
        {/* Fundido superior: blende con la zona del texto */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0B0D0B] to-transparent" />
        {/* Fundido inferior alto: sin corte visible con el fondo */}
        <div className="absolute inset-x-0 -bottom-px h-40 bg-gradient-to-t from-[#0B0D0B] from-10% via-[#0B0D0B]/70 via-55% to-transparent" />
        <div className="absolute inset-x-0 -bottom-px h-5 bg-[#0B0D0B]" />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0B0D0B] to-transparent z-[5] pointer-events-none" />
    </section>

    {/* Métricas inferiores — centradas debajo del hero */}
    <section className="relative py-10 sm:py-14 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D0B] via-[#070A07] to-[#0B0D0B]" />
      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <div className="flex flex-wrap justify-center gap-8 sm:gap-14 max-w-xs sm:max-w-lg mx-auto">
          <div className="text-center w-[calc(50%-1rem)] sm:w-auto">
            <div className="text-3xl font-bold text-[#F5F7FA] font-mono">
              <AnimatedNumber value={8000} prefix="+" />
            </div>
            <div className="text-[#6B7280] text-xs mt-1">equipos vendidos</div>
          </div>
          <div className="text-center w-[calc(50%-1rem)] sm:w-auto">
            <div className="text-3xl font-bold text-[#F5F7FA]">
              4.9<span className="text-amber-400 animate-star-twinkle ml-0.5 text-lg">★</span>
            </div>
            <div className="text-[#6B7280] text-xs mt-1">Google Reviews</div>
          </div>
          <div className="text-center w-[calc(50%-1rem)] sm:w-auto">
            <div className="text-3xl font-bold text-[#F5F7FA] font-mono">
              <AnimatedNumber value={20} prefix="+" />
            </div>
            <div className="text-[#6B7280] text-xs mt-1">años de experiencia</div>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}
