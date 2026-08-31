import type { Model, Variant } from '@/types/market'

/** Drop mínimo en USD para que una variante cuente como "oferta" / OFERTA badge. */
export const MARKET_OFFER_THRESHOLD = 25

export interface MarketFilters {
  onlyAvailable: boolean
  onlyDrops: boolean
}

/**
 * Por qué una variante no se puede reservar. Son dos motivos DISTINTOS y el
 * cliente los tiene que poder diferenciar:
 *
 * - `no-stock`  → no hay unidades. El panel manda precio 0 con stock 0.
 * - `no-price`  → hay unidades pero el precio no está publicado (el panel lo
 *                 dejó en 0 a propósito). Se muestra "Consultar precio".
 *
 * Sin stock gana sobre sin precio: cuando stock = 0 la API enmascara el precio
 * a 0, así que los dos estados llegan igual y "Sin stock" es el dato útil.
 */
export type VariantAvailability = 'available' | 'no-stock' | 'no-price'

export function variantAvailability(
  v: Pick<Variant, 'priceUSD' | 'inStock'>
): VariantAvailability {
  if (v.inStock === false) return 'no-stock'
  if (!(v.priceUSD > 0)) return 'no-price'
  return 'available'
}

/** Texto que va donde iría el precio cuando la variante no se puede reservar. */
export const UNAVAILABLE_LABEL: Record<Exclude<VariantAvailability, 'available'>, string> = {
  'no-stock': 'Sin stock',
  'no-price': 'Consultar precio',
}

/** True si la variante cumple TODOS los filtros activos. */
export function variantPassesFilters(v: Variant, filters: MarketFilters): boolean {
  const passAvail = !filters.onlyAvailable || variantAvailability(v) === 'available'
  const passDrop =
    !filters.onlyDrops ||
    (v.direction === 'down' && v.priceDiff != null && Math.abs(v.priceDiff) >= MARKET_OFFER_THRESHOLD)
  return passAvail && passDrop
}

/**
 * True si el modelo tiene AL MENOS UNA variante que cumple TODOS los filtros activos a la vez.
 *
 * IMPORTANTE: la versión anterior chequeaba cada filtro independientemente — eso podía dejar pasar
 * modelos con "stock-sin-oferta" + "oferta-sin-stock" y crashear en la card cuando ninguna variante
 * cumplía ambos.
 */
export function modelPassesFilters(model: Model, filters: MarketFilters): boolean {
  if (!filters.onlyAvailable && !filters.onlyDrops) return true
  return model.variants.some(v => variantPassesFilters(v, filters))
}

/**
 * Devuelve la variante del modelo con la bajada más grande (priceDiff más negativo)
 * que cumpla el threshold mínimo. null si no hay ninguna que califique.
 */
export function getBestOfferVariant(model: Model): Variant | null {
  let best: Variant | null = null
  let bestDrop = MARKET_OFFER_THRESHOLD - 1
  for (const v of model.variants) {
    if (
      v.direction === 'down' &&
      v.priceDiff != null &&
      Math.abs(v.priceDiff) > bestDrop &&
      v.priceUSD > 0
    ) {
      best = v
      bestDrop = Math.abs(v.priceDiff)
    }
  }
  return best
}
