import type { MarketLinks } from '@/types/market'
import { siteConfig } from '@/config/site'

const MAPS_URL = siteConfig.location.mapsUrl

interface FooterProps {
  links: MarketLinks
}

export function Footer({ links }: FooterProps) {
  return (
    <footer id="footer" className="border-t border-line bg-bg-subtle py-10">
      <div className="max-w-6xl mx-auto px-6">
        {/* Top row: Logo + Links + CTA */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          {/* Logo */}
          <a href={links.mainSite} target="_blank" rel="noopener noreferrer" className="block">
            <img
              src={siteConfig.brand.logoSrc}
              alt={siteConfig.brand.logoAlt}
              className="h-20 md:h-16 w-auto invert dark:invert-0"
            />
          </a>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href={links.mainSite} target="_blank" rel="noopener noreferrer"
               className="text-fg-subtle hover:text-fg transition-colors text-sm">
              Tienda online
            </a>
            <a href={links.instagram} target="_blank" rel="noopener noreferrer"
               className="text-fg-subtle hover:text-fg transition-colors text-sm">
              Instagram
            </a>
            <a href={links.sellYourIphone} target="_blank" rel="noopener noreferrer"
               className="text-fg-subtle hover:text-fg transition-colors text-sm">
              Cotizador
            </a>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
               className="text-fg-subtle hover:text-fg transition-colors text-sm">
              ¿Cómo llegar?
            </a>
          </div>

          {/* CTA */}
          <a
            href={links.mainSite}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-accent hover:bg-accent-hover transition-all"
          >
            Ver iPhones
          </a>
        </div>

        {/* Back to top */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-fg-subtle hover:text-fg transition-colors cursor-pointer flex flex-col items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-[10px] font-mono">VOLVER ARRIBA</span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-line pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-fg-subtle">
            <p>Precios actualizados al {new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
            <p>&copy; {new Date().getFullYear()} {siteConfig.brand.name}. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
