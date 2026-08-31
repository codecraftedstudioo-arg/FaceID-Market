import { describe, it, expect } from 'vitest'
import {
  variantPassesFilters,
  modelPassesFilters,
  getBestOfferVariant,
  variantAvailability,
  UNAVAILABLE_LABEL,
  MARKET_OFFER_THRESHOLD,
} from './market-filters'
import type { Model, Variant } from '@/types/market'

// Helpers para crear fixtures rápido
const variant = (overrides: Partial<Variant> = {}): Variant => ({
  storage: '128',
  priceUSD: 800,
  direction: 'same',
  ...overrides,
})

const model = (overrides: Partial<Model> = {}): Model => ({
  id: 'iphone-test',
  name: 'iPhone Test',
  featured: false,
  variants: [variant()],
  ...overrides,
})

describe('variantAvailability', () => {
  it('disponible cuando hay precio y stock', () => {
    expect(variantAvailability(variant({ priceUSD: 800, inStock: true }))).toBe('available')
  })

  it('disponible cuando inStock no está definido (default disponible)', () => {
    expect(variantAvailability(variant({ priceUSD: 800 }))).toBe('available')
  })

  it('sin stock cuando inStock es false, aunque tenga precio', () => {
    expect(variantAvailability(variant({ priceUSD: 800, inStock: false }))).toBe('no-stock')
  })

  it('sin precio cuando el precio es 0 pero hay stock (precio 0 a propósito)', () => {
    expect(variantAvailability(variant({ priceUSD: 0, inStock: true }))).toBe('no-price')
    expect(variantAvailability(variant({ priceUSD: 0 }))).toBe('no-price')
  })

  it('sin stock gana sobre sin precio (stock 0 llega con el precio enmascarado a 0)', () => {
    expect(variantAvailability(variant({ priceUSD: 0, inStock: false }))).toBe('no-stock')
  })

  it('cada estado no-disponible tiene su propio texto', () => {
    expect(UNAVAILABLE_LABEL['no-stock']).toBe('Sin stock')
    expect(UNAVAILABLE_LABEL['no-price']).toBe('Consultar precio')
  })
})

describe('variantPassesFilters', () => {
  describe('sin filtros activos', () => {
    it('siempre pasa cualquier variante', () => {
      const noFilters = { onlyAvailable: false, onlyDrops: false }
      expect(variantPassesFilters(variant({ priceUSD: 0 }), noFilters)).toBe(true)
      expect(variantPassesFilters(variant({ inStock: false }), noFilters)).toBe(true)
      expect(variantPassesFilters(variant({ direction: 'up', priceDiff: 50 }), noFilters)).toBe(true)
    })
  })

  describe('onlyAvailable', () => {
    const filters = { onlyAvailable: true, onlyDrops: false }

    it('pasa variante con stock + precio > 0', () => {
      expect(variantPassesFilters(variant({ priceUSD: 800, inStock: true }), filters)).toBe(true)
    })

    it('pasa cuando inStock no está definido (default disponible)', () => {
      expect(variantPassesFilters(variant({ priceUSD: 800 }), filters)).toBe(true)
    })

    it('rechaza variante con inStock: false', () => {
      expect(variantPassesFilters(variant({ priceUSD: 800, inStock: false }), filters)).toBe(false)
    })

    it('rechaza variante con priceUSD: 0', () => {
      expect(variantPassesFilters(variant({ priceUSD: 0 }), filters)).toBe(false)
    })
  })

  describe('onlyDrops', () => {
    const filters = { onlyAvailable: false, onlyDrops: true }

    it('pasa variante con drop >= threshold', () => {
      expect(
        variantPassesFilters(variant({ direction: 'down', priceDiff: -25 }), filters),
      ).toBe(true)
      expect(
        variantPassesFilters(variant({ direction: 'down', priceDiff: -100 }), filters),
      ).toBe(true)
    })

    it('rechaza variante con drop < threshold', () => {
      expect(
        variantPassesFilters(variant({ direction: 'down', priceDiff: -24 }), filters),
      ).toBe(false)
      expect(
        variantPassesFilters(variant({ direction: 'down', priceDiff: -10 }), filters),
      ).toBe(false)
    })

    it('rechaza variante direction up (precio subió, no es oferta)', () => {
      expect(
        variantPassesFilters(variant({ direction: 'up', priceDiff: 50 }), filters),
      ).toBe(false)
    })

    it('rechaza variante con priceDiff null', () => {
      expect(variantPassesFilters(variant({ direction: 'down' }), filters)).toBe(false)
    })

    it('rechaza variante direction same aunque tenga priceDiff', () => {
      expect(
        variantPassesFilters(variant({ direction: 'same', priceDiff: -100 }), filters),
      ).toBe(false)
    })
  })

  describe('combinación AMBOS filtros (el bug que arreglamos)', () => {
    const filters = { onlyAvailable: true, onlyDrops: true }

    it('pasa variante con stock Y oferta', () => {
      expect(
        variantPassesFilters(
          variant({ priceUSD: 800, inStock: true, direction: 'down', priceDiff: -50 }),
          filters,
        ),
      ).toBe(true)
    })

    it('rechaza variante con stock pero sin oferta', () => {
      expect(
        variantPassesFilters(
          variant({ priceUSD: 800, inStock: true, direction: 'same' }),
          filters,
        ),
      ).toBe(false)
    })

    it('rechaza variante con oferta pero sin stock', () => {
      expect(
        variantPassesFilters(
          variant({ priceUSD: 800, inStock: false, direction: 'down', priceDiff: -50 }),
          filters,
        ),
      ).toBe(false)
    })
  })
})

