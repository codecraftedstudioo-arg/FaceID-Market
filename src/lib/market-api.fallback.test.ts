import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Fallback del market (decisión #1 / Fase 7.1):
 *  - Con el panel configurado, si el panel se cae NO se cae al Apps Script.
 *  - El Apps Script solo se usa cuando NO hay panel.
 *  - Sin panel ni Apps Script → demo estático (market-pricing.json).
 */

const PANEL_BASE = 'https://panel.example.com'
const PANEL_WITH_API = 'https://panel.example.com/api/v1'
const APPS = 'https://script.example/exec'

function makeFetch(calls: string[], status = 500) {
  return vi.fn(async (input: RequestInfo | URL) => {
    calls.push(String(input))
    return { ok: false, status, json: async () => ({}) } as unknown as Response
  })
}

describe('fetchMarketPrices — fuente panel / fallback', () => {
  beforeEach(() => {
    vi.resetModules()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('con panel (origen Admin): pide /api/v1/market-items, NO Apps Script, propaga error', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', PANEL_BASE)
    vi.stubEnv('VITE_MARKET_PRICES_URL', APPS)
    const calls: string[] = []
    vi.stubGlobal('fetch', makeFetch(calls))

    const { fetchMarketPrices } = await import('./market-api')
    await expect(fetchMarketPrices()).rejects.toThrow()

    expect(calls).toHaveLength(1)
    expect(calls[0]).toBe(`${PANEL_BASE}/api/v1/market-items`)
    expect(calls.some((u) => u.includes('script.example'))).toBe(false)
  })

  it('acepta VITE_PANEL_API_URL que ya termina en /api/v1', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', PANEL_WITH_API)
    vi.stubEnv('VITE_MARKET_PRICES_URL', APPS)
    const calls: string[] = []
    vi.stubGlobal('fetch', makeFetch(calls))

    const { fetchMarketPrices } = await import('./market-api')
    await expect(fetchMarketPrices()).rejects.toThrow()

    expect(calls[0]).toBe(`${PANEL_WITH_API}/market-items`)
  })

  it('sin panel: sí usa el Apps Script', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', '')
    vi.stubEnv('VITE_MARKET_PRICES_URL', APPS)
    const calls: string[] = []
    vi.stubGlobal('fetch', makeFetch(calls))

    const { fetchMarketPrices } = await import('./market-api')
    await expect(fetchMarketPrices()).rejects.toThrow()

    expect(calls.some((u) => u.includes('script.example'))).toBe(true)
  })

  it('sin panel ni Apps Script: demo estático sin fetch', async () => {
    vi.stubEnv('VITE_PANEL_API_URL', '')
    vi.stubEnv('VITE_MARKET_PRICES_URL', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { fetchMarketPrices } = await import('./market-api')
    const data = await fetchMarketPrices()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(data.models.length).toBeGreaterThan(0)
  })
})

describe('resolvePanelMarketItemsUrl', () => {
  it('arma /api/v1/market-items desde el origen del Admin', async () => {
    const { resolvePanelMarketItemsUrl } = await import('./market-api')
    expect(resolvePanelMarketItemsUrl('https://admin.ejemplo.com')).toBe(
      'https://admin.ejemplo.com/api/v1/market-items'
    )
    expect(resolvePanelMarketItemsUrl('https://admin.ejemplo.com/')).toBe(
      'https://admin.ejemplo.com/api/v1/market-items'
    )
    expect(resolvePanelMarketItemsUrl('https://admin.ejemplo.com/api/v1')).toBe(
      'https://admin.ejemplo.com/api/v1/market-items'
    )
  })
})
