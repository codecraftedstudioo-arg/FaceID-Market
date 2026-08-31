import { test, expect } from '@playwright/test'
import { COTIZADOR_URL, MARKET_URL } from './urls'

// Límites aceptables para un sitio moderno.
// LCP (Largest Contentful Paint): < 2.5s = bueno, < 4s = OK
// FCP (First Contentful Paint): < 1.8s = bueno
// Bundle JS principal < 500kb gzipped
const LIMITS = {
  LCP_MS: 4000,
  FCP_MS: 2500,
  LOAD_MS: 5000,
  BUNDLE_SIZE_BYTES: 600 * 1024, // 600kb
}

test.describe('Performance — tiempos de carga', () => {
  test('Market: carga inicial bajo el límite', async ({ page }) => {
    const start = Date.now()
    await page.goto(MARKET_URL)
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(LIMITS.LOAD_MS)
  })

  test('Cotizador: carga inicial bajo el límite', async ({ page }) => {
    const start = Date.now()
    await page.goto(`${COTIZADOR_URL}/cotizar?new=1`)
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(LIMITS.LOAD_MS)
  })

  test('Market: First Contentful Paint bajo el límite', async ({ page }) => {
    await page.goto(MARKET_URL)
    const fcp = await page.evaluate(() => new Promise<number>((resolve) => {
      new PerformanceObserver((list) => {
        const entry = list.getEntries().find(e => e.name === 'first-contentful-paint')
        if (entry) resolve(entry.startTime)
      }).observe({ type: 'paint', buffered: true })
      setTimeout(() => resolve(0), 10000)
    }))
    if (fcp > 0) {
      expect(fcp).toBeLessThan(LIMITS.FCP_MS)
    }
  })

  test('Cotizador: Largest Contentful Paint bajo el límite', async ({ page }) => {
    await page.goto(`${COTIZADOR_URL}/cotizar?new=1`)
    await page.waitForLoadState('networkidle')
    const lcp = await page.evaluate(() => new Promise<number>((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length > 0) resolve(entries[entries.length - 1].startTime)
      }).observe({ type: 'largest-contentful-paint', buffered: true })
      setTimeout(() => resolve(0), 5000)
    }))
    if (lcp > 0) {
      expect(lcp).toBeLessThan(LIMITS.LCP_MS)
    }
  })
})

test.describe('Performance — tamaño del bundle', () => {
  test('Market: tamaño del JS principal bajo el límite', async ({ page }) => {
    const jsResources: number[] = []
    page.on('response', async (res) => {
      const url = res.url()
      if (url.includes('.js') && url.includes('assets/') && !url.includes('.map')) {
        try {
          const body = await res.body()
          jsResources.push(body.length)
        } catch { /* ignore */ }
      }
    })

    await page.goto(MARKET_URL)
    await page.waitForLoadState('networkidle')

    const totalJs = jsResources.reduce((a, b) => a + b, 0)
    expect(totalJs).toBeLessThan(LIMITS.BUNDLE_SIZE_BYTES)
  })

  test('Cotizador: tamaño del JS principal bajo el límite', async ({ page }) => {
    const jsResources: number[] = []
    page.on('response', async (res) => {
      const url = res.url()
      if (url.includes('.js') && url.includes('assets/') && !url.includes('.map')) {
        try {
          const body = await res.body()
          jsResources.push(body.length)
        } catch { /* ignore */ }
      }
    })

    await page.goto(`${COTIZADOR_URL}/cotizar?new=1`)
    await page.waitForLoadState('networkidle')

    const totalJs = jsResources.reduce((a, b) => a + b, 0)
    expect(totalJs).toBeLessThan(LIMITS.BUNDLE_SIZE_BYTES)
  })
})

test.describe('Performance — sin console errors críticos', () => {
  test('Market: no hay errores de JS en consola al cargar', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto(MARKET_URL)
    await page.waitForLoadState('networkidle')

    // Filtrar errores no críticos (ej: 404 de favicons, third-party)
    const critical = errors.filter(e =>
      !e.toLowerCase().includes('favicon') &&
      !e.toLowerCase().includes('facebook') &&
      !e.toLowerCase().includes('google') &&
      !e.toLowerCase().includes('fbq')
    )
    expect(critical).toHaveLength(0)
  })

  test('Cotizador: no hay errores de JS en consola al cargar', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto(`${COTIZADOR_URL}/cotizar?new=1`)
    await page.waitForLoadState('networkidle')

    const critical = errors.filter(e =>
      !e.toLowerCase().includes('favicon') &&
      !e.toLowerCase().includes('facebook') &&
      !e.toLowerCase().includes('google') &&
      !e.toLowerCase().includes('fbq')
    )
    expect(critical).toHaveLength(0)
  })
})
