import type { MarketLinks } from '@/types/market'
import { siteConfig, locationLine } from '@/config/site'

interface FooterProps {
  links: MarketLinks
}

export function Footer({ links }: FooterProps) {
  const mapsUrl = siteConfig.location.mapsUrl
  const instagram = links.instagram
  const mainSite = links.mainSite
  const address = locationLine()

  return (
    <footer id="footer" className="border-t border-line bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-10">
          <div className="flex items-start gap-3">
            <img
              src={siteConfig.brand.logoSrc}
              alt=""
              className="h-10 w-10 rounded-[8px] object-cover shrink-0 ring-1 ring-line"
            />
            <div>
              <p className="font-display text-lg font-bold tracking-tight text-fg mb-1">
                FACE <span className="text-accent">ID</span>
              </p>
              <p className="text-sm text-fg-muted max-w-xs leading-relaxed">
                Servicio técnico especializado
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            {address ? (
              mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg-muted hover:text-fg transition-colors"
                >
                  {address}
                </a>
              ) : (
                <p className="text-fg-muted">{address}</p>
              )
            ) : null}
            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg-muted hover:text-fg transition-colors"
              >
                Instagram
              </a>
            ) : null}
            {mainSite ? (
              <a
                href={mainSite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg-muted hover:text-fg transition-colors"
              >
                tiendafaceid.com
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 border-t border-line text-xs text-fg-subtle">
          <p>Disponibilidad actualizada al {new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          <p>&copy; {new Date().getFullYear()} {siteConfig.brand.name}</p>
        </div>
      </div>
    </footer>
  )
}
