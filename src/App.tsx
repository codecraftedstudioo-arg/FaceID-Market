import { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { PriceTable } from '@/components/price-table'
import { Footer } from '@/components/footer'
import { StickyMobileCTA } from '@/components/sticky-mobile-cta'
import { WhatsAppFloat } from '@/components/whatsapp-float'
import { getInitialData, fetchMarketPrices, isPanelConfigured } from '@/lib/market-api'
import { getSiteLinks, siteConfig } from '@/config/site'
import type { MarketPricing } from '@/types/market'

const RETRY_DELAYS_MS = [1500, 3000, 6000]

export default function App() {
  const [data, setData] = useState<MarketPricing>(getInitialData)
  const [loadError, setLoadError] = useState<string | null>(null)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    const load = (attempt = 0) => {
      fetchMarketPrices()
        .then((fresh) => {
          if (mountedRef.current) {
            setData(fresh)
            setLoadError(null)
          }
        })
        .catch(() => {
          if (!mountedRef.current) return
          const delay = RETRY_DELAYS_MS[attempt]
          if (delay !== undefined) {
            retryTimeoutRef.current = setTimeout(() => load(attempt + 1), delay)
          } else if (isPanelConfigured()) {
            // Panel configurado y agotados los reintentos: no fingir datos viejos.
            setData((prev) => ({ ...prev, models: [] }))
            setLoadError('No pudimos cargar los precios. Intentá de nuevo en unos minutos.')
          }
        })
    }
    load()
    return () => {
      mountedRef.current = false
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const POLL_MS = 30_000
    const tick = () => {
      if (document.hidden) return
      fetchMarketPrices(true)
        .then((fresh) => {
          if (mountedRef.current) {
            setData(fresh)
            setLoadError(null)
          }
        })
        .catch(() => {
          /* silencioso en poll: el load inicial ya maneja error de panel */
        })
    }
    const id = setInterval(tick, POLL_MS)
    const onVisible = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const loading = data.models.length === 0 && !loadError
  const links = getSiteLinks()
  const availableCount = data.models.reduce((n, model) => {
    return n + model.variants.filter((v) => v.inStock !== false && v.priceUSD > 0).length
  }, 0)

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header links={links} />
      <main>
        <HeroSection
          modelCount={data.models.length}
          availableCount={availableCount}
        />
        <PriceTable
          models={data.models}
          accessories={data.accessories}
          loading={loading}
          error={loadError}
        />
      </main>
      <Footer links={links} />
      <StickyMobileCTA
        watchAnchorId="precios"
        hideOnAnchorId="footer"
        productLabel={siteConfig.brand.shortName}
        priceText={
          data.models.length > 0
            ? `${data.models.length} modelos disponibles`
            : 'Catálogo FACE ID'
        }
        ctaText="Ver catálogo"
        onClick={() => document.getElementById('precios')?.scrollIntoView({ behavior: 'smooth' })}
      />
      <WhatsAppFloat />
    </div>
  )
}
