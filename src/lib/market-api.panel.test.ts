import { describe, it, expect } from 'vitest'
import { transformPanelToMarket } from './market-api'

type PanelItem = Parameters<typeof transformPanelToMarket>[0][number]

const base: PanelItem = {
  model: 'iPhone 16',
  color: 'Black',
  storage: '128 GB',
  priceUsd: 750,
  stock: 2,
}

function variantOf(data: ReturnType<typeof transformPanelToMarket>, model: string) {
  const m = data.models.find((mm) => mm.name === model)
  return m?.variants[0]
}

describe('transformPanelToMarket — flechas (direction/priceDiff)', () => {
  it('propaga direction "down" y priceDiff del panel', () => {
    const data = transformPanelToMarket([
      { ...base, direction: 'down', priceDiff: -30 },
    ])
    const v = variantOf(data, 'iPhone 16')
    expect(v?.direction).toBe('down')
    expect(v?.priceDiff).toBe(-30)
  })

  it('propaga direction "up" y priceDiff positivo', () => {
    const data = transformPanelToMarket([
      { ...base, direction: 'up', priceDiff: 20 },
    ])
    const v = variantOf(data, 'iPhone 16')
    expect(v?.direction).toBe('up')
    expect(v?.priceDiff).toBe(20)
  })

  it('sin direction (ítem sin historial) cae a "same" y priceDiff 0', () => {
    const data = transformPanelToMarket([{ ...base }])
    const v = variantOf(data, 'iPhone 16')
    expect(v?.direction).toBe('same')
    expect(v?.priceDiff).toBe(0)
  })

  it('agrupa variantes del mismo modelo y respeta stock', () => {
    const data = transformPanelToMarket([
      { ...base, storage: '128 GB', stock: 2, direction: 'down', priceDiff: -30 },
      { ...base, storage: '256 GB', stock: 0, direction: 'up', priceDiff: 50 },
    ])
    const m = data.models.find((mm) => mm.name === 'iPhone 16')
    expect(m?.variants).toHaveLength(2)
    expect(m?.variants.find((v) => v.storage === '128 GB')?.inStock).toBe(true)
    expect(m?.variants.find((v) => v.storage === '256 GB')?.inStock).toBe(false)
  })
})
