import { useState } from 'react'
import type { MarketLinks } from '@/types/market'
import { siteConfig } from '@/config/site'
import { ThemeToggle } from './theme-toggle'

const MAPS_URL = siteConfig.location.mapsUrl

interface HeaderProps {
  links: MarketLinks
}

export function Header({ links }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-bg/70 dark:bg-bg/95 backdrop-blur-xl border-b border-line">
      <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-16 py-2 flex items-center justify-between">
        {/* Logo (monocromático, fondo transparente y local): se invierte en light
            para quedar negro-sobre-blanco. Al ser transparente no deja recuadro
            sobre fondos no-blancos (footer gris). */}
        <div className="block overflow-visible">
          <img
            src={siteConfig.brand.logoSrc}
            alt={siteConfig.brand.logoAlt}
            className="h-[80px] w-[200px] sm:h-[90px] sm:w-[225px] lg:h-[105px] lg:w-[260px] max-w-none -ml-[45px] sm:-ml-[55px] md:-ml-[65px] invert dark:invert-0"
          />
        </div>

        {/* Nav Links - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollTo('como-funciona')}
            className="text-fg-muted hover:text-fg transition-colors text-sm cursor-pointer"
          >
            ¿Cómo funciona?
          </button>
          <a href={links.instagram} target="_blank" rel="noopener noreferrer"
             className="text-fg-muted hover:text-fg transition-colors text-sm">
            Instagram
          </a>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
             className="text-fg-muted hover:text-fg transition-colors text-sm">
            ¿Cómo llegar?
          </a>
          <a href={links.sellYourIphone} target="_blank" rel="noopener noreferrer"
             className="text-sm font-medium text-accent border border-accent/40 hover:border-accent hover:bg-accent/10 px-4 py-2 rounded-full transition-all">
            Cotizador
          </a>
          <ThemeToggle />
        </div>

        {/* Acciones mobile: toggle de tema + hamburguesa */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-xl bg-fg/5 border border-line flex flex-col items-center justify-center gap-[5px] hover:bg-fg/10 transition-all cursor-pointer group"
            aria-label="Menú"
          >
            <span className={`block h-[2px] rounded-full bg-fg transition-all duration-300 ${menuOpen ? 'w-5 rotate-45 translate-y-[7px]' : 'w-5 group-hover:w-4'}`} />
            <span className={`block h-[2px] rounded-full bg-fg transition-all duration-300 ${menuOpen ? 'w-0 opacity-0' : 'w-3.5'}`} />
            <span className={`block h-[2px] rounded-full bg-fg transition-all duration-300 ${menuOpen ? 'w-5 -rotate-45 -translate-y-[7px]' : 'w-5 group-hover:w-4'}`} />
          </button>
        </div>

        {/* CTA button - Desktop */}
        <a
          href={links.mainSite}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:block px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-accent hover:bg-accent-hover transition-all shadow-sm shadow-accent/20"
        >
          Tienda online
        </a>
      </div>

      {/* Mobile menu — dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-line bg-bg/95 dark:bg-gradient-to-b dark:from-black/95 dark:to-[#191919] backdrop-blur-xl">
          <div className="px-5 py-5 flex flex-col gap-1">
            <button
              onClick={() => scrollTo('como-funciona')}
              className="flex items-center gap-3 text-fg-muted hover:text-fg hover:bg-fg/5 text-sm text-left py-3 px-3 rounded-xl transition-all cursor-pointer"
            >
              <span className="w-8 h-8 rounded-lg bg-[#4A6BDB]/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#4A6BDB] dark:text-[#6B8AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </span>
              ¿Cómo funciona?
            </button>
            <button
              onClick={() => scrollTo('preguntas-frecuentes')}
              className="flex items-center gap-3 text-fg-muted hover:text-fg hover:bg-fg/5 text-sm text-left py-3 px-3 rounded-xl transition-all cursor-pointer"
            >
              <span className="w-8 h-8 rounded-lg bg-[#4A6BDB]/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#4A6BDB] dark:text-[#6B8AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </span>
              Preguntas frecuentes
            </button>

            <div className="h-px bg-line my-2 mx-3" />

            <a href={links.sellYourIphone} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-3 text-fg-muted hover:text-fg hover:bg-fg/5 text-sm py-3 px-3 rounded-xl transition-all">
              <span className="w-8 h-8 rounded-lg bg-[#D97A32]/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#D97A32]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Vendé tu iPhone
            </a>
            <a href={links.mainSite} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-3 text-fg-muted hover:text-fg hover:bg-fg/5 text-sm py-3 px-3 rounded-xl transition-all">
              <span className="w-8 h-8 rounded-lg bg-[#4A6BDB]/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#4A6BDB] dark:text-[#6B8AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.998 2.998 0 00.615-1.524L4.26 4.265A1.5 1.5 0 015.745 3h12.51a1.5 1.5 0 011.485 1.265l.645 3.56a2.998 2.998 0 00.615 1.524" />
                </svg>
              </span>
              Tienda online
            </a>
            <a href={links.instagram} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-3 text-fg-muted hover:text-fg hover:bg-fg/5 text-sm py-3 px-3 rounded-xl transition-all">
              <span className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-pink-500 dark:text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </span>
              Instagram
            </a>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-3 text-fg-muted hover:text-fg hover:bg-fg/5 text-sm py-3 px-3 rounded-xl transition-all">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </span>
              ¿Cómo llegar?
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
