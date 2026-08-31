import { describe, it, expect } from 'vitest'
import { buildBookingSrc } from './booking-calendar'

// El calendario es un iframe cross-origin: los datos del equipo solo pueden
// viajar por query string, con las query keys configuradas en el form del widget.
describe('buildBookingSrc', () => {
  it('prellena modelo, almacenamiento y color', () => {
    const url = new URL(buildBookingSrc({
      modelo: 'iPhone 15 Pro',
      almacenamiento: '256GB',
      color: 'Titanio Natural',
    }))

    expect(url.searchParams.get('modelo_nuevo')).toBe('iPhone 15 Pro')
    expect(url.searchParams.get('almacenamiento_nuevo')).toBe('256GB')
    expect(url.searchParams.get('color_nuevo')).toBe('Titanio Natural')
  })

  it('conserva lang=es (sin eso el widget puede mostrarse en inglés)', () => {
    const url = new URL(buildBookingSrc({ modelo: 'iPhone 16' }))
    expect(url.searchParams.get('lang')).toBe('es')
  })

  it('omite el color cuando el modelo no tiene colores', () => {
    const url = new URL(buildBookingSrc({ modelo: 'iPhone 16', almacenamiento: '128GB' }))
    expect(url.searchParams.has('color_nuevo')).toBe(false)
  })

  it('no agrega parámetros vacíos', () => {
    const url = new URL(buildBookingSrc({}))
    expect(url.searchParams.has('modelo_nuevo')).toBe(false)
    expect(url.searchParams.has('almacenamiento_nuevo')).toBe(false)
    expect(url.searchParams.has('color_nuevo')).toBe(false)
  })

  it('codifica espacios y acentos', () => {
    const src = buildBookingSrc({ modelo: 'iPhone 15 Pro Max', color: 'Azul Niebla' })
    expect(src).not.toMatch(/modelo_nuevo=iPhone 15/)
    expect(new URL(src).searchParams.get('color_nuevo')).toBe('Azul Niebla')
  })
})
