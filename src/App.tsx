import { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { TradeInCompare } from '@/components/trade-in-compare'
import { PriceTable } from '@/components/price-table'
import { SellBanner } from '@/components/sell-banner'
import { HowItWorks } from '@/components/how-it-works'
import { WhyChooseUs } from '@/components/why-choose-us'
import { AdditionalServices } from '@/components/additional-services'
import { GoogleReviews } from '@/components/google-reviews'
import { StorePhotos } from '@/components/store-photos'
import { Faq } from '@/components/faq'
import { TickerTape } from '@/components/ticker-tape'
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

  // Auto-refresh: la vidriera muestra "precios en vivo", así que re-consultamos al
  // panel cada 30s para reflejar cambios del admin sin que el visitante recargue.
  // Pausa cuando la pestaña no está visible (no gastamos requests de fondo) y
  // refresca al instante al volver a ella.
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

  return (
    <div className="min-h-screen bg-bg text-fg">
      <TickerTape models={data.models} />
      <Header links={links} />
      <main>
        <HeroSection />
        <GoogleReviews />
        <PriceTable
          models={data.models}
          accessories={data.accessories}
          loading={loading}
          error={loadError}
        />
        <HowItWorks />
        <SellBanner storeUrl={links.mainSite} instagramUrl={links.instagram} />
        <WhyChooseUs />
        <AdditionalServices />
        <TradeInCompare cotizadorUrl={links.sellYourIphone} />
        <StorePhotos />
        <Faq />
      </main>
      <Footer links={links} />
      <StickyMobileCTA
        watchAnchorId="precios"
        hideOnAnchorId="footer"
        productLabel={siteConfig.brand.shortName}
        priceText={`+${data.models.length} modelos disponibles`}
        ctaText="Volvé a precios"
        onClick={() => document.getElementById('precios')?.scrollIntoView({ behavior: 'smooth' })}
      />
      <WhatsAppFloat />
    </div>
  )
}
