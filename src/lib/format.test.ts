import { describe, it, expect } from 'vitest'
import { formatPrice, formatStorage, formatDate } from './format'

describe('formatPrice', () => {
  it('returns "Consultar" for price 0', () => {
    expect(formatPrice(0)).toBe('Consultar')
  })

  it('formats price as number string', () => {
    const result = formatPrice(1550)
    expect(result).toContain('1')
    expect(result).toContain('550')
  })
})

describe('formatStorage', () => {
  it('formats GB values', () => {
    expect(formatStorage('128')).toBe('128 GB')
    expect(formatStorage('256')).toBe('256 GB')
    expect(formatStorage('512')).toBe('512 GB')
  })

  it('converts 1024 to TB', () => {
    expect(formatStorage('1024')).toBe('1 TB')
  })

  it('converts 2048 to TB', () => {
    expect(formatStorage('2048')).toBe('2 TB')
  })
})

describe('formatDate', () => {
  it('converts YYYY-MM-DD to DD/MM/YYYY', () => {
    expect(formatDate('2026-03-01')).toBe('01/03/2026')
  })
})
