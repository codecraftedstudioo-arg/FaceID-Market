import { useState } from 'react'
import { siteConfig } from '@/config/site'

// Widget de reservas embebido (iframe). No usamos form_embed.js del proveedor:
// ese script mide el contenido y redimensiona el iframe en vivo, lo que provocaba
// el "abre chico y después salta" + lag. Altura fija + scroll interno.
const FIELD_MODELO = siteConfig.booking.fieldModelo
const FIELD_ALMACENAMIENTO = siteConfig.booking.fieldAlmacenamiento
const FIELD_COLOR = siteConfig.booking.fieldColor

interface BookingCalendarProps {
  /** Nombre del modelo, ej. "iPhone 15 Pro". */
  modelo?: string
  /** Almacenamiento ya formateado, ej. "256GB". */
  almacenamiento?: string
  /** Color en español, ej. "Azul Niebla". */
  color?: string
}

export function buildBookingSrc({ modelo, almacenamiento, color }: BookingCalendarProps): string {
  const url = new URL(siteConfig.booking.widgetUrl)
  if (modelo) url.searchParams.set(FIELD_MODELO, modelo)
  if (almacenamiento) url.searchParams.set(FIELD_ALMACENAMIENTO, almacenamiento)
  if (color) url.searchParams.set(FIELD_COLOR, color)
  return url.toString()
}

export function BookingCalendar({ modelo, almacenamiento, color }: BookingCalendarProps) {
  const [loaded, setLoaded] = useState(false)
  const enabled = siteConfig.booking.enabled && Boolean(siteConfig.booking.widgetUrl)

  if (!enabled) {
    return (
      <div className="relative w-full h-[68vh] min-h-[440px] rounded-xl overflow-hidden bg-surface dark:bg-[#2A2A2A] flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-fg font-medium">Agenda de llamadas</p>
        <p className="text-sm text-fg-muted max-w-sm">
          El calendario se activa cuando configures la URL del widget en la configuración del sitio.
          Mientras tanto, escribinos por WhatsApp.
        </p>
      </div>
    )
  }

  const src = buildBookingSrc({ modelo, almacenamiento, color })

  return (
    <div className="relative w-full h-[68vh] min-h-[440px] rounded-xl overflow-hidden bg-white">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface dark:bg-[#2A2A2A] text-fg-muted">
          <span className="w-8 h-8 rounded-full border-2 border-fg/15 border-t-fg/60 animate-spin" />
          <span className="text-sm">Cargando agenda…</span>
        </div>
      )}
      <iframe
        src={src}
        title="Agendar una llamada"
        onLoad={() => setLoaded(true)}
        className="w-full h-full"
        style={{ border: 'none' }}
      />
    </div>
  )
}