describe('modelPassesFilters', () => {
  it('pasa todos cuando no hay filtros activos', () => {
    const m = model({
      variants: [
        variant({ priceUSD: 0 }),
        variant({ inStock: false }),
        variant({ direction: 'up', priceDiff: 100 }),
      ],
    })
    expect(modelPassesFilters(m, { onlyAvailable: false, onlyDrops: false })).toBe(true)
  })

  it('pasa modelo si AL MENOS UNA variante cumple onlyAvailable', () => {
    const m = model({
      variants: [
        variant({ priceUSD: 0 }),
        variant({ priceUSD: 800, inStock: true }),
      ],
    })
    expect(modelPassesFilters(m, { onlyAvailable: true, onlyDrops: false })).toBe(true)
  })

  it('rechaza modelo cuando ninguna variante cumple onlyAvailable', () => {
    const m = model({
      variants: [variant({ priceUSD: 0 }), variant({ inStock: false })],
    })
    expect(modelPassesFilters(m, { onlyAvailable: true, onlyDrops: false })).toBe(false)
  })

  /** REGRESIÓN: este era el bug exacto que crasheaba la card.
   * Modelo tenía variantes con-stock-sin-oferta + sin-stock-con-oferta, ninguna con ambos. */
  it('REGRESIÓN: rechaza modelo donde stock y oferta están en variantes distintas', () => {
    const m = model({
      variants: [
        // Variante 1: con stock pero sin oferta
        variant({ priceUSD: 800, inStock: true, direction: 'same' }),
        // Variante 2: con oferta pero sin stock
        variant({ priceUSD: 800, inStock: false, direction: 'down', priceDiff: -50 }),
      ],
    })
    expect(
      modelPassesFilters(m, { onlyAvailable: true, onlyDrops: true }),
    ).toBe(false)
  })

  it('pasa modelo cuando AL MENOS UNA variante cumple AMBOS filtros simultáneamente', () => {
    const m = model({
      variants: [
        variant({ priceUSD: 800, inStock: true, direction: 'same' }),
        variant({
          priceUSD: 800,
          inStock: true,
          direction: 'down',
          priceDiff: -50,
        }),
      ],
    })
    expect(modelPassesFilters(m, { onlyAvailable: true, onlyDrops: true })).toBe(true)
  })

  it('rechaza modelo sin ninguna variante', () => {
    const m = model({ variants: [] })
    expect(modelPassesFilters(m, { onlyAvailable: true, onlyDrops: false })).toBe(false)
  })
})

describe('getBestOfferVariant', () => {
  it('devuelve null cuando el modelo no tiene variantes', () => {
    expect(getBestOfferVariant(model({ variants: [] }))).toBeNull()
  })

  it('devuelve null cuando no hay drops (todas same/up)', () => {
    const m = model({
      variants: [variant({ direction: 'same' }), variant({ direction: 'up', priceDiff: 10 })],
    })
    expect(getBestOfferVariant(m)).toBeNull()
  })

  it('devuelve null cuando ningún drop alcanza el threshold', () => {
    const m = model({
      variants: [
        variant({ direction: 'down', priceDiff: -10 }),
        variant({ direction: 'down', priceDiff: -24 }),
      ],
    })
    expect(getBestOfferVariant(m)).toBeNull()
  })

  it('devuelve la variante con drop = threshold exacto', () => {
    const m = model({
      variants: [variant({ direction: 'down', priceDiff: -MARKET_OFFER_THRESHOLD })],
    })
    expect(getBestOfferVariant(m)).not.toBeNull()
    expect(getBestOfferVariant(m)?.priceDiff).toBe(-MARKET_OFFER_THRESHOLD)
  })

  it('devuelve la variante con MAYOR drop cuando hay varias en oferta', () => {
    const m = model({
      variants: [
        variant({ storage: '128', direction: 'down', priceDiff: -30 }),
        variant({ storage: '256', direction: 'down', priceDiff: -80 }),
        variant({ storage: '512', direction: 'down', priceDiff: -50 }),
      ],
    })
    const best = getBestOfferVariant(m)
    expect(best?.storage).toBe('256')
    expect(best?.priceDiff).toBe(-80)
  })

  it('ignora variantes sin stock aunque tengan drop grande', () => {
    const m = model({
      variants: [
        variant({ priceUSD: 0, direction: 'down', priceDiff: -100 }),
        variant({ priceUSD: 800, direction: 'down', priceDiff: -30 }),
      ],
    })
    const best = getBestOfferVariant(m)
    expect(best?.priceUSD).toBe(800)
    expect(best?.priceDiff).toBe(-30)
  })
})
