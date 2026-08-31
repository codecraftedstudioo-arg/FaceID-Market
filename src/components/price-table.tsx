import { useState, useMemo, useEffect } from 'react'
import type { Model, Accessory } from '@/types/market'
import { formatPrice, formatStorage } from '@/lib/format'
import { StockChart } from '@/components/stock-chart'
import { ProductModal } from '@/components/product-modal'
import { IphoneImage } from '@/components/iphone-image'
import { useAnimatedNumber } from '@/lib/use-animated-number'
import {
  variantPassesFilters as variantPassesMarketFilters,
  modelPassesFilters,
  variantAvailability,
  UNAVAILABLE_LABEL,
} from '@/lib/market-filters'
import { siteConfig } from '@/config/site'

interface PriceTableProps {
  models: Model[]
  accessories?: Accessory[]
  loading?: boolean
  /** Error de carga (p. ej. panel Admin caído). No confundir con empty state. */
  error?: string | null
}

type SortMode = 'price-asc' | 'price-desc' | 'featured' | null

/** Precio animado: anima entre el valor anterior y el nuevo (variant switch, live updates). */
function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const animated = useAnimatedNumber(value, 350)
  return <span className={className}>${animated.toLocaleString('es-AR')}</span>
}

/** Llama estilo Material — pegamos a HOT SALE como un sticker */
function FlameIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 1.5c.2 1.6-.5 2.8-1.3 3.8C5.7 6.5 4.5 7.9 4.5 9.7 4.5 12.5 6.5 14.5 8 14.5s3.5-2 3.5-4.8c0-1.5-.7-2.4-1.4-3.2-.4-.5-.8-1-.9-1.6-.3 1-1 1.6-1.6 2.2-.6.5-1.1 1-1.1 1.8 0 .5.2.9.5 1.2-1-.3-1.7-1.2-1.7-2.3 0-1.3.8-2.3 1.5-3.2.6-.7 1.1-1.5 1.2-2.6z" />
    </svg>
  )
}

