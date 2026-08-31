import { describe, it, expect } from 'vitest'
import { isGiftAccessory, accessoryDisplayName, accessoryLabel } from './accessory-format'

describe('accessory-format', () => {
  describe('isGiftAccessory', () => {
    it('es de regalo cuando el precio es 0', () => {
      expect(isGiftAccessory(0)).toBe(true)
    })

    it('NO es de regalo cuando tiene precio', () => {
      expect(isGiftAccessory(50)).toBe(false)
      expect(isGiftAccessory(0.5)).toBe(false)
    })

    it('trata un precio negativo como de regalo (no queremos mostrar "+USD -5")', () => {
      expect(isGiftAccessory(-5)).toBe(true)
    })
  })

  describe('accessoryDisplayName', () => {
    it('saca el marcador de regalo redundante del nombre', () => {
      expect(accessoryDisplayName('Cargador 20W (De regalo)', 0)).toBe('Cargador 20W')
    })

    it('acepta las variantes del marcador, sin importar mayúsculas', () => {
      expect(accessoryDisplayName('Funda (regalo)', 0)).toBe('Funda')
      expect(accessoryDisplayName('Funda (GRATIS)', 0)).toBe('Funda')
      expect(accessoryDisplayName('Funda (sin cargo)', 0)).toBe('Funda')
      expect(accessoryDisplayName('Funda (bonificada)', 0)).toBe('Funda')
    })

    it('NO toca el nombre de un accesorio con precio, ni si dice "de regalo"', () => {
      expect(accessoryDisplayName('Cargador 20W (De regalo)', 50)).toBe('Cargador 20W (De regalo)')
      expect(accessoryDisplayName('Funda', 20)).toBe('Funda')
    })

    it('deja el nombre intacto si el paréntesis no es un marcador de regalo', () => {
      expect(accessoryDisplayName('Cargador (20W)', 0)).toBe('Cargador (20W)')
      expect(accessoryDisplayName('Funda (silicona)', 0)).toBe('Funda (silicona)')
    })

    it('solo saca el marcador si está al final', () => {
      expect(accessoryDisplayName('(De regalo) Cargador', 0)).toBe('(De regalo) Cargador')
    })

    it('no devuelve vacío si el nombre era solo el marcador', () => {
      expect(accessoryDisplayName('(De regalo)', 0)).toBe('(De regalo)')
    })
  })

  describe('accessoryLabel', () => {
    it('usa el precio cuando el accesorio es pago', () => {
      expect(accessoryLabel('Funda', 20)).toBe('Funda (+USD 20)')
    })

    it('dice "de regalo" cuando no tiene precio, sin repetir el marcador', () => {
      expect(accessoryLabel('Cargador 20W (De regalo)', 0)).toBe('Cargador 20W (de regalo)')
      expect(accessoryLabel('Cargador 20W', 0)).toBe('Cargador 20W (de regalo)')
    })

    it('nunca emite "USD 0"', () => {
      expect(accessoryLabel('Cargador 20W (De regalo)', 0)).not.toContain('USD 0')
    })
  })
})
