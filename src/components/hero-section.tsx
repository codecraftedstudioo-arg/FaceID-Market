import { siteConfig } from '@/config/site'

function scrollToPrecios() {
  const el = document.getElementById('precios')
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 80
  window.scrollTo({ top, behavior: 'smooth' })
}


export function HeroSection() {

  return (
    <section className="relative bg-bg dark:bg-[#0B0D0B] overflow-hidden">
      {/* Ambiance de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Light: base sutil gris-azul arriba que funde a blanco (evita el plano) */}
        <div className="absolute inset-0 dark:hidden bg-[linear-gradient(180deg,#eef2f8_0%,var(--bg)_46%)]" />
        {/* Halo detrás del texto — azul Apple en claro, verde de marca en oscuro */}
        <div className="absolute top-[-12%] left-[-6%] w-[52%] h-[80%] bg-[radial-gradient(ellipse_at_center,rgba(0,113,227,0.12)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.13)_0%,transparent_60%)] blur-3xl" />
        {/* Glows de marca */}
        <div className="absolute top-[-20%] right-[8%] w-[55%] h-[70%] bg-[radial-gradient(ellipse_at_center,rgba(0,113,227,0.09)_0%,transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.10)_0%,transparent_65%)] blur-3xl" />
        <div className="absolute bottom-[-15%] left-[0%] w-[45%] h-[55%] bg-[radial-gradient(ellipse_at_center,rgba(0,113,227,0.05)_0%,transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.06)_0%,transparent_65%)] blur-3xl" />
        <div className="hidden lg:block absolute inset-0 opacity-0 dark:opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Desktop: banner completo a la derecha (sin recorte ni degradé encima para no perder el copy) */}
      <div className="hidden lg:flex absolute inset-y-0 right-0 w-[58%] z-[1] items-center justify-start pl-0 pr-8 xl:pr-12">
        <img
          src={siteConfig.assets.heroImage}
          alt={siteConfig.assets.heroAlt}
          className="block w-full h-auto rounded-xl"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center">

          {/* Columna de texto */}
          <div className="lg:w-1/2 px-6 sm:px-10 lg:pl-16 xl:pl-24 lg:pr-10 pt-4 pb-4 lg:py-32 text-center lg:text-left flex flex-col items-center lg:items-start relative z-10">

            <h1 className="text-[1.9rem] sm:text-4xl lg:text-6xl xl:text-7xl font-extrabold text-fg mb-3.5 sm:mb-5 leading-[1.05] tracking-tight animate-fadeSlideIn" style={{ animationDelay: '0.05s' }}>
              iPhones sellados.<br />
              Precio real.<br />
              <span className="text-accent">Sin vueltas.</span>
            </h1>

            <p className="text-fg-muted text-[0.95rem] sm:text-lg mb-5 sm:mb-8 max-w-md leading-relaxed animate-fadeSlideIn" style={{ animationDelay: '0.15s' }}>
              Stock disponible hoy. Pagás en dólares o pesos al tipo de cambio del día. Retiro inmediato en {siteConfig.location.city}.
            </p>

            {/* CTA */}
            <div className="animate-fadeSlideIn" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={scrollToPrecios}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-full px-8 sm:px-9 py-3.5 sm:py-4 text-base sm:text-lg transition-all cursor-pointer shadow-[0_0_40px_-6px_rgba(0,113,227,0.5)] hover:shadow-[0_0_50px_-4px_rgba(0,113,227,0.65)] dark:shadow-[0_0_40px_-6px_rgba(34,197,94,0.55)] dark:hover:shadow-[0_0_50px_-4px_rgba(34,197,94,0.7)] hover:-translate-y-0.5"
              >
                Ver precios de hoy
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

          </div>

          {/* Spacer derecho — la imagen va detrás (absolute) */}
          <div className="hidden lg:block lg:w-1/2" />
        </div>
      </div>

      {/* Mobile: la foto es lo más alto del hero, así que define cuánto hay que scrollear
          para llegar a los precios. 2/1 es bastante más panorámico que el 4/3 anterior:
          como la foto original es 3/2, object-cover recorta arriba y abajo (no a los
          costados) y la escena se sigue viendo completa de lado a lado. El foco vertical
          va en el centro del producto. */}
      <div className="lg:hidden pb-2">
        <div className="w-full aspect-[2/1] overflow-hidden animate-heroImgIn">
          <img
            src={siteConfig.assets.heroImage}
            alt={siteConfig.assets.heroAlt}
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      {/* Bottom fade — solo desktop. En mobile la foto va a sangre y abajo arranca la
          banda de reseñas, así que el degradado no funde nada: solo lava la base de la
          foto justo donde empiezan las reseñas. */}
      <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-bg dark:from-[#0B0D0B] to-transparent z-[5] pointer-events-none" />
    </section>
  )
}
