export type PriceDirection = 'up' | 'down' | 'same'

export interface Variant {
  storage: string
  priceUSD: number
  direction: PriceDirection
  priceDiff?: number
  color?: string
  // Color real del círculo, elegido en el panel (ej '#4A5ABF'). Si no viene, el
  // market cae al colorMap por nombre y luego a gris.
  colorHex?: string
  inStock?: boolean
  // Foto del color en el panel (Supabase). Fallback cuando el bundle local no tiene
  // imagen para ese color (color cargado nuevo desde el panel).
  photoUrl?: string
}

export interface Model {
  id: string
  name: string
  featured: boolean
  variants: Variant[]
}

export interface MarketLinks {
  sellYourIphone: string
  mainSite: string
  instagram: string
}

export interface ActivityCounter {
  baseCount: number
  label: string
}

export interface Accessory {
  name: string
  priceUSD: number
  photos: string[]
}

export interface MarketPricing {
  models: Model[]
  links: MarketLinks
  activityCounter: ActivityCounter
  dailySalesTarget: number
  currency: string
  lastUpdated: string
  accessories?: Accessory[]
}
