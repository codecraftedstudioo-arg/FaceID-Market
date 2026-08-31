import type { MarketLinks } from '@/types/market'

/**
 * Identidad y canales del negocio que usa esta plantilla.
 * Los precios y el catálogo NO viven acá: están en market-pricing.json / panel / Sheets.
 *
 * Para un cliente nuevo, editá estos valores (o las env de CRM/precios).
 */
export const siteConfig = {
  brand: {
    name: 'Marca Demo',
    shortName: 'iPhone Market',
    description:
      'Vidriera online de precios de iPhone en vivo, cotización de Plan Canje y contacto directo.',
    logoSrc: '/logo.svg',
    logoAlt: 'Marca Demo',
  },

  contact: {
    /** Número internacional sin + ni espacios, para wa.me */
    whatsapp: '5491156789012',
    phone: '5491156789012',
    email: 'hola@example.com',
  },

  social: {
    instagram: 'https://www.instagram.com/marca.demo',
    facebook: '',
    youtube: '',
  },

  location: {
    address: 'Av. Demo 123',
    neighborhood: 'Barrio Demo',
    city: 'Ciudad Demo',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Av.+Demo+123',
  },

  website: 'https://www.example.com',

  links: {
    cotizador: 'https://www.example.com/cotizador',
  },

  seo: {
    title: 'iPhone Market | Marca Demo',
    description:
      'Precios en vivo de iPhones nuevos sellados. Garantía oficial Apple. Retiro en local.',
    siteUrl: 'https://www.example.com',
    ogImage: '/hero-iphone17-lineup.png',
  },

  analytics: {
    enabled: false,
    metaPixelId: '',
    clarityId: '',
  },

  crm: {
    enabled: false,
    webhookUrl: '',
  },

  booking: {
    enabled: false,
    /** Base del iframe de reservas. Vacío o example.com = desconectado. */
    widgetUrl: 'https://example.com/widget/booking?lang=es',
    fieldModelo: 'modelo_nuevo',
    fieldAlmacenamiento: 'almacenamiento_nuevo',
    fieldColor: 'color_nuevo',
  },

  assets: {
    heroImage: '/hero-iphone17-lineup.png',
    heroAlt: 'Línea de iPhones sellados',
    storePhotos: [
      { src: '/store-1.jpg', alt: 'Frente del local' },
      { src: '/store-2.jpg', alt: 'Interior del local' },
      { src: '/store-3.jpg', alt: 'Showroom' },
    ],
  },

  reviews: {
    scoreLabel: '4.9 en Google Reviews',
    items: [
      {
        name: 'Ana López',
        meta: 'Local Guide · 12 opiniones',
        stars: 5,
        text: 'Excelente atención y el equipo llegó sellado. Coordinamos el retiro sin problemas.',
      },
      {
        name: 'Martín Gómez',
        meta: '8 opiniones',
        stars: 5,
        text: 'Precios claros y respuesta rápida por WhatsApp. Volvería a comprar.',
      },
      {
        name: 'Lucía Fernández',
        meta: '5 opiniones',
        stars: 5,
        text: 'Llevé mi iPhone usado como parte de pago y el proceso fue simple y transparente.',
      },
    ],
  },

  theme: {
    storageKey: 'market-theme',
  },
} as const

export type SiteConfig = typeof siteConfig

export function getSiteLinks(): MarketLinks {
  return {
    sellYourIphone: siteConfig.links.cotizador,
    mainSite: siteConfig.website,
    instagram: siteConfig.social.instagram,
  }
}

export function locationLine(): string {
  const { address, neighborhood, city } = siteConfig.location
  return [address, neighborhood, city].filter(Boolean).join(', ')
}

export function locationCityLine(): string {
  const { neighborhood, city } = siteConfig.location
  return [neighborhood, city].filter(Boolean).join(', ')
}
