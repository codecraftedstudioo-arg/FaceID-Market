import { describe, it, expect, beforeEach, vi } from 'vitest'
import { isValidArgPhone, sendLeadToCrm, type MarketLead } from './crm-webhook'

describe('isValidArgPhone', () => {
  describe('válidos', () => {
    it('acepta 10 dígitos locales', () => {
      expect(isValidArgPhone('1144556677')).toBe(true)
    })
    it('acepta 11 dígitos arrancando con 9', () => {
      expect(isValidArgPhone('91144556677')).toBe(true)
    })
    it('acepta 12 dígitos arrancando con 54', () => {
      expect(isValidArgPhone('541144556677')).toBe(true)
    })
    it('acepta 13 dígitos arrancando con 549', () => {
      expect(isValidArgPhone('5491144556677')).toBe(true)
    })
    it('ignora espacios, guiones, paréntesis y +', () => {
      expect(isValidArgPhone('+54 9 (11) 4455-6677')).toBe(true)
      expect(isValidArgPhone('11 4455 6677')).toBe(true)
    })
  })

  describe('inválidos', () => {
    it('rechaza menos de 10 dígitos', () => {
      expect(isValidArgPhone('123456789')).toBe(false)
    })
    it('rechaza más de 13 dígitos', () => {
      expect(isValidArgPhone('12345678901234')).toBe(false)
    })
    it('rechaza letras', () => {
      expect(isValidArgPhone('11abcd6677')).toBe(false)
    })
    it('rechaza vacío', () => {
      expect(isValidArgPhone('')).toBe(false)
    })
    it('rechaza 11 dígitos que NO arrancan con 9', () => {
      expect(isValidArgPhone('11144556677')).toBe(false)
    })
    it('rechaza 12 dígitos que NO arrancan con 54', () => {
      expect(isValidArgPhone('111445566778')).toBe(false)
    })
  })

  describe('anti-spam', () => {
    it('rechaza todos los dígitos iguales', () => {
      expect(isValidArgPhone('1111111111')).toBe(false)
      expect(isValidArgPhone('5491111111111')).toBe(false)
    })
    it('rechaza secuencias 1234567890', () => {
      expect(isValidArgPhone('1234567890')).toBe(false)
    })
    it('rechaza poca variedad de dígitos (≤2 únicos)', () => {
      expect(isValidArgPhone('1212121212')).toBe(false)
      expect(isValidArgPhone('1010101010')).toBe(false)
    })
  })
})

describe('sendLeadToCrm', () => {
  const validLead: MarketLead = {
    nombre: 'Juan Pérez',
    telefono: '1144556677',
    modelo: 'iPhone 17 Pro',
    almacenamiento: '256 GB',
    color: 'Orange',
    precio_usd: 1500,
    origen: 'market',
  }

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('rechaza si está lleno el honeypot (bot)', async () => {
    const result = await sendLeadToCrm({ ...validLead, honeypot: 'soy un bot' })
    expect(result).toBe(false)
  })

  it('rechaza si falta nombre', async () => {
    const result = await sendLeadToCrm({ ...validLead, nombre: '' })
    expect(result).toBe(false)
  })

  it('rechaza si falta teléfono', async () => {
    const result = await sendLeadToCrm({ ...validLead, telefono: '' })
    expect(result).toBe(false)
  })

  it('rechaza si el teléfono es inválido', async () => {
    const result = await sendLeadToCrm({ ...validLead, telefono: '123' })
    expect(result).toBe(false)
  })

  it('acepta lead válido (en modo local NO manda fetch)', async () => {
    const result = await sendLeadToCrm(validLead)
    expect(result).toBe(true)
  })

  it('rate limit: rechaza el 4to envío en menos de 5min', async () => {
    await sendLeadToCrm(validLead)
    await sendLeadToCrm(validLead)
    await sendLeadToCrm(validLead)
    const fourth = await sendLeadToCrm(validLead)
    expect(fourth).toBe(false)
  })
})
