import { describe, it, expect } from 'vitest'
import { transformPanelToMarket } from './market-api'

type Item = Parameters<typeof transformPanelToMarket>[0][number]

const item = (over: Partial<Item> = {}): Item => ({
  model: 'iPhone 17',
  color: 'Ultramarine',
  storage: '256',
  priceUsd: 1000,
  stock: 1,
  ...over,
})

describe('transformPanelToMarket — colorHex', () => {
  it('mapea el colorHex del panel a la variante', () => {
    const out = transformPanelToMarket([item({ colorHex: '#ABCDEF' })])
    expect(out.models[0].variants[0].colorHex).toBe('#ABCDEF')
  })

  it('null del panel queda como undefined en la variante', () => {
    const out = transformPanelToMarket([item({ colorHex: null })])
    expect(out.models[0].variants[0].colorHex).toBeUndefined()
  })

  it('sin colorHex queda undefined', () => {
    const out = transformPanelToMarket([item()])
    expect(out.models[0].variants[0].colorHex).toBeUndefined()
  })
})
