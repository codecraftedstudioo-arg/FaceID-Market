import { siteConfig } from '@/config/site'

function analyticsReady(): boolean {
  return siteConfig.analytics.enabled
}

export function trackPixel(...args: unknown[]): void {
  if (!analyticsReady()) return
  window.fbq?.(...args)
}

export function initPixelAdvancedMatching(pixelId: string, matchData: Record<string, string>): void {
  if (!analyticsReady() || !pixelId) return
  window.fbq?.('init', pixelId, matchData)
}

function injectMetaPixel(pixelId: string) {
  if (window.fbq) {
    window.fbq('init', pixelId)
    window.fbq('track', 'PageView')
    return
  }

  const fbq: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string } =
    function (...args: unknown[]) {
      ;(fbq.queue ||= []).push(args)
    }
  fbq.queue = []
  fbq.loaded = true
  fbq.version = '2.0'
  window.fbq = fbq

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)

  window.fbq('init', pixelId)
  window.fbq('track', 'PageView')
}

function injectClarity(clarityId: string) {
  const w = window as Window & { clarity?: (...args: unknown[]) => void }
  if (w.clarity) return
  const clarity = function (...args: unknown[]) {
    ;(clarity.q = clarity.q || []).push(args)
  } as ((...args: unknown[]) => void) & { q?: unknown[] }
  w.clarity = clarity
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.clarity.ms/tag/${clarityId}`
  document.head.appendChild(script)
}

/** Carga Pixel / Clarity solo si analytics.enabled y hay IDs. */
export function initAnalytics(): void {
  if (!siteConfig.analytics.enabled) return
  const { metaPixelId, clarityId } = siteConfig.analytics
  if (metaPixelId) injectMetaPixel(metaPixelId)
  if (clarityId) injectClarity(clarityId)
}

export function applySiteMeta(): void {
  const { seo, brand } = siteConfig
  document.title = seo.title

  const setMeta = (selector: string, attr: 'content' | 'href', value: string) => {
    const el = document.querySelector(selector)
    if (el) el.setAttribute(attr, value)
  }

  setMeta('meta[name="description"]', 'content', seo.description)
  setMeta('meta[property="og:title"]', 'content', seo.title)
  setMeta('meta[property="og:description"]', 'content', seo.description)
  setMeta('meta[property="og:url"]', 'content', seo.siteUrl)
  setMeta('meta[property="og:image"]', 'content', `${seo.siteUrl}${seo.ogImage}`)
  setMeta('meta[name="twitter:title"]', 'content', seo.title)
  setMeta('meta[name="twitter:description"]', 'content', seo.description)
  setMeta('meta[name="twitter:image"]', 'content', `${seo.siteUrl}${seo.ogImage}`)
  setMeta('link[rel="icon"]', 'href', brand.logoSrc)
}
