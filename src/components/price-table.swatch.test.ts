import { describe, it, expect } from 'vitest'
import type { Variant } from '@/types/market'
import { swatchHex } from './price-table'

const v = (color: string, colorHex?: string): Variant => ({
  storage: '128',
  priceUSD: 1000,
  direction: 'same',
  color,
  colorHex,
})

describe('swatchHex — color del círculo en el market', () => {
  it('usa el colorHex del panel cuando viene', () => {
    expect(swatchHex('Mystery', [v('Mystery', '#FF00AA')])).toBe('#FF00AA')
  })

  it('el colorHex del panel gana incluso sobre un nombre conocido', () => {
    expect(swatchHex('Blue', [v('Blue', '#123456')])).toBe('#123456')
  })

  it('cae al colorMap por nombre si no hay colorHex', () => {
    expect(swatchHex('Blue', [v('Blue')])).toBe('#5B7DBF')
  })

  it('devuelve undefined para nombre desconocido sin colorHex (el caller pinta gris)', () => {
    expect(swatchHex('Inexistente', [v('Inexistente')])).toBeUndefined()
  })
})
