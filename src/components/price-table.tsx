import { useState, useEffect } from 'react'
import type { Model, Accessory } from '@/types/market'
import { formatStorage } from '@/lib/format'
import { ProductModal } from '@/components/product-modal'
import { IphoneImage } from '@/components/iphone-image'
import { useAnimatedNumber } from '@/lib/use-animated-number'
import {
  variantAvailability,
  UNAVAILABLE_LABEL,
} from '@/lib/market-filters'

interface PriceTableProps {
  models: Model[]
  accessories?: Accessory[]
  loading?: boolean
  /** Error de carga (p. ej. panel Admin caído). No confundir con empty state. */
  error?: string | null
}

/** Precio animado: anima entre el valor anterior y el nuevo (variant switch, live updates). */
function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const animated = useAnimatedNumber(value, 350)
  return <span className={className}>{animated.toLocaleString('es-AR')}</span>
}

function OfferBadge({ className = '', dropAmount }: { className?: string; dropAmount?: number }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-accent-contrast bg-accent border border-accent rounded-full shrink-0 tabular-nums ${className}`}
    >
      {dropAmount ? `− USD ${dropAmount}` : 'Oferta'}
    </span>
  )
}

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

export function swatchHex(
  name: string,
  variants: Model['variants']
): string | undefined {
  return variants.find((v) => v.color === name)?.colorHex || colorMap[name]
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

function getModelColors(model: Model): string[] {
  const seen = new Set<string>()
  const colors: string[] = []
  for (const v of model.variants) {
    if (v.color && !seen.has(v.color)) {
      seen.add(v.color)
      colors.push(v.color)
    }
  }
  return colors
}

function getBestDefaultColor(model: Model, colors: string[]): string {
  let best = colors[0]
  let bestCount = 0
  for (const c of colors) {
    const inStock = model.variants.filter(v => v.color === c && v.priceUSD > 0 && v.inStock !== false).length
    if (inStock > bestCount) {
      bestCount = inStock
      best = c
    }
  }
  return best
}

export function PriceTable({ models, accessories, loading = false, error = null }: PriceTableProps) {
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({})
  const [modalModel, setModalModel] = useState<{ model: Model; storage: string; color?: string } | null>(null)
  const [showSkeletonText, setShowSkeletonText] = useState(false)

  const isLoading = loading && models.length === 0 && !error
  useEffect(() => {
    if (!isLoading) { setShowSkeletonText(false); return }
    const t = setTimeout(() => setShowSkeletonText(true), 400)
    return () => clearTimeout(t)
  }, [isLoading])

  return (
    <section id="precios" className="px-4 sm:px-6 pt-2 pb-16 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-fg tracking-tight">
              Catálogo
            </h2>
            <p className="text-fg-muted text-sm mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                En vivo
              </span>
              <span className="text-line">·</span>
              <span>Disponibilidad actualizada</span>
            </p>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-line bg-bg-subtle px-4 py-4 text-sm text-fg"
          >
            {error}
          </div>
        ) : null}

        {isLoading && showSkeletonText && (
          <p className="text-center text-sm text-fg-muted mb-4">
            Cargando catálogo…
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`skel-${i}`} className="rounded-2xl border border-line bg-surface p-5">
                <div className="aspect-square rounded-xl skeleton-shimmer mb-4" />
                <div className="h-5 w-36 rounded skeleton-shimmer mb-3" />
                <div className="h-4 w-24 rounded skeleton-shimmer mb-4" />
                <div className="h-8 w-28 rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && models.length === 0 && (
          <div className="text-center py-16 px-4 rounded-2xl border border-line bg-bg-subtle">
            <p className="text-fg font-medium mb-1">No hay iPhones en el catálogo.</p>
            <p className="text-sm text-fg-muted">Volvé a intentar en unos minutos.</p>
          </div>
        )}

        {!isLoading && models.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {models.map((model) => {
              const colors = getModelColors(model)
              const hasColors = colors.length > 0

              const defaultColor = hasColors ? getBestDefaultColor(model, colors) : null
              const userColor = selectedColors[model.id]
              const activeColor = hasColors
                ? (userColor && colors.includes(userColor) ? userColor : defaultColor)
                : null

              const filtered = hasColors
                ? model.variants.filter(v => v.color === activeColor)
                : model.variants

              const storages = filtered.map(v => v.storage).filter((s, i, arr) => arr.indexOf(s) === i)

              const selectedStorageKey = `${model.id}-storage`
              const firstWithPrice = filtered.find(v => v.priceUSD > 0)
              const defaultStorage = firstWithPrice?.storage || storages[0]
              const userStorage = selectedColors[selectedStorageKey]
              const activeStorage = userStorage && storages.includes(userStorage) ? userStorage : defaultStorage
              const activeVariant = filtered.find(v => v.storage === activeStorage)
              const hasOffer = !!(
                activeVariant &&
                activeVariant.direction === 'down' &&
                activeVariant.priceDiff != null &&
                Math.abs(activeVariant.priceDiff) >= 25
              )

              return (
                <article
                  key={model.id}
                  className="group rounded-2xl border border-line bg-surface p-5 flex flex-col shadow-[var(--shadow-sm)] hover:border-line-strong transition-all duration-200"
                >
                  <div className="relative aspect-square rounded-xl bg-bg-subtle mb-4 flex items-center justify-center overflow-hidden">
                    <IphoneImage
                      modelId={model.id}
                      color={activeColor}
                      photoUrl={model.variants.find((pv) => pv.color === activeColor)?.photoUrl}
                      alt={model.name}
                      className="w-[78%] h-[78%] object-contain"
                      draggable={false}
                    />
                    {hasOffer && activeVariant?.priceDiff != null && (
                      <span className="absolute top-3 left-3">
                        <OfferBadge dropAmount={Math.abs(activeVariant.priceDiff)} />
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-base font-semibold text-fg leading-snug">
                      {model.name}
                    </h3>
                    {model.featured && (
                      <span className="shrink-0 text-[10px] font-semibold text-accent-contrast bg-accent border border-accent rounded-full px-2 py-0.5">
                        Destacado
                      </span>
                    )}
                  </div>

                  {hasColors && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {colors.map(c => (
                        <button
                          key={c}
                          type="button"
                          aria-label={`Color ${colorNameES[c] || c}`}
                          onClick={() => setSelectedColors(prev => ({ ...prev, [model.id]: c }))}
                          className={`shrink-0 block rounded-full transition-shadow cursor-pointer ${
                            c === activeColor
                              ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface'
                              : 'ring-1 ring-line hover:ring-line-strong'
                          }`}
                          style={{ backgroundColor: swatchHex(c, model.variants) || '#888', width: 22, height: 22 }}
                        />
                      ))}
                      <span className="text-xs text-fg-subtle">
                        {colorNameES[activeColor || ''] || activeColor || ''}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {storages.map(s => {
                      const isSelected = s === activeStorage
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedColors(prev => ({ ...prev, [selectedStorageKey]: s }))}
                          className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-colors cursor-pointer border ${
                            isSelected
                              ? 'border-transparent bg-cta text-cta-contrast'
                              : 'border-line text-fg-muted hover:border-line-strong'
                          }`}
                        >
                          {formatStorage(s)}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-auto pt-4 border-t border-line">
                    {activeVariant && (() => {
                      const availability = variantAvailability(activeVariant)
                      const available = availability === 'available'
                      const unavailableLabel =
                        UNAVAILABLE_LABEL[availability === 'no-price' ? 'no-price' : 'no-stock']
                      return (
                        <>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              {activeVariant.priceUSD > 0 ? (
                                <p className="font-display text-2xl font-bold text-fg tabular-nums leading-none">
                                  <span className="text-sm font-semibold mr-1">USD</span>
                                  <AnimatedPrice value={activeVariant.priceUSD} />
                                </p>
                              ) : (
                                <p className="text-base font-semibold text-fg-muted">
                                  {unavailableLabel}
                                </p>
                              )}
                              {activeVariant.priceUSD > 0 && activeVariant.direction !== 'same' && activeVariant.priceDiff != null && activeVariant.priceDiff !== 0 && (
                                <p className="text-xs text-fg-subtle mt-1.5 tabular-nums">
                                  {activeVariant.direction === 'down' ? '−' : '+'} USD {Math.abs(activeVariant.priceDiff)} esta semana
                                </p>
                              )}
                            </div>
                            <span
                              className={`shrink-0 text-[11px] font-medium rounded-full px-2.5 py-1 border ${
                                available
                                  ? 'border-emerald-500/30 text-emerald-700 bg-emerald-500/10 dark:text-emerald-300 dark:bg-emerald-400/15'
                                  : 'border-line text-fg-subtle bg-surface'
                              }`}
                            >
                              {available ? 'Disponible' : unavailableLabel === 'Consultar precio' ? 'Consultar' : 'Sin stock'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setModalModel({ model, storage: activeStorage, color: activeVariant.color })}
                            className={`w-full py-3 rounded-[10px] text-sm font-semibold transition-colors ${
                              available
                                ? 'bg-cta hover:bg-cta-hover text-cta-contrast'
                                : 'bg-surface border border-line text-fg hover:bg-bg-subtle'
                            }`}
                          >
                            {available ? 'Ver detalle' : 'Consultar disponibilidad'}
                          </button>
                        </>
                      )
                    })()}
                    {activeVariant && activeVariant.priceUSD <= 0 && (
                      <p className="text-[11px] text-fg-subtle text-center mt-2">
                        {variantAvailability(activeVariant) === 'no-price'
                          ? 'Escribinos y te pasamos el precio de hoy'
                          : 'Probá con otro color o almacenamiento'}
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {modalModel && (
        <ProductModal
          model={modalModel.model}
          accessories={accessories}
          initialStorage={modalModel.storage}
          initialColor={modalModel.color}
          onClose={() => setModalModel(null)}
        />
      )}
    </section>
  )
}