/** Badge sticker — gradient + rotación mínima, estilo Mercado Libre Hot Sale */
function OfferBadge({ className = '', dropAmount }: { className?: string; dropAmount?: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black text-white rounded-md shrink-0 shadow-[0_3px_10px_-2px_rgba(255,23,68,0.55)] -rotate-[1.5deg] ${className}`}
      style={{
        background: 'linear-gradient(135deg, #FF1744 0%, #FF5722 70%, #FF8C00 100%)',
      }}
    >
      <FlameIcon className="w-3.5 h-3.5" />
      <span className="tabular-nums leading-none">
        {dropAmount ? <>−${dropAmount} <span className="opacity-80 font-bold">OFF</span></> : 'OFERTA'}
      </span>
    </span>
  )
}

const sortOptions: { mode: SortMode; label: string }[] = [
  { mode: 'price-asc', label: 'Menor precio' },
  { mode: 'price-desc', label: 'Mayor precio' },
]


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

// Prefiere el color real del panel (variant.colorHex); si no, el colorMap por nombre.
// Exportado para testear la cadena de fallback (panel hex → colorMap → undefined).
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

const sparklineCache = new Map<string, number[]>()

function getSparkline(modelId: string, direction: 'up' | 'down' | 'same'): number[] {
  if (sparklineCache.has(modelId)) return sparklineCache.get(modelId)!
  let seed = 0
  for (let i = 0; i < modelId.length; i++) seed = ((seed << 5) - seed + modelId.charCodeAt(i)) | 0
  const rand = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed & 0x7fffffff) / 2147483647 }

  const points: number[] = []
  let val = 50
  const bias = direction === 'up' ? 0.12 : direction === 'down' ? -0.12 : 0
  for (let i = 0; i < 20; i++) {
    val = Math.max(10, Math.min(90, val + (rand() - 0.5 + bias) * 12))
    points.push(val)
  }
  sparklineCache.set(modelId, points)
  return points
}

function Sparkline({ modelId, direction }: { modelId: string; direction: 'up' | 'down' | 'same' }) {
  const points = getSparkline(modelId, direction)
  const w = 60, h = 24
  const stepX = w / (points.length - 1)
  const min = Math.min(...points), max = Math.max(...points)
  const range = max - min || 1
  const pathD = points.map((p, i) => {
    const x = i * stepX
    const y = h - ((p - min) / range) * h
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  // 'same' usa un gris medio para que sea visible tanto en claro como en oscuro.
  const color = direction === 'up' ? 'rgba(34,197,94,0.6)' : direction === 'down' ? 'rgba(239,68,68,0.6)' : 'rgba(120,120,120,0.5)'

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
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
  const [sort, setSort] = useState<SortMode>(null)
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({})
  const [modalModel, setModalModel] = useState<{ model: Model; storage: string; color?: string } | null>(null)
  const [showSkeletonText, setShowSkeletonText] = useState(false)

  const isLoading = loading && models.length === 0 && !error
  useEffect(() => {
    if (!isLoading) { setShowSkeletonText(false); return }
    const t = setTimeout(() => setShowSkeletonText(true), 400)
    return () => clearTimeout(t)
  }, [isLoading])

  const sortedModels = useMemo(() => {
    let copy = [...models]
    if (onlyAvailable) {
      copy = copy.filter(m => modelPassesFilters(m, { onlyAvailable, onlyDrops: false }))
    }
    const minPrice = (m: Model) => Math.min(...m.variants.filter(v => v.priceUSD > 0).map(v => v.priceUSD), Infinity)
    switch (sort) {
      case 'price-asc':
        return copy.sort((a, b) => minPrice(a) - minPrice(b))
      case 'price-desc':
        return copy.sort((a, b) => minPrice(b) - minPrice(a))
      case 'featured':
        return copy.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
      default:
        return copy
    }
  }, [models, sort, onlyAvailable])

  const rows = useMemo(() => {
    return sortedModels.flatMap((model, mi) => {
      const colors = getModelColors(model)
      const hasColors = colors.length > 0

      const validColors = hasColors
        ? colors.filter(c => model.variants.some(v => v.color === c && variantPassesMarketFilters(v, { onlyAvailable, onlyDrops: false })))
        : []
      const effectiveColors = validColors.length > 0 ? validColors : colors

      const defaultColor = hasColors ? getBestDefaultColor(model, effectiveColors) : null
      const userColor = selectedColors[model.id]
      const activeColor = hasColors
        ? (userColor && colors.includes(userColor) ? userColor : defaultColor)
        : null

      const filtered = hasColors
        ? model.variants.filter(v => v.color === activeColor)
        : model.variants

      return filtered.map((v, vi) => {
        const availableInColors = hasColors
          ? model.variants
              .filter(ov =>
                ov.storage === v.storage &&
                ov.color !== activeColor &&
                ov.priceUSD > 0 &&
                ov.inStock !== false
              )
              .map(ov => ov.color!)
              .filter((c, i, arr) => arr.indexOf(c) === i)
          : []

        return {
          model,
          variant: v,
          variantIdx: vi,
          isFirstOfModel: vi === 0,
          isLastVariant: vi === filtered.length - 1,
          isLastModel: mi === sortedModels.length - 1,
          modelColors: hasColors ? colors : null,
          activeColor,
          availableInColors,
        }
      })
    })
  }, [sortedModels, selectedColors, onlyAvailable])

  return (
    <section id="precios" className="px-4 sm:px-6 pt-8 pb-12 scroll-mt-20">
      <div className="max-w-3xl lg:max-w-5xl mx-auto">
        <div className="rounded-2xl border border-line dark:border-[#3F3F3F] overflow-hidden bg-surface dark:bg-[#191919] shadow-[0_18px_50px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_0_40px_-12px_rgba(74,107,219,0.12)]">
          {/* Title */}
          <div className="px-4 sm:px-5 pt-4 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-fg flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="sm:hidden">Precios</span>
                <span className="hidden sm:inline">Precios actualizados en tiempo real</span>
                <span className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                  <span className="text-red-500 dark:text-red-400 text-[10px] sm:text-xs font-semibold tracking-wide">En vivo</span>
                </span>
              </h2>
              <p className="text-fg-muted text-xs sm:text-sm mt-3 sm:mt-1">{siteConfig.brand.name} Market</p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setOnlyAvailable(!onlyAvailable)}
                className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  onlyAvailable
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
                }`}
              >
                Disponibles
              </button>
              {sortOptions.map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => setSort(sort === mode ? null : mode)}
                  className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    sort === mode
                      ? 'border-[#4A6BDB] bg-[#4A6BDB]/20 text-[#4A6BDB] dark:text-[#6B8AED]'
                      : 'border-line text-fg-muted hover:border-line-strong hover:text-fg'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {error ? (
            <div
              role="alert"
              className="mx-4 sm:mx-5 mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </div>
          ) : null}
          {/* Chart */}
          <div className="border-b border-line dark:border-[#3F3F3F]">
            {models.length > 0 ? (
              <StockChart compact models={models} />
            ) : error ? (
              <div className="px-4 sm:px-5 pt-3 pb-6 text-sm text-fg-muted">
                Los precios no están disponibles por ahora.
              </div>
            ) : (
              <div className="px-4 sm:px-5 pt-3 pb-3">
                <div className="h-3 sm:h-4 w-40 rounded skeleton-shimmer mb-2" />
                <div className="h-5 sm:h-6 w-28 rounded skeleton-shimmer mb-3" />
                <div className="h-[120px] sm:h-[160px] w-full rounded-md skeleton-shimmer" />
              </div>
            )}
          </div>

          {/* ===== MOBILE: Cards ===== */}
          <div className="lg:hidden flex flex-col gap-3 p-3">
            {isLoading && showSkeletonText && (
              <p className="text-center text-[11px] text-fg-muted pt-1">
                Cargando precios en tiempo real…
              </p>
            )}
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
              <div key={`skel-m-${i}`} className="rounded-xl border border-line dark:border-[#3F3F3F] px-4 py-5 bg-surface-2 dark:bg-[#202020]">
                <div className="flex gap-4 mb-4">
                  <div className="w-28 h-28 rounded skeleton-shimmer shrink-0" />
                  <div className="flex-1 space-y-3 min-w-0">
                    {/* nombre */}
                    <div className="h-5 w-36 rounded skeleton-shimmer" />
                    {/* círculos de color (3) */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full skeleton-shimmer" />
                      <div className="w-6 h-6 rounded-full skeleton-shimmer" />
                      <div className="w-6 h-6 rounded-full skeleton-shimmer" />
                    </div>
                    {/* chips de almacenamiento */}
                    <div className="flex gap-2">
                      <div className="h-7 w-16 rounded-lg skeleton-shimmer" />
                      <div className="h-7 w-16 rounded-lg skeleton-shimmer" />
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-line dark:border-[#3F3F3F]/60">
                  <div className="flex items-center justify-between gap-3">
                    {/* precio */}
                    <div className="h-7 w-28 rounded skeleton-shimmer" />
                    {/* CTA */}
                    <div className="h-11 w-44 rounded-lg skeleton-shimmer" />
                  </div>
                  {/* subtítulo del precio (Bajó/Subió esta semana) */}
                  <div className="h-3 w-44 rounded skeleton-shimmer mt-2" />
                </div>
              </div>
            ))}
            {!isLoading && sortedModels.length === 0 && (
              <div className="text-center py-12 px-4">
                <p className="text-fg-muted text-sm mb-2">No hay iPhones con ese filtro.</p>
                <button
                  onClick={() => setOnlyAvailable(false)}
                  className="text-xs text-[#4A6BDB] dark:text-[#6B8AED] hover:underline cursor-pointer"
                >
                  Limpiar filtro
                </button>
              </div>
            )}
            {!isLoading && sortedModels.map((model) => {
              const colors = getModelColors(model)
              const hasColors = colors.length > 0

              const validColors = hasColors
                ? colors.filter(c => model.variants.some(v => v.color === c && variantPassesMarketFilters(v, { onlyAvailable, onlyDrops: false })))
                : []
              const effectiveColors = validColors.length > 0 ? validColors : colors

              const defaultColor = hasColors ? getBestDefaultColor(model, effectiveColors) : null
              const userColor = selectedColors[model.id]
              const activeColor = hasColors
                ? (userColor && colors.includes(userColor) ? userColor : defaultColor)
                : null

              // No filtramos variantes por stock acá: el filtro "Disponibles" ya decidió
              // qué modelos aparecen. Si el usuario elige un color/capacidad sin stock,
              // la card muestra el mensaje "Sin stock" en vez de quedar en blanco.
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
                <div
                  key={model.id}
                  className={`rounded-xl border px-4 py-5 transition-all duration-200 active:scale-[0.99] shadow-sm dark:shadow-none ${
                    model.featured
                      ? 'bg-surface dark:bg-[#2A2A2A] border-accent/35 ring-1 ring-accent/20'
                      : 'bg-bg-subtle dark:bg-[#202020] border-line dark:border-[#3F3F3F] hover:border-line-strong'
                  }`}
                >
                  {/* Top: image + name/colors/storage */}
                  <div className="flex gap-4 mb-4">
                    <IphoneImage
                      modelId={model.id}
                      color={activeColor}
                      photoUrl={model.variants.find((pv) => pv.color === activeColor)?.photoUrl}
                      alt={model.name}
                      className="w-28 h-28 object-contain shrink-0 self-start drop-shadow-[0_6px_14px_rgba(0,0,0,0.12)] dark:drop-shadow-none"
                      draggable={false}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-base font-bold text-fg">{model.name}</span>
                        {model.featured && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent bg-accent/10 border border-accent/25 rounded-full px-2 py-0.5">
                            <svg viewBox="0 0 20 20" className="w-2.5 h-2.5" fill="currentColor" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            Más elegido
                          </span>
                        )}
                        {activeVariant && activeVariant.direction === 'down' && activeVariant.priceDiff != null && Math.abs(activeVariant.priceDiff) >= 25 && (
                          <OfferBadge dropAmount={Math.abs(activeVariant.priceDiff)} />
                        )}
                      </div>

                      {hasColors && (
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          {colors.map(c => (
                            <button
                              key={c}
                              aria-label={`Color ${colorNameES[c] || c}`}
                              onClick={() => setSelectedColors(prev => ({ ...prev, [model.id]: c }))}
                              className={`shrink-0 block rounded-full transition-shadow cursor-pointer ${
                                c === activeColor
                                  ? 'ring-2 ring-fg/40'
                                  : 'ring-1 ring-fg/15 hover:ring-fg/30'
                              }`}
                              style={{ backgroundColor: swatchHex(c, model.variants) || '#888', width: 28, height: 28 }}
                            />
                          ))}
                          <span className="text-xs text-fg-muted shrink-0">
                            {colorNameES[activeColor || ''] || ''}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {storages.map(s => {
                          const isSelected = s === activeStorage
                          return (
                            <button
                              key={s}
                              onClick={() => setSelectedColors(prev => ({ ...prev, [selectedStorageKey]: s }))}
                              className={`px-4 py-2.5 rounded-lg text-sm font-mono font-medium transition-all cursor-pointer border ${
                                isSelected
                                  ? 'border-[#4A6BDB] bg-[#4A6BDB]/15 text-fg'
                                  : 'border-line text-fg-muted hover:border-line-strong'
                              }`}
                            >
                              {formatStorage(s)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: precio (su línea) + tendencia + botón full-width */}
                  {activeVariant && (() => {
                    const availability = variantAvailability(activeVariant)
                    const available = availability === 'available'
                    const unavailableLabel =
                      UNAVAILABLE_LABEL[availability === 'no-price' ? 'no-price' : 'no-stock']
                    return (
                    <div className="pt-3 border-t border-line dark:border-[#3F3F3F]/60">
                      {activeVariant.priceUSD > 0 ? (
                        <div className="flex items-baseline gap-2 flex-wrap">
                          {hasOffer && activeVariant.priceDiff != null && (
                            <span className="text-sm font-mono tabular-nums text-fg-subtle line-through decoration-[#FF5722]/70 decoration-2 leading-tight">
                              ${formatPrice(activeVariant.priceUSD + Math.abs(activeVariant.priceDiff))}
                            </span>
                          )}
                          <AnimatedPrice
                            value={activeVariant.priceUSD}
                            className={`text-3xl font-bold font-mono tabular-nums leading-none ${hasOffer ? 'text-[#c2410c] dark:text-[#FFB088]' : 'text-fg'}`}
                          />
                        </div>
                      ) : (
                        <span className="text-base font-semibold text-fg-muted">
                          {unavailableLabel}
                        </span>
                      )}
                      {activeVariant.priceUSD > 0 && activeVariant.direction !== 'same' && activeVariant.priceDiff != null && activeVariant.priceDiff !== 0 && (
                        <p
                          className={`inline-flex items-center gap-1.5 text-[13px] font-bold tabular-nums mt-1.5 ${
                            activeVariant.direction === 'down' ? 'text-emerald-600 dark:text-emerald-400' : 'text-fg-muted'
                          }`}
                        >
                          <svg viewBox="0 0 10 10" className="w-3.5 h-3.5 shrink-0" fill="currentColor" aria-hidden="true">
                            {activeVariant.direction === 'down' ? (
                              <polygon points="1,2 9,2 5,9" />
                            ) : (
                              <polygon points="5,1 9,8 1,8" />
                            )}
                          </svg>
                          <span>${Math.abs(activeVariant.priceDiff)} {activeVariant.direction === 'down' ? 'más barato' : 'más caro'} esta semana</span>
                        </p>
                      )}
                      <button
                        onClick={() => setModalModel({ model, storage: activeStorage, color: activeVariant.color })}
                        className={`w-full mt-3 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.99] ${
                          available
                            ? 'bg-accent hover:bg-accent-hover text-white shadow-sm shadow-accent/25 hover:shadow-md hover:shadow-accent/35'
                            : 'bg-fg/10 hover:bg-fg/15 text-fg-muted border border-line-strong'
                        }`}
                      >
                        {available ? 'Reservar al precio de hoy' : 'Consultar disponibilidad'}
                      </button>
                    </div>
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
              )
            })}
          </div>

          {/* ===== DESKTOP: Table ===== */}
          <table className="w-full border-collapse table-fixed hidden lg:table">
        <colgroup>
          <col className="w-auto" />
          <col className="w-[96px]" />
          <col className="w-[160px]" />
          <col className="w-[190px]" />
        </colgroup>

            <thead>
              <tr className="sticky top-[38px] sm:top-[42px] z-10 backdrop-blur-md bg-surface/90 dark:bg-[#191919]/90 border-b border-line dark:border-[#3F3F3F]">
                <th className="text-left text-xs text-fg-muted uppercase tracking-wider font-medium px-5 py-2">
                  Modelo iPhone
                </th>
                <th className="text-center text-xs text-fg-muted uppercase tracking-wider font-medium px-2 py-2">
                  Almac.
                </th>
                <th className="text-xs text-fg-muted uppercase tracking-wider font-medium px-4 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <span>Precio USD</span>
                    <span className="w-[52px] shrink-0" />
                  </div>
                </th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-d-${i}`} className="border-b border-line dark:border-[#3F3F3F]/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded skeleton-shimmer shrink-0" />
                      <div className="h-5 w-40 rounded skeleton-shimmer" />
                    </div>
                  </td>
                  <td className="px-2 py-3"><div className="h-4 w-14 mx-auto rounded skeleton-shimmer" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-20 ml-auto rounded skeleton-shimmer" /></td>
                  <td className="px-3 py-3"><div className="h-9 w-24 mx-auto rounded-lg skeleton-shimmer" /></td>
                </tr>
              ))}
              {!isLoading && rows.map((row) => {
                const { model, variant: v, variantIdx, isFirstOfModel, isLastVariant, isLastModel, modelColors, activeColor } = row
                const storageText = formatStorage(v.storage)
                const availability = variantAvailability(v)
                const isAvailable = availability === 'available'



                return (
                      <tr
                        key={`${model.id}-${v.storage}-${variantIdx}`}
                        onClick={() => {
                          setModalModel({ model, storage: v.storage, color: v.color || activeColor || undefined })
                        }}
                        className={`
                          group/row relative transition-all duration-150 cursor-pointer hover:bg-fg/[0.025] dark:hover:bg-[#4A6BDB]/[0.06] hover:shadow-[inset_3px_0_0_0_rgba(74,107,219,0.6)]
                          ${model.featured ? 'bg-bg-subtle dark:bg-[#2A2A2A]' : ''}
                          ${isLastVariant && !isLastModel
                            ? 'border-b-[3px] border-line-strong dark:border-[#0F0F0F]'
                            : 'border-b border-line dark:border-[#3F3F3F]/30'}
                        `}
                      >
                        <td className="px-5 py-3 max-w-0">
                          {isFirstOfModel ? (
                            <div className="flex items-center gap-3 min-w-0">
                              <IphoneImage
                                modelId={model.id}
                                color={activeColor}
                                photoUrl={model.variants.find((pv) => pv.color === activeColor)?.photoUrl}
                                alt={model.name}
                                className="w-[72px] h-[72px] object-contain shrink-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.12)] dark:drop-shadow-none"
                                draggable={false}
                              />
                              <span className="text-base font-semibold text-fg truncate">
                                {model.name}
                              </span>
                              {model.featured && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent bg-accent/10 border border-accent/25 rounded-full px-2 py-0.5 shrink-0">
                                  <svg viewBox="0 0 20 20" className="w-2.5 h-2.5" fill="currentColor" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                  Más elegido
                                </span>
                              )}
                              {modelColors && (
                                <span className="inline-flex items-center gap-1 shrink-0">
                                  {modelColors.map(c => (
                                    <button
                                      key={c}
                                      aria-label={`Color ${colorNameES[c] || c}`}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedColors(prev => ({ ...prev, [model.id]: c }))
                                      }}
                                      className={`shrink-0 block rounded-full transition-shadow cursor-pointer ${
                                        c === activeColor
                                          ? 'ring-2 ring-fg/40'
                                          : 'ring-1 ring-fg/15 hover:ring-fg/30'
                                      }`}
                                      style={{ backgroundColor: swatchHex(c, model.variants) || '#888', width: 16, height: 16 }}
                                      title={colorNameES[c] || c}
                                    />
                                  ))}
                                  <span className="text-[10px] text-fg-muted ml-0.5">
                                    {colorNameES[activeColor || ''] || ''}
                                  </span>
                                </span>
                              )}
                              {v.direction === 'down' && v.priceDiff != null && Math.abs(v.priceDiff) >= 25 && (
                                <OfferBadge dropAmount={Math.abs(v.priceDiff)} />
                              )}
                              <Sparkline modelId={model.id} direction={v.direction} />
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-fg-muted truncate pl-[76px]">
                              {model.name}
                            </span>
                          )}
                        </td>

                        <td className="px-2 py-3 text-center">
                          <span className="text-sm font-mono text-fg-muted">
                            {storageText}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col items-end gap-0.5 whitespace-nowrap">
                            {isAvailable ? (
                              <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                                {v.direction === 'down' && v.priceDiff != null && Math.abs(v.priceDiff) >= 25 && (
                                  <span className="text-xs font-mono tabular-nums text-fg-subtle line-through decoration-[#FF5722]/70 decoration-2 leading-tight">
                                    ${formatPrice(v.priceUSD + Math.abs(v.priceDiff))}
                                  </span>
                                )}
                                <AnimatedPrice
                                  value={v.priceUSD}
                                  className={`font-bold font-mono text-lg tabular-nums leading-tight ${v.direction === 'down' && v.priceDiff != null && Math.abs(v.priceDiff) >= 25 ? 'text-[#c2410c] dark:text-[#FFB088]' : 'text-fg'}`}
                                />
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-fg-muted">
                                {UNAVAILABLE_LABEL[availability === 'no-price' ? 'no-price' : 'no-stock']}
                              </span>
                            )}
                            {isAvailable && v.direction !== 'same' && v.priceDiff != null && v.priceDiff !== 0 && (
                              <span
                                className={`inline-flex items-center gap-1 text-sm font-bold tabular-nums whitespace-nowrap leading-tight ${
                                  v.direction === 'down' ? 'text-emerald-600 dark:text-emerald-400' : 'text-fg-muted'
                                }`}
                              >
                                <svg viewBox="0 0 10 10" className="w-3.5 h-3.5 shrink-0" fill="currentColor" aria-hidden="true">
                                  {v.direction === 'down' ? (
                                    <polygon points="1,2 9,2 5,9" />
                                  ) : (
                                    <polygon points="5,1 9,8 1,8" />
                                  )}
                                </svg>
                                <span>${Math.abs(v.priceDiff)} {v.direction === 'down' ? 'menos' : 'más'}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span className={`inline-flex items-center justify-center font-semibold rounded-lg transition-colors text-center leading-tight ${
                            isAvailable
                              ? 'text-sm text-accent bg-accent/10 border border-accent/20 px-5 py-2.5 group-hover/row:bg-accent/20'
                              : 'text-xs text-fg-muted bg-fg/5 border border-line px-4 py-2 group-hover/row:bg-fg/10 group-hover/row:text-fg'
                          }`}>
                            {isAvailable ? (<>Reservar al<br />precio de hoy</>) : (<>Consultar<br />disponibilidad</>)}
                          </span>
                        </td>
                      </tr>
                )
              })}
            </tbody>
          </table>
          {/* Hint */}
          <div className="hidden sm:block py-2.5 px-3 border-t border-line dark:border-[#3F3F3F]/40">
            <p className="text-center text-[11px] text-fg-muted">
              {isLoading && showSkeletonText
                ? 'Cargando precios en tiempo real…'
                : 'Seleccioná un modelo para ver detalles y consultar'}
            </p>
          </div>
        </div>
      </div>

      {/* Product Modal */}
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
