import { accessoryLabel } from '@/lib/accessory-format'
import { siteConfig } from '@/config/site'

const PHONE = siteConfig.contact.whatsapp

const colorES: Record<string, string> = {
  Orange: 'Naranja',
  Blue: 'Azul',
  Silver: 'Plateado',
  Black: 'Negro',
  White: 'Blanco',
  Green: 'Verde',
  Pink: 'Rosa',
  Red: 'Rojo',
  Lavender: 'Lavanda',
  Sage: 'Verde Salvia',
  'Mist Blue': 'Azul Niebla',
  'Sky Blue': 'Celeste',
  'Light Gold': 'Dorado Claro',
  'Cloud White': 'Blanco Nube',
  'Space Black': 'Negro Espacial',
  'Soft Pink': 'Rosa Suave',
  Ultramarine: 'Ultramarino',
  Teal: 'Turquesa',
  Yellow: 'Amarillo',
}
function sanitize(text: string): string {
  return text.replace(/[*_~`\n\r]/g, '').trim()
}

export function buildBuyLink(model: string, storage: string, price: string, color?: string): string {
  const cleanModel = sanitize(model)
  const cleanStorage = sanitize(storage)
  const cleanPrice = sanitize(price)

  const lines = [
    'Hola! Me interesa comprar un iPhone.',
    `Modelo: ${cleanModel}`,
    `Almacenamiento: ${cleanStorage}`,
  ]
  if (color) lines.push(`Color: ${sanitize(colorES[color] || color)}`)
  lines.push(`Precio publicado: ${cleanPrice}`, 'Tienen disponibilidad?')

  const message = lines.join('\n')

  const encoded = encodeURIComponent(message).slice(0, 1500)
  return `https://wa.me/${PHONE}?text=${encoded}`
}

// Consulta/dudas directa desde el modal (botón secundario): no pide nombre/teléfono,
// solo abre el chat con el contexto del iPhone para que el cliente pregunte lo que quiera.
export function buildConsultLink(
  model: string,
  storage: string,
  price: string,
  color?: string,
  outOfStock = false
): string {
  const colorPart = color ? ` ${sanitize(colorES[color] || color)}` : ''
  const ref = `${sanitize(model)} ${sanitize(storage)}${colorPart}`

  const lines = outOfStock
    ? [
        `Hola! Quiero consultar por el iPhone ${ref}.`,
        'Vi que está sin stock, me avisan cuando entre?',
      ]
    : [
        `Hola! Tengo una consulta sobre el iPhone ${ref} (${sanitize(price)}).`,
        'Me podrían ayudar?',
      ]

  const message = lines.join('\n')
  const encoded = encodeURIComponent(message).slice(0, 1500)
  return `https://wa.me/${PHONE}?text=${encoded}`
}

export function buildContactedBuyLink(
  contact: { nombre: string; telefono: string },
  model: string,
  storage: string,
  price: string,
  color?: string,
  outOfStock = false,
  accessories: { name: string; priceUSD: number }[] = []
): string {
  const colorPart = color ? ` ${sanitize(colorES[color] || color)}` : ''
  const action = outOfStock
    ? `Quiero que me avisen cuando entre stock del ${sanitize(model)} ${sanitize(storage)}${colorPart}.`
    : `Quiero coordinar la compra por el ${sanitize(model)} ${sanitize(storage)}${colorPart} (${sanitize(price)}).`

  const lines = [
    `Hola, soy ${sanitize(contact.nombre)} mi telefono es ${sanitize(contact.telefono)}`,
    action,
  ]
  if (accessories.length > 0) {
    const accText = accessories
      .map((a) => sanitize(accessoryLabel(a.name, a.priceUSD)))
      .join(', ')
    lines.push(`Sumo: ${accText}`)
  }

  const message = lines.join('\n')

  const encoded = encodeURIComponent(message).slice(0, 1500)
  return `https://wa.me/${PHONE}?text=${encoded}`
}
