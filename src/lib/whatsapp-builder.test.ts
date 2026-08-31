import { describe, it, expect } from 'vitest'
import { buildBuyLink, buildContactedBuyLink } from './whatsapp-builder'

describe('buildBuyLink', () => {
  it('returns a wa.me URL', () => {
    const link = buildBuyLink('iPhone 17 Pro Max', '256 GB', 'USD 1.550')
    expect(link).toMatch(/^https:\/\/wa\.me\//)
  })

  it('includes the model in the message', () => {
    const link = buildBuyLink('iPhone 17 Pro Max', '256 GB', 'USD 1.550')
    const decoded = decodeURIComponent(link)
    expect(decoded).toContain('iPhone 17 Pro Max')
  })

  it('includes storage and price', () => {
    const link = buildBuyLink('iPhone 16', '128 GB', 'USD 800')
    const decoded = decodeURIComponent(link)
    expect(decoded).toContain('128 GB')
    expect(decoded).toContain('USD 800')
  })

  it('sanitizes special characters', () => {
    const link = buildBuyLink('iPhone*17_Pro~Max', '256 GB', 'USD 1.550')
    const decoded = decodeURIComponent(link)
    expect(decoded).not.toContain('*')
    expect(decoded).not.toContain('_')
    expect(decoded).not.toContain('~')
  })
})

describe('buildContactedBuyLink', () => {
  const contact = { nombre: 'Juan Pérez', telefono: '1144556677' }

  it('devuelve URL de wa.me', () => {
    const link = buildContactedBuyLink(contact, 'iPhone 17 Pro', '256 GB', 'USD 1.500')
    expect(link).toMatch(/^https:\/\/wa\.me\//)
  })

  it('incluye nombre y teléfono del contacto', () => {
    const link = buildContactedBuyLink(contact, 'iPhone 17 Pro', '256 GB', 'USD 1.500')
    const decoded = decodeURIComponent(link)
    expect(decoded).toContain('Juan Pérez')
    expect(decoded).toContain('1144556677')
  })

  it('incluye modelo, almacenamiento y precio', () => {
    const link = buildContactedBuyLink(contact, 'iPhone 17 Pro', '256 GB', 'USD 1.500')
    const decoded = decodeURIComponent(link)
    expect(decoded).toContain('iPhone 17 Pro')
    expect(decoded).toContain('256 GB')
    expect(decoded).toContain('USD 1.500')
  })

  it('traduce el color al español si está en el mapa', () => {
    const link = buildContactedBuyLink(contact, 'iPhone 17', '128 GB', 'USD 800', 'Orange')
    const decoded = decodeURIComponent(link)
    expect(decoded).toContain('Naranja')
    expect(decoded).not.toMatch(/\bOrange\b/)
  })

  it('omite la mención de color si no se pasa', () => {
    const link = buildContactedBuyLink(contact, 'iPhone 17', '128 GB', 'USD 800')
    const decoded = decodeURIComponent(link)
    expect(decoded).not.toContain('color')
    expect(decoded).not.toContain('en color')
  })

  it('sanitiza markdown de WhatsApp en todos los campos', () => {
    const dirtyContact = { nombre: '*Juan*_Pérez_', telefono: '1144556677' }
    const link = buildContactedBuyLink(dirtyContact, 'iPhone~17', '256 GB', 'USD 1.500', 'Orange')
    const decoded = decodeURIComponent(link)
    expect(decoded).not.toContain('*')
    expect(decoded).not.toContain('_')
    expect(decoded).not.toContain('~')
  })

  it('arma el mensaje con el formato esperado', () => {
    const link = buildContactedBuyLink(contact, 'iPhone 17', '256 GB', 'USD 1.500', 'Blue')
    const decoded = decodeURIComponent(link)
    expect(decoded).toContain('Hola, soy Juan Pérez mi telefono es 1144556677')
    expect(decoded).toContain('Quiero coordinar la compra por el iPhone 17 256 GB Azul (USD 1.500).')
  })

  describe('modo waitlist (sin stock)', () => {
    it('cambia el copy a "avisar cuando entre stock"', () => {
      const link = buildContactedBuyLink(contact, 'iPhone 17', '256 GB', 'USD 1.500', 'Blue', true)
      const decoded = decodeURIComponent(link)
      expect(decoded).toContain('Quiero que me avisen cuando entre stock del iPhone 17 256 GB Azul.')
    })

    it('NO incluye precio en el mensaje (no tiene sentido si no hay stock)', () => {
      const link = buildContactedBuyLink(contact, 'iPhone 17', '256 GB', 'USD 1.500', 'Blue', true)
      const decoded = decodeURIComponent(link)
      expect(decoded).not.toContain('USD 1.500')
    })

    it('NO usa el copy de waitlist si el flag es false (default reserve)', () => {
      const link = buildContactedBuyLink(contact, 'iPhone 17', '256 GB', 'USD 1.500', 'Blue', false)
      const decoded = decodeURIComponent(link)
      expect(decoded).toContain('Quiero coordinar la compra por el')
      expect(decoded).not.toContain('avisen cuando entre')
    })
  })

  describe('accesorios', () => {
    it('agrega la línea "Sumo:" con los accesorios elegidos', () => {
      const link = buildContactedBuyLink(
        contact, 'iPhone 17', '256 GB', 'USD 1.500', 'Blue', false,
        [{ name: 'Cargador original', priceUSD: 50 }, { name: 'Funda', priceUSD: 20 }]
      )
      const decoded = decodeURIComponent(link)
      expect(decoded).toContain('Sumo: Cargador original (+USD 50), Funda (+USD 20)')
    })

    it('NO agrega la línea si no hay accesorios', () => {
      const link = buildContactedBuyLink(contact, 'iPhone 17', '256 GB', 'USD 1.500', 'Blue', false, [])
      const decoded = decodeURIComponent(link)
      expect(decoded).not.toContain('Sumo:')
    })

    it('sanitiza el nombre del accesorio', () => {
      const link = buildContactedBuyLink(
        contact, 'iPhone 17', '256 GB', 'USD 1.500', 'Blue', false,
        [{ name: '*Cargador*', priceUSD: 50 }]
      )
      const decoded = decodeURIComponent(link)
      expect(decoded).toContain('Sumo: Cargador (+USD 50)')
      expect(decoded).not.toContain('*')
    })

    it('dice "de regalo" en vez de "(+USD 0)" en los accesorios sin cargo', () => {
      const link = buildContactedBuyLink(
        contact, 'iPhone 17', '256 GB', 'USD 1.500', 'Blue', false,
        [{ name: 'Cargador 20W (De regalo)', priceUSD: 0 }]
      )
      const decoded = decodeURIComponent(link)
      expect(decoded).toContain('Sumo: Cargador 20W (de regalo)')
      expect(decoded).not.toContain('USD 0')
    })

    it('mezcla pagos y de regalo en la misma línea', () => {
      const link = buildContactedBuyLink(
        contact, 'iPhone 17', '256 GB', 'USD 1.500', 'Blue', false,
        [{ name: 'Funda', priceUSD: 20 }, { name: 'Cargador 20W (De regalo)', priceUSD: 0 }]
      )
      const decoded = decodeURIComponent(link)
      expect(decoded).toContain('Sumo: Funda (+USD 20), Cargador 20W (de regalo)')
    })
  })
})
