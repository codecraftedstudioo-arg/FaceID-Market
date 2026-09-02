import { siteConfig } from '@/config/site'

interface HeroSectionProps {
  /** Cantidad de modelos cargados desde FaceID-Admin. */
  modelCount?: number
  /** Variantes disponibles (stock + precio). */
  availableCount?: number
}

const LOCAL_PHOTO = '/brand/local-faceid.jpg'

function scrollToPrecios() {
  const el = document.getElementById('precios')
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 72
  window.scrollTo({ top, behavior: 'smooth' })
}

export function HeroSection({ modelCount = 0, availableCount = 0 }: HeroSectionProps) {
  const hasLiveData = modelCount > 0

  return (
    <section className="relative isolate overflow-hidden min-h-[620px] sm:min-h-[680px] lg:min-h-[740px] flex items-center justify-center">
      {/* Foto del local: cubre todo el hero. El blur solo aplica a esta capa. */}
      <img
        src={LOCAL_PHOTO}
        alt="Local FACE ID — Agüero 1649, CABA"
        className="absolute inset-0 w-full h-full object-cover object-center scale-[1.06] blur-[2px] sm:blur-[3px] pointer-events-none select-none"
        draggable={false}
      />

      {/* Overlay azul/gris oscuro: contraste para el texto, foto todavía reconocible. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[#0b1220]/55 sm:bg-[#0b1220]/50"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#111827]/70 via-[#1f2937]/35 to-[#0b1220]/75"
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
        <img
          src={siteConfig.brand.logoSrc}
          alt={siteConfig.brand.logoAlt}
          className="mx-auto mb-6 h-16 w-16 sm:h-20 sm:w-20 rounded-[12px] object-cover ring-1 ring-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
        />

        <p className="font-display text-xs sm:text-sm font-semibold tracking-[0.28em] uppercase text-white/80 mb-3">
          FACE <span className="text-accent">ID</span>
          <span className="mx-2 text-white/35">·</span>
          <span className="tracking-widest font-medium">Market</span>
        </p>

        <h1 className="font-display text-[2.15rem] sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08] mb-4 drop-shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
          iPhones disponibles
        </h1>

        <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-7">
          Equipos seleccionados y actualizados en tiempo real.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3.5 py-1.5 text-xs sm:text-sm text-white">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Disponibilidad actualizada
          </span>
          {hasLiveData ? (
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3.5 py-1.5 text-xs sm:text-sm text-white/85">
              {availableCount > 0
                ? `${availableCount} con stock · ${modelCount} modelos`
                : `${modelCount} modelos en catálogo`}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={scrollToPrecios}
          className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-accent-contrast font-semibold rounded-[10px] px-7 sm:px-8 py-3.5 text-sm sm:text-base min-h-12 transition-colors cursor-pointer shadow-[0_8px_24px_rgba(234,179,8,0.28)]"
        >
          Ver catálogo
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </section>
  )
}
