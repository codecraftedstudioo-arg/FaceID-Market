import { useState } from 'react'
import type { MarketLinks } from '@/types/market'
import { siteConfig } from '@/config/site'
import { ThemeToggle } from './theme-toggle'

interface HeaderProps {
  links: MarketLinks
}

function BrandMark() {
  return (
    <span className="flex items-center gap-2.5 min-w-0">
      <img
        src={siteConfig.brand.logoSrc}
        alt=""
        className="h-9 w-9 sm:h-10 sm:w-10 rounded-[8px] object-cover shrink-0 ring-1 ring-line"
      />
      <span className="flex items-baseline gap-2 min-w-0">
        <span className="font-display text-[16px] sm:text-[18px] font-bold tracking-tight text-fg leading-none">
          FACE <span className="text-accent">ID</span>
        </span>
        <span className="text-[13px] sm:text-sm font-medium text-fg-muted truncate">
          Market
        </span>
      </span>
    </span>
  )
}

export function Header({ links }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const mapsUrl = siteConfig.location.mapsUrl
  const instagram = links.instagram
  const mainSite = links.mainSite

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => scrollTo('precios')}
          className="block min-w-0 hover:opacity-80 transition-opacity cursor-pointer"
          aria-label="FACE ID Market"
        >
          <BrandMark />
        </button>

        <nav className="hidden md:flex items-center gap-6">
          <button
            type="button"
            onClick={() => scrollTo('precios')}
            className="text-sm text-fg-muted hover:text-fg transition-colors cursor-pointer"
          >
            Catálogo
          </button>
          {instagram ? (
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fg-muted hover:text-fg transition-colors"
            >
              Instagram
            </a>
          ) : null}
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fg-muted hover:text-fg transition-colors"
            >
              Cómo llegar
            </a>
          ) : null}
          {mainSite ? (
            <a
              href={mainSite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-accent-contrast bg-accent hover:bg-accent-hover px-4 py-2 rounded-[10px] transition-colors"
            >
              Sitio oficial
            </a>
          ) : null}
          <ThemeToggle />
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-[10px] border border-line flex flex-col items-center justify-center gap-[5px] hover:bg-fg/5 transition-colors cursor-pointer"
            aria-label="Menú"
            aria-expanded={menuOpen}
          >
            <span className={`block h-[1.5px] w-4 bg-fg transition-transform ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
            <span className={`block h-[1.5px] w-4 bg-fg transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-[1.5px] w-4 bg-fg transition-transform ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-line bg-surface">
          <div className="px-4 py-3 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => scrollTo('precios')}
              className="text-left text-sm text-fg py-3 px-3 rounded-[10px] hover:bg-fg/5 cursor-pointer"
            >
              Catálogo
            </button>
            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-fg py-3 px-3 rounded-[10px] hover:bg-fg/5"
                onClick={() => setMenuOpen(false)}
              >
                Instagram
              </a>
            ) : null}
            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-fg py-3 px-3 rounded-[10px] hover:bg-fg/5"
                onClick={() => setMenuOpen(false)}
              >
                Cómo llegar
              </a>
            ) : null}
            {mainSite ? (
              <a
                href={mainSite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-center text-accent-contrast bg-accent hover:bg-accent-hover rounded-[10px] py-3 mt-1"
                onClick={() => setMenuOpen(false)}
              >
                Sitio oficial
              </a>
            ) : null}
          </div>
        </div>
      )}
    </header>
  )
}
