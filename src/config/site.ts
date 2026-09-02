import type { MarketLinks } from '@/types/market'

/**
 * Identidad visible de FACE ID.
 * Los precios y el catálogo NO viven acá: los sirve FaceID-Admin.
 */
export const siteConfig = {
  brand: {
    name: 'FACE ID',
    shortName: 'FACE ID Market',
    description:
      'Catálogo de iPhones disponibles. Equipos seleccionados y actualizados en tiempo real.',
    logoSrc: '/brand/logo.jpg',
    logoAlt: 'FACE ID',
  },

  contact: {
    /** Número internacional sin + ni espacios, para wa.me */
    whatsapp: '5491158358369',
    phone: '5491158358369',
    email: '',
  },

  social: {
    instagram: 'https://www.instagram.com/faceidshop/',
    facebook: '',
    youtube: '',
  },

  location: {
    address: 'Agüero 1649',
    neighborhood: '',
    city: 'CABA',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Ag%C3%BCero+1649+CABA',
  },

  website: 'https://www.tiendafaceid.com/',

  links: {
    cotizador: '',
  },

  seo: {
    title: 'FACE ID Market | iPhones disponibles',
    description:
      'Catálogo de iPhones disponibles en FACE ID. Equipos seleccionados y actualizados en tiempo real.',
    siteUrl: 'https://www.tiendafaceid.com/',
    ogImage: '/brand/logo.jpg',
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
    /** Base del iframe de reservas. Vacío o desactivado = no se muestra. */
    widgetUrl: 'https://example.com/widget/booking?lang=es',
    fieldModelo: 'modelo_nuevo',
    fieldAlmacenamiento: 'almacenamiento_nuevo',
    fieldColor: 'color_nuevo',
  },

  assets: {
    heroImage: '',
    heroAlt: 'FACE ID Market',
    storePhotos: [] as { src: string; alt: string }[],
  },

  reviews: {
    scoreLabel: '',
    items: [] as {
      name: string
      meta: string
      stars: number
      text: string
    }[],
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
