import { useState, useEffect } from 'react'
import type { Model, Accessory } from '@/types/market'
import { formatPrice, formatStorage } from '@/lib/format'
import { accessoryDisplayName, isGiftAccessory } from '@/lib/accessory-format'
import { IphoneImage } from '@/components/iphone-image'
import { BookingCalendar } from '@/components/booking-calendar'
import { buildConsultLink } from '@/lib/whatsapp-builder'
import { useAnimatedNumber } from '@/lib/use-animated-number'
import { variantAvailability } from '@/lib/market-filters'
import { siteConfig } from '@/config/site'
import { trackPixel } from '@/lib/analytics'

const colorMap: Record<string, string> = {
  Orange: '#D97A32',
  Blue: '#5B7DBF',
  Silver: '#C9CDD3',
  Black: '#2A2A2E',
  White: '#E8E8EC',
  Green: '#5BA67A',
  Pink: '#C27A9A',
  Red: '#C45050',
  Lavender: '#C4A8D8',
  Sage: '#A8C5A0',
  'Mist Blue': '#B0C4D8',
  'Sky Blue': '#A8CCE0',
  'Light Gold': '#E8D5B8',
  'Cloud White': '#F0EDE8',
  'Space Black': '#1C1C1E',
  'Soft Pink': '#F2D4D0',
  Ultramarine: '#4A5ABF',
  Teal: '#4AA8A0',
  Yellow: '#E8D44D',
}

