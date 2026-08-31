import fallbackData from '@/config/market-pricing.json'
import type { MarketPricing, Model, Variant } from '@/types/market'

const APPS_SCRIPT_URL = import.meta.env.VITE_MARKET_PRICES_URL || ''
/** Origen del Market Admin (ej. https://admin.ejemplo.com). Sin path /api/v1. */
const PANEL_API_URL = (import.meta.env.VITE_PANEL_API_URL || '').trim()
const STORAGE_KEY = 'market-prices'
const STORAGE_TS_KEY = 'market-prices-ts'
const CACHE_DURATION_MS = 2 * 60 * 1000
const STORAGE_TTL_MS = 30 * 60 * 1000

let cachedData: MarketPricing | null = null
let cacheTimestamp = 0
let inflight: Promise<MarketPricing> | null = null

/** True cuando la web debe usar exclusivamente la API del Market Admin. */
export function isPanelConfigured(): boolean {
  return PANEL_API_URL.length > 0
}

/**
 * Resuelve GET …/api/v1/market-items a partir de VITE_PANEL_API_URL.
 * Acepta base con o sin sufijo `/api/v1` (compat con configs previas).
 */
export function resolvePanelMarketItemsUrl(base: string): string {
  const cleaned = base.replace(/\/$/, '')
  if (cleaned.endsWith('/market-items')) return cleaned
  if (cleaned.endsWith('/api/v1')) return `${cleaned}/market-items`
  return `${cleaned}/api/v1/market-items`
}

function loadModelsFromStorage(): Model[] | null {
  try {
    const ts = localStorage.getItem(STORAGE_TS_KEY)
    if (ts && Date.now() - Number(ts) > STORAGE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_TS_KEY)
      return null
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as MarketPricing
    if (!Array.isArray(parsed?.models) || parsed.models.length === 0) return null
    return parsed.models
  } catch {
    return null
  }
}

function saveToStorage(data: MarketPricing) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    localStorage.setItem(STORAGE_TS_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
}

function clearStoredPrices() {
  cachedData = null
  cacheTimestamp = 0
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_TS_KEY)
  } catch {
    /* ignore */
  }
}

function staticDemoData(): MarketPricing {
  const fallback = fallbackData as MarketPricing
  return {
    ...fallback,
    lastUpdated: fallback.lastUpdated || new Date().toISOString().slice(0, 10),
  }
}

/**
 * Datos iniciales para el primer paint.
 * - Con panel: models vacío (loading) — no rehidratar cache como si fuera live.
 * - Sin panel + Apps Script: models desde localStorage si hay.
 * - Sin panel ni Apps Script: demo estático (market-pricing.json).
 */
export function getInitialData(): MarketPricing {
  const fallback = fallbackData as MarketPricing
  if (isPanelConfigured()) {
    return { ...fallback, models: [] }
  }
  if (!APPS_SCRIPT_URL) {
    return staticDemoData()
  }
  const cachedModels = loadModelsFromStorage()
  return {
    ...fallback,
    models: cachedModels ?? [],
  }
}

// --- Panel Admin: items planos → models agrupados del market ---

type PanelMarketItem = {
  model: string
  featured?: boolean
  color: string
  storage: string
  priceUsd: number
  stock: number
  direction?: 'up' | 'down' | 'same'
  priceDiff?: number
  photoUrl?: string
  colorHex?: string | null
}

function slugifyModel(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

type PanelAccessory = { name: string; priceUsd: number; photos?: string[] }

export function transformPanelToMarket(
  items: PanelMarketItem[],
  accessories: PanelAccessory[] = []
): MarketPricing {
  const fallback = fallbackData as MarketPricing
  const byModel = new Map<string, { name: string; featured: boolean; variants: Variant[] }>()

  for (const it of items) {
    let m = byModel.get(it.model)
    if (!m) {
      m = { name: it.model, featured: !!it.featured, variants: [] }
      byModel.set(it.model, m)
    }
    m.variants.push({
      storage: it.storage,
      color: it.color,
      priceUSD: it.priceUsd,
      // El panel manda la flecha desde el último cambio de precio. Si no viene
      // (ítem sin historial), queda 'same' → sin flecha.
      direction: it.direction ?? 'same',
      priceDiff: it.priceDiff ?? 0,
      inStock: it.stock > 0,
      photoUrl: it.photoUrl,
      colorHex: it.colorHex ?? undefined,
    })
  }

  const models: Model[] = Array.from(byModel.values()).map((m) => ({
    id: slugifyModel(m.name),
    name: m.name,
    featured: m.featured,
    variants: m.variants,
  }))

  const accessoriesOut = accessories.map((a) => ({
    name: a.name,
    priceUSD: a.priceUsd,
    photos: Array.isArray(a.photos) ? a.photos : [],
  }))

  // Mantenemos links/activityCounter/etc del JSON estático; solo cambian models.
  return {
    ...fallback,
    models,
    accessories: accessoriesOut,
    lastUpdated: new Date().toISOString().slice(0, 10),
  }
}

async function fetchFromPanel(): Promise<MarketPricing> {
  const url = resolvePanelMarketItemsUrl(PANEL_API_URL)
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const data = await response.json()
  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('Datos del panel inválidos')
  }
  return transformPanelToMarket(
    data.items as PanelMarketItem[],
    (data.accessories ?? []) as PanelAccessory[]
  )
}

async function fetchFromAppsScript(): Promise<MarketPricing> {
  const url = `${APPS_SCRIPT_URL}${APPS_SCRIPT_URL.includes('?') ? '&' : '?'}t=${Date.now()}`
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const data: MarketPricing = await response.json()
  if (!data.models || !Array.isArray(data.models) || data.models.length === 0) {
    throw new Error('Invalid data format')
  }
  return data
}

export async function fetchMarketPrices(force = false): Promise<MarketPricing> {
  // `force` (auto-refresh/polling): salta el cache en memoria para traer datos
  // frescos del panel. El load inicial usa el cache normal para no re-pedir en
  // re-renders dentro de la sesión.
  if (!force && cachedData && Date.now() - cacheTimestamp < CACHE_DURATION_MS) {
    return cachedData
  }

  if (inflight) return inflight

  inflight = (async () => {
    try {
      let data: MarketPricing

      if (isPanelConfigured()) {
        // Panel = fuente exclusiva. Si falla, NO caemos a Apps Script ni a
        // precios viejos en cache: limpiamos y propagamos el error.
        try {
          data = await fetchFromPanel()
        } catch (err) {
          clearStoredPrices()
          console.error('[market-api] Panel Admin falló; no se usa Apps Script ni cache viejo.', err)
          throw err
        }
      } else if (APPS_SCRIPT_URL) {
        // Sin panel: Apps Script (rollback / legacy).
        data = await fetchFromAppsScript()
      } else {
        // Sin panel ni Apps Script: demo estático local.
        data = staticDemoData()
      }

      cachedData = data
      cacheTimestamp = Date.now()
      if (isPanelConfigured() || APPS_SCRIPT_URL) {
        saveToStorage(data)
      }
      return data
    } finally {
      inflight = null
    }
  })()

  return inflight
}
