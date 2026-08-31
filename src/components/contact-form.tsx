import { useState } from 'react'
import { sendLeadToCrm, isValidArgPhone, type MarketLead } from '@/lib/crm-webhook'
import { buildContactedBuyLink } from '@/lib/whatsapp-builder'
import { accessoryLabel } from '@/lib/accessory-format'
import { siteConfig } from '@/config/site'
import { initPixelAdvancedMatching, trackPixel } from '@/lib/analytics'

interface ContactFormProps {
  iphoneInfo: {
    modelo: string
    almacenamiento: string
    /** Raw English color name (e.g., "Orange"). Translated by the WhatsApp builder. */
    color?: string
    precioUSD: number
    priceText: string
    /** Accesorios que el cliente eligió sumar a la reserva. */
    accessories?: { name: string; priceUSD: number }[]
  }
  /** "reserve" = stock disponible, "waitlist" = sin stock, pide aviso cuando entre. */
  mode?: 'reserve' | 'waitlist'
  onCancel: () => void
  onSubmitted: () => void
}

const NAME_PATTERN = /[^a-zA-ZáéíóúÁÉÍÓÚñÑ. ]/g

export function ContactForm({ iphoneInfo, mode = 'reserve', onCancel, onSubmitted }: ContactFormProps) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<{ nombre?: string; telefono?: string; form?: string }>({})
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return

    const trimmedName = nombre.trim()
    const newErrors: { nombre?: string; telefono?: string } = {}
    if (trimmedName.length < 2) newErrors.nombre = 'Ingresá tu nombre'
    if (!isValidArgPhone(telefono)) newErrors.telefono = 'Teléfono inválido'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSending(true)
    setErrors({})

    const accessories = iphoneInfo.accessories ?? []
    const lead: MarketLead = {
      nombre: trimmedName,
      telefono,
      modelo: iphoneInfo.modelo,
      almacenamiento: iphoneInfo.almacenamiento,
      color: iphoneInfo.color,
      precio_usd: iphoneInfo.precioUSD,
      origen: 'market',
      sin_stock: mode === 'waitlist' ? true : undefined,
      accesorios: accessories.length
        ? accessories.map((a) => accessoryLabel(a.name, a.priceUSD)).join(', ')
        : undefined,
      honeypot,
    }

    // 1. CRM first — guarantees lead capture even if user closes WhatsApp without sending.
    const sent = await sendLeadToCrm(lead)
    setSending(false)

    if (!sent) {
      setErrors({ form: 'No pudimos enviar tu consulta. Probá de nuevo en unos minutos.' })
      return
    }

    // 2. Then open WhatsApp with the prefilled message.
    const waLink = buildContactedBuyLink(
      { nombre: trimmedName, telefono },
      iphoneInfo.modelo,
      iphoneInfo.almacenamiento,
      `USD ${iphoneInfo.priceText}`,
      iphoneInfo.color,
      mode === 'waitlist',
      accessories
    )

    // Meta Pixel Advanced Matching: re-init con datos del usuario para mejorar match rate.
    // El SDK hashea automáticamente con SHA-256 (no se mandan datos en plano).
    // https://developers.facebook.com/docs/meta-pixel/advanced/advanced-matching/
    const phoneE164 =
      telefono.length === 10 ? `549${telefono}` :
      telefono.length === 11 && telefono.startsWith('9') ? `54${telefono}` :
      telefono
    const [firstName, ...rest] = trimmedName.split(/\s+/)
    const lastName = rest.join(' ')
    const matchData: Record<string, string> = { ph: phoneE164, country: 'ar' }
    if (firstName) matchData.fn = firstName.toLowerCase()
    if (lastName) matchData.ln = lastName.toLowerCase()
    const pixelId = siteConfig.analytics.metaPixelId
    if (pixelId) initPixelAdvancedMatching(pixelId, matchData)

    trackPixel('track', 'Lead')
    trackPixel('track', 'Contact')
    window.open(waLink, '_blank', 'noopener,noreferrer')
    onSubmitted()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-fg-muted mb-1.5" htmlFor="contact-nombre">Nombre</label>
          <input
            id="contact-nombre"
            type="text"
            inputMode="text"
            autoComplete="given-name"
            maxLength={40}
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value.replace(NAME_PATTERN, '').slice(0, 40))
              if (errors.nombre || errors.form) setErrors(prev => ({ ...prev, nombre: undefined, form: undefined }))
            }}
            disabled={sending}
            className={`w-full px-3 py-2.5 rounded-lg bg-fg/[0.04] border text-fg placeholder:text-fg-subtle focus:outline-none focus:border-[#4A6BDB] transition-colors ${
              errors.nombre ? 'border-red-500/60' : 'border-line'
            }`}
            placeholder="Tu nombre"
            autoFocus
          />
          {errors.nombre && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.nombre}</p>}
        </div>

        <div>
          <label className="block text-xs text-fg-muted mb-1.5" htmlFor="contact-telefono">Tu WhatsApp</label>
          <input
            id="contact-telefono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={11}
            value={telefono}
            onChange={(e) => {
              setTelefono(e.target.value.replace(/\D/g, '').slice(0, 11))
              if (errors.telefono || errors.form) setErrors(prev => ({ ...prev, telefono: undefined, form: undefined }))
            }}
            disabled={sending}
            className={`w-full px-3 py-2.5 rounded-lg bg-fg/[0.04] border text-fg placeholder:text-fg-subtle focus:outline-none focus:border-[#4A6BDB] transition-colors font-mono tabular-nums ${
              errors.telefono ? 'border-red-500/60' : 'border-line'
            }`}
            placeholder="11 1234 5678"
          />
          {errors.telefono && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.telefono}</p>}
        </div>
      </div>

      {/* Honeypot — invisible, traps bots that fill every field */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
      />

      {errors.form && (
        <p className="text-xs text-red-500 dark:text-red-400 mb-2 text-center">{errors.form}</p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors cursor-pointer"
      >
        {sending
          ? 'Enviando…'
          : mode === 'waitlist'
          ? 'Avisame cuando esté disponible'
          : 'Coordinar la entrega'}
      </button>

      <button
        type="button"
        onClick={onCancel}
        disabled={sending}
        className="block mx-auto mt-2.5 text-xs text-fg-muted hover:text-fg transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        Cancelar
      </button>

      <p className="text-[10px] text-center text-fg-subtle mt-2">
        Al enviar aceptás ser contactado por {siteConfig.brand.name}.
      </p>
    </form>
  )
}