const colorNameES: Record<string, string> = {
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

// Miniatura del accesorio: tile blanco (las fotos suelen venir con fondo blanco,
// así se funden limpio), más grande, y si hay varias fotos las rota con cross-fade
// (antes el modal mostraba solo la primera de la galería).
function AccessoryThumb({ photos, name }: { photos: string[]; name: string }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (photos.length <= 1) return
    const id = setInterval(() => setIdx((i) => (i + 1) % photos.length), 2200)
    return () => clearInterval(id)
  }, [photos.length])
  if (!photos[0]) return null
  return (
    <span className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-fg/5 ring-1 ring-line">
      {photos.map((p, i) => (
        <img
          key={p}
          src={p}
          alt={name}
          draggable={false}
          className={`absolute inset-0 w-full h-full object-contain p-1 transition-opacity duration-500 ${
            i === idx ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </span>
  )
}

interface ProductModalProps {
  model: Model
  accessories?: Accessory[]
  initialStorage?: string
  initialColor?: string
  onClose: () => void
}

export function ProductModal({ model, accessories, initialStorage, initialColor, onClose }: ProductModalProps) {
  // Extract unique colors and storages
  const colors = (() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const v of model.variants) {
      if (v.color && !seen.has(v.color)) {
        seen.add(v.color)
        result.push(v.color)
      }
    }
    return result
  })()

  const storages = (() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const v of model.variants) {
      if (!seen.has(v.storage)) {
        seen.add(v.storage)
        result.push(v.storage)
      }
    }
    return result
  })()

  // Prefiere el color real del panel; si no, el colorMap por nombre.
  const colorHexByName = new Map(
    model.variants.filter((v) => v.color).map((v) => [v.color as string, v.colorHex])
  )
  const swatchHex = (name: string) => colorHexByName.get(name) || colorMap[name]

  const hasColors = colors.length > 0
  const [selectedColor, setSelectedColor] = useState(initialColor || colors[0] || '')
  const [selectedStorage, setSelectedStorage] = useState(initialStorage || storages[0] || '')

  // Vista del modal: el detalle del producto, o el calendario de reservas embebido.
  const [view, setView] = useState<'product' | 'cita'>('product')

  // Accesorios (upsell del panel). El cliente puede sumar varios.
  const activeAccessories = accessories ?? []
  const [selectedAccessories, setSelectedAccessories] = useState<Set<string>>(new Set())
  const toggleAccessory = (name: string) =>
    setSelectedAccessories((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  const accessoriesTotal = activeAccessories
    .filter((a) => selectedAccessories.has(a.name))
    .reduce((sum, a) => sum + a.priceUSD, 0)
  const chosenAccessories = activeAccessories.filter((a) =>
    selectedAccessories.has(a.name)
  )

  // Find the matching variant
  const variant = model.variants.find(v =>
    v.storage === selectedStorage && (!hasColors || v.color === selectedColor)
  ) || model.variants.find(v => v.storage === selectedStorage) || model.variants[0]

  const priceText = formatPrice(variant.priceUSD)
  // Precio animado = iPhone + accesorios elegidos. Al sumar/quitar un accesorio el
  // precio principal "se reescribe" hacia el nuevo total (sin mostrar dos precios).
  const animatedPrice = useAnimatedNumber(variant.priceUSD + accessoriesTotal, 350)
  const storageText = formatStorage(variant.storage)
  const availability = variantAvailability(variant)
  const isAvailable = availability === 'available'

  const accentColor = swatchHex(selectedColor) || '#6B8AED'

  // CTA primario: abre el calendario de reservas embebido (intención fuerte → Pixel Lead).
  const openCita = () => {
    trackPixel('track', 'Lead')
    setView('cita')
  }

  // CTA secundario: consulta directa por WhatsApp con el contexto del iPhone elegido.
  const openConsulta = () => {
    const waLink = buildConsultLink(
      model.name,
      storageText,
      `USD ${priceText}`,
      hasColors ? selectedColor : undefined,
      !isAvailable
    )
    trackPixel('track', 'Contact')
    window.open(waLink, '_blank', 'noopener,noreferrer')
  }

  // Lock body scroll SIN que la página salte: al poner overflow:hidden desaparece
  // el scrollbar de la página (en desktop con scrollbars clásicos son ~15px) y todo
  // se corría a la derecha al abrir el modal. Compensamos con padding-right.
  useEffect(() => {
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.body.style.overflow
    const prevPadRight = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPadRight
    }
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop — sin blur en la vista del calendario (el iframe pesado + blur lagea) */}
      <div
        className={`absolute inset-0 bg-black/40 dark:bg-black/70 animate-fadeIn ${view === 'cita' ? '' : 'backdrop-blur-sm'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full bg-surface border border-line sm:rounded-2xl rounded-t-2xl overflow-hidden animate-slideUp max-h-[92vh] flex flex-col shadow-[0_20px_50px_rgba(17,24,39,0.12)] transition-[max-width] duration-300 ${
          view === 'cita' ? 'sm:max-w-lg' : 'sm:max-w-md'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-fg/5 hover:bg-fg/10 text-fg-muted hover:text-fg transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Color accent glow (oculto en la vista calendario para no sumar paint) */}
        {view !== 'cita' && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] h-[180px] blur-3xl opacity-30 transition-colors duration-500"
            style={{ backgroundColor: accentColor }}
          />
        )}

        <div className="overflow-y-auto [scrollbar-gutter:stable]">

        {view === 'cita' ? (
          /* Vista de reserva: header con volver + calendario embebido */
          <div className="px-4 pt-12 pb-5 animate-fadeIn">
            <button
              onClick={() => setView('product')}
              className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors cursor-pointer mb-3"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <p className="text-xs text-fg-subtle mb-1">Agendar una llamada</p>
            <h3 className="text-lg font-bold text-fg mb-4">{model.name}</h3>
            <BookingCalendar
              modelo={model.name}
              almacenamiento={storageText}
              color={hasColors ? colorNameES[selectedColor] || selectedColor : undefined}
            />
          </div>
        ) : (
        <>

        {/* Phone visual */}
        <div className="relative pt-8 pb-4 flex justify-center">
          <div className="relative w-44 h-44">
            {/* Color circle background */}
            <div
              className="absolute inset-[-20%] rounded-full transition-colors duration-500 opacity-15 blur-2xl"
              style={{ backgroundColor: accentColor }}
            />
            <IphoneImage
              modelId={model.id}
              color={selectedColor || null}
              photoUrl={variant.photoUrl}
              alt={`${model.name}${selectedColor ? ` ${colorNameES[selectedColor] || selectedColor}` : ''}`}
              className="relative w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.22)] dark:drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-opacity duration-300"
              draggable={false}
              fallback={
                <svg
                  className="absolute inset-0 w-full h-full text-fg-muted p-6"
                  viewBox="0 0 80 80"
                  fill="none"
                >
                  <rect x="22" y="8" width="36" height="64" rx="8" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="25" y="14" width="30" height="50" rx="4" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="0.5" />
                  <rect x="32" y="16" width="16" height="4" rx="2" fill="currentColor" fillOpacity="0.3" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-6">
          {/* Model name */}
          <h3 className="text-xl font-bold text-fg text-center mb-4">
            {model.name}
          </h3>

          {/* Color selector */}
          {hasColors && (
            <div className="mb-4">
              <p className="text-xs text-fg-muted mb-2">Color</p>
              <div className="flex items-center gap-2">
                {colors.map(c => (
                  <button
                    key={c}
                    aria-label={`Color ${colorNameES[c] || c}`}
                    onClick={() => setSelectedColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                      c === selectedColor
                        ? 'border-accent ring-2 ring-accent/30 scale-110'
                        : 'border-line hover:border-fg/30 hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatchHex(c) || '#888' }}
                    title={colorNameES[c] || c}
                  />
                ))}
                <span className="text-sm text-fg-muted ml-1">
                  {colorNameES[selectedColor] || selectedColor}
                </span>
              </div>
            </div>
          )}

          {/* Storage selector */}
          <div className="mb-5">
            <p className="text-xs text-fg-muted mb-2">Almacenamiento</p>
            <div className="flex gap-2">
              {storages.map(s => {
                const st = formatStorage(s)
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedStorage(s)}
                    className={`px-4 py-2 rounded-[10px] text-sm font-medium border transition-colors cursor-pointer ${
                      s === selectedStorage
                        ? 'border-transparent bg-cta text-cta-contrast'
                        : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
                    }`}
                  >
                    {st}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price */}
          <div className="text-center mb-5">
            {isAvailable ? (
              <>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="font-display text-sm font-semibold text-fg">USD</span>
                  <span className="font-display text-3xl font-bold text-fg tabular-nums">
                    {animatedPrice.toLocaleString('es-AR')}
                  </span>
                </div>
                {/* Con accesorios elegidos mostramos el desglose. La condición mira la
                    cantidad y no el total: si el único elegido es de regalo el total es
                    0 y antes no aparecía nada, así que tildarlo no daba ninguna señal. */}
                {chosenAccessories.length > 0 ? (
                  <p className="text-xs text-fg-muted mt-1.5 tabular-nums">
                    iPhone ${variant.priceUSD.toLocaleString('es-AR')}
                    {' + '}
                    {chosenAccessories.length}{' '}
                    {chosenAccessories.length === 1 ? 'accesorio' : 'accesorios'}{' '}
                    {accessoriesTotal > 0
                      ? `$${accessoriesTotal.toLocaleString('es-AR')}`
                      : 'de regalo'}
                  </p>
                ) : variant.direction !== 'same' && variant.priceDiff != null && variant.priceDiff !== 0 ? (
                  <p
                    className={`inline-flex items-center gap-2 text-base font-bold tabular-nums mt-2 ${
                      variant.direction === 'down' ? 'text-emerald-600 dark:text-emerald-400' : 'text-fg-muted'
                    }`}
                  >
                    <svg viewBox="0 0 10 10" className="w-5 h-5 shrink-0" fill="currentColor" aria-hidden="true">
                      {variant.direction === 'down' ? (
                        <polygon points="1,2 9,2 5,9" />
                      ) : (
                        <polygon points="5,1 9,8 1,8" />
                      )}
                    </svg>
                    <span>
                      ${Math.abs(variant.priceDiff)} {variant.direction === 'down' ? 'más barato' : 'más caro'} esta semana
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-fg-muted mt-1">Precio actualizado en tiempo real</p>
                )}
              </>
            ) : (
              <div>
                <p className="text-sm text-fg-muted">
                  {availability === 'no-price' ? 'Precio a consultar en ' : 'Sin stock en '}
                  {hasColors && selectedColor ? (colorNameES[selectedColor] || selectedColor) + ' · ' : ''}{formatStorage(selectedStorage)}
                </p>
                <p className="text-xs text-fg-subtle mt-1">
                  {availability === 'no-price'
                    ? 'Escribinos y te pasamos el precio de hoy'
                    : 'Probá con otro color o capacidad'}
                </p>
              </div>
            )}
          </div>

          {/* Accesorios opcionales (upsell del panel) */}
          {isAvailable && activeAccessories.length > 0 && (
            <div className="mb-5">
              <p className="text-xs text-fg-muted mb-2 font-medium">
                Sumá accesorios al retirar
              </p>
              <div className="space-y-2">
                {activeAccessories.map((acc) => {
                  const checked = selectedAccessories.has(acc.name)
                  return (
                    <button
                      key={acc.name}
                      type="button"
                      onClick={() => toggleAccessory(acc.name)}
                      className={`w-full flex items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left transition-colors ${
                        checked
                          ? 'border-accent bg-accent/10'
                          : 'border-line bg-bg-subtle hover:border-line-strong'
                      }`}
                    >
                      <span
                        className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          checked ? 'bg-accent border-accent text-accent-contrast' : 'border-line-strong'
                        }`}
                      >
                        {checked && (
                          <svg className="w-3.5 h-3.5 text-accent-contrast" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <AccessoryThumb photos={acc.photos} name={acc.name} />
                      <span className="flex-1 text-sm text-fg">
                        {accessoryDisplayName(acc.name, acc.priceUSD)}
                      </span>
                      {isGiftAccessory(acc.priceUSD) ? (
                        <span className="shrink-0 text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                          Gratis
                        </span>
                      ) : (
                        <span className="shrink-0 text-sm font-semibold text-fg tabular-nums">
                          +USD {acc.priceUSD.toLocaleString('es-AR')}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* CTAs: WhatsApp (lógica intacta). Calendario solo si booking está habilitado. */}
          <div className="space-y-2.5">
            {siteConfig.booking.enabled && siteConfig.booking.widgetUrl ? (
            <button
              type="button"
              onClick={openCita}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[10px] bg-surface border border-line hover:bg-bg-subtle text-fg font-semibold text-base transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 5z" />
              </svg>
              Agendar una llamada
            </button>
            ) : null}
            <button
              type="button"
              onClick={openConsulta}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[10px] bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-base transition-colors cursor-pointer"
            >
              {/* Logo WhatsApp — marca: va relleno (no outline como el resto del set) y en
                  su verde oficial, por eso fija el color y no hereda el del botón. */}
              <svg className="w-4 h-4 shrink-0 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Consultar por WhatsApp
            </button>
          </div>

          <p className="text-[10px] text-center text-fg-subtle mt-3">
            Te responde {siteConfig.brand.name}.
          </p>
        </div>
        </>
        )}
        </div>
      </div>
    </div>
  )
}
