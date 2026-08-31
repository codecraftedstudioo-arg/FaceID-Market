interface TradeInCompareProps {
  cotizadorUrl: string
}

export function TradeInCompare({ cotizadorUrl }: TradeInCompareProps) {
  return (
    <section id="plan-canje" className="relative py-16 sm:py-20 px-4 sm:px-6 overflow-hidden scroll-mt-20">
      {/* Layered background for depth */}
      <div className="absolute inset-0 bg-bg-subtle dark:bg-gradient-to-b dark:from-[#191919] dark:via-[#070A10] dark:to-[#191919]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(74,107,219,0.07)_0%,transparent_65%)] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(74,107,219,0.04)_0%,transparent_65%)] blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">

        {/* ── Header ── */}
        <div className="text-center mb-12 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#4A6BDB] dark:text-[#6B8AED]/80 font-semibold tracking-widest uppercase mb-5">
            <span className="w-5 h-px bg-[#4A6BDB]/40 dark:bg-[#6B8AED]/40" />
            Plan Canje
            <span className="w-5 h-px bg-[#4A6BDB]/40 dark:bg-[#6B8AED]/40" />
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-fg leading-[1.15] tracking-tight mb-4">
            Usá tu iPhone como<br /> parte de pago
          </h2>
          <p className="text-fg-muted text-[15px] sm:text-base max-w-lg mx-auto leading-relaxed">
            Cotizalo en 1 minuto y te decimos cuánto te queda.
          </p>
        </div>

        {/* ── Steps ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-0 mb-12 sm:mb-14">

          {/* Step 1 */}
          <div className="relative group sm:pr-4">
            <div className="rounded-2xl sm:rounded-r-none border border-line dark:border-[#3F3F3F] sm:border-r-line dark:sm:border-r-[#3F3F3F]/40 bg-surface dark:bg-gradient-to-b dark:from-[#0A0E16] dark:to-[#202020] p-6 h-full">
              <div className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
                <div className="relative shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-bg-subtle dark:bg-[#0D1220] border border-line dark:border-[#3F3F3F] flex items-center justify-center sm:mb-1">
                    <img src="/iphones/iphone-15-blue.png" alt="" className="w-22 h-22 sm:w-24 sm:h-24 object-contain" />
                  </div>
                  <span className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#4A6BDB] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-[0_0_12px_rgba(74,107,219,0.5)]">
                    1
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-fg mb-1">Cotizá tu iPhone</h3>
                  <p className="text-xs sm:text-[13px] text-fg-muted leading-relaxed">Contestás unas preguntas y te decimos cuánto vale</p>
                </div>
              </div>
            </div>
            {/* Desktop connector */}
            <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-8 h-8 rounded-full bg-surface dark:bg-[#0A0E16] border border-line dark:border-[#3F3F3F] items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#4A6BDB]/70 dark:text-[#6B8AED]/60">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group sm:px-4">
            <div className="rounded-2xl sm:rounded-none border border-line dark:border-[#3F3F3F] sm:border-x-line dark:sm:border-x-[#3F3F3F]/40 bg-surface dark:bg-gradient-to-b dark:from-[#0A0E16] dark:to-[#202020] p-6 h-full">
              <div className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
                <div className="relative shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-bg-subtle dark:bg-[#0D1220] border border-line dark:border-[#3F3F3F] flex items-center justify-center sm:mb-1">
                    <img src="/iphones/iphone-17-pro-orange.png" alt="" className="w-22 h-22 sm:w-24 sm:h-24 object-contain" />
                  </div>
                  <span className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#4A6BDB] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-[0_0_12px_rgba(74,107,219,0.5)]">
                    2
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-fg mb-1">Elegí el nuevo</h3>
                  <p className="text-xs sm:text-[13px] text-fg-muted leading-relaxed">Elegís el modelo, color y almacenamiento</p>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-8 h-8 rounded-full bg-surface dark:bg-[#0A0E16] border border-line dark:border-[#3F3F3F] items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#4A6BDB]/70 dark:text-[#6B8AED]/60">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Step 3 — elevated */}
          <div className="relative group sm:pl-4">
            <div className="rounded-2xl sm:rounded-l-none border border-[#4A6BDB]/25 bg-surface dark:bg-gradient-to-b dark:from-[#0C1024] dark:to-[#0A0E18] p-6 h-full ring-1 ring-[#4A6BDB]/15 dark:ring-[#4A6BDB]/[0.08] shadow-sm dark:shadow-[inset_0_1px_0_rgba(107,138,237,0.06)]">
              <div className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
                <div className="relative shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#4A6BDB]/10 border border-[#4A6BDB]/20 flex items-center justify-center sm:mb-1">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#4A6BDB] dark:text-[#6B8AED] sm:w-12 sm:h-12">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <span className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#4A6BDB] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-[0_0_12px_rgba(74,107,219,0.5)]">
                    3
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-fg mb-1">Pagá la diferencia</h3>
                  <p className="text-xs sm:text-[13px] text-fg-muted leading-relaxed">Te decimos cuánto te queda pagar por el nuevo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA al cotizador con canje activado */}
        <div className="flex justify-center">
          <a
            href={`${cotizadorUrl}/cotizar?canje=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 w-full sm:max-w-md rounded-xl border border-accent/40 bg-accent/[0.08] p-4 hover:bg-accent/[0.15] hover:border-accent/60 transition-all shadow-[0_0_30px_-6px_rgba(0,113,227,0.28)] hover:shadow-[0_0_40px_-6px_rgba(0,113,227,0.4)] dark:shadow-[0_0_30px_-6px_rgba(34,197,94,0.3)] dark:hover:shadow-[0_0_40px_-6px_rgba(34,197,94,0.45)]"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-fg">Activar mi Plan Canje →</h3>
              <p className="text-fg-muted text-xs">Cotizá tu iPhone y usalo como parte de pago<br className="hidden sm:block" /> para tu nuevo equipo.</p>
            </div>
          </a>
        </div>

      </div>
    </section>
  )
}
