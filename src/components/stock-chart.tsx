import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { createChart, AreaSeries, ColorType } from 'lightweight-charts'
import type { Model } from '@/types/market'
import { useTheme } from '@/lib/use-theme'
import { siteConfig } from '@/config/site'

// Paleta de UI del chart según tema (las series verde/roja sirven en ambos).
function chartPalette(isDark: boolean) {
  return {
    axisText: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(60, 60, 67, 0.5)',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)',
    crossColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.18)',
    crossLabelBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    markerBg: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.55)',
  }
}

interface ProductInfo {
  name: string
  storage: string
  color?: string
  price: number
  direction: string
  priceDiff: number
}

const colorNameES: Record<string, string> = {
  Orange: 'Naranja', Blue: 'Azul', Silver: 'Plateado', Black: 'Negro',
  White: 'Blanco', Green: 'Verde', Pink: 'Rosa', Red: 'Rojo',
  Lavender: 'Lavanda', Sage: 'Verde Salvia', 'Mist Blue': 'Azul Niebla',
  'Sky Blue': 'Celeste', 'Light Gold': 'Dorado Claro', 'Cloud White': 'Blanco Nube',
  'Space Black': 'Negro Espacial', 'Soft Pink': 'Rosa Suave',
  Ultramarine: 'Ultramarino', Teal: 'Turquesa', Yellow: 'Amarillo',
}

/** Flatten all models+variants into a list of products */
function buildProductList(models: Model[]): ProductInfo[] {
  const list: ProductInfo[] = []
  for (const model of models) {
    for (const v of model.variants) {
      if (v.priceUSD > 0) {
        list.push({
          name: model.name,
          storage: v.storage === '1024' ? '1 TB' : `${v.storage} GB`,
          color: v.color,
          price: v.priceUSD,
          direction: v.direction || 'same',
          priceDiff: v.priceDiff || 0,
        })
      }
    }
  }
  return list
}

/** Generate chart data that oscillates around a center price */
function generateData(centerPrice: number) {
  const count = 90
  const data: { time: string; value: number }[] = []
  let price = centerPrice * 0.97
  let bias = 0.08

  const startDate = new Date('2025-06-01')

  for (let i = 0; i < count; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    if (Math.random() < 0.06) bias = -bias

    const range = centerPrice * 0.015
    const change = (Math.random() - 0.5 + bias) * range
    const min = centerPrice * 0.92
    const max = centerPrice * 1.08
    price = Math.max(min, Math.min(max, price + change))

    data.push({ time: dateStr, value: Math.round(price) })
  }

  return data
}

interface StockChartProps {
  compact?: boolean
  models?: Model[]
}

export function StockChart({ compact = false, models = [] }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const seriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null)
  const products = useRef<ProductInfo[]>(buildProductList(models))
  const productIdx = useRef(0)
  const { isDark } = useTheme()

  const getProduct = useCallback(() => {
    const list = products.current
    if (list.length === 0) return { name: 'iPhone', storage: '256 GB', price: 950, direction: 'up', priceDiff: 0 }
    return list[productIdx.current % list.length]
  }, [])

  const initial = getProduct()
  const [displayProduct, setDisplayProduct] = useState<ProductInfo>(initial)
  const [livePrice, setLivePrice] = useState(initial.price)

  // Update products when models prop changes
  useEffect(() => {
    products.current = buildProductList(models)
  }, [models])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let currentProduct = getProduct()
    let currentPrice = currentProduct.price
    const firstPrice = currentPrice
    let tickCount = 0

    const green = {
      top: 'rgba(34, 197, 94, 0.25)',
      bottom: 'rgba(34, 197, 94, 0.0)',
      line: 'rgba(34, 197, 94, 0.8)',
    }
    const red = {
      top: 'rgba(239, 68, 68, 0.25)',
      bottom: 'rgba(239, 68, 68, 0.0)',
      line: 'rgba(239, 68, 68, 0.8)',
    }

    // Colores iniciales del tema actual (luego se actualizan in-place, ver abajo).
    const { axisText, gridColor, crossColor, crossLabelBg, markerBg } = chartPalette(isDark)

    const chartData = generateData(currentPrice)
    currentPrice = chartData[chartData.length - 1].value

    const isUp = currentPrice >= firstPrice
    const colors = isUp ? green : red

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: axisText,
        fontSize: 10,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      width: container.clientWidth,
      height: compact ? (container.clientWidth > 768 ? 160 : 120) : 350,
      rightPriceScale: { visible: false },
      timeScale: { visible: false, borderVisible: false },
      crosshair: {
        mode: 0,
        vertLine: { color: crossColor, width: 1, style: 2, labelVisible: false },
        horzLine: { color: crossColor, width: 1, style: 2, labelVisible: true, labelBackgroundColor: crossLabelBg },
      },
      handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: false,
    })

    const series = chart.addSeries(AreaSeries, {
      topColor: colors.top,
      bottomColor: colors.bottom,
      lineColor: colors.line,
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBackgroundColor: markerBg,
      priceLineVisible: false,
      lastValueVisible: false,
    })

    chartRef.current = chart
    seriesRef.current = series

    series.setData(chartData)
    chart.timeScale().fitContent()

    let dayOffset = chartData.length
    let bias = Math.random() > 0.5 ? 0.1 : -0.1

    const interval = setInterval(() => {
      tickCount++

      // Every 5 seconds, rotate to next product
      if (tickCount % 5 === 0 && products.current.length > 0) {
        productIdx.current = (productIdx.current + 1) % products.current.length
        currentProduct = getProduct()
        currentPrice = currentProduct.price
        setDisplayProduct({ ...currentProduct })

        // Regenerate chart for new product
        const newData = generateData(currentProduct.price)
        series.setData(newData)
        chart.timeScale().fitContent()
        dayOffset = newData.length
        currentPrice = newData[newData.length - 1].value
      }

      const date = new Date('2025-06-01')
      date.setDate(date.getDate() + dayOffset)
      const dateStr = date.toISOString().split('T')[0]

      if (Math.random() < 0.08) bias = -bias

      const range = currentProduct.price * 0.012
      const change = (Math.random() - 0.5 + bias) * range
      const min = currentProduct.price * 0.94
      const max = currentProduct.price * 1.06
      currentPrice = Math.max(min, Math.min(max, currentPrice + change))
      const rounded = Math.round(currentPrice)

      series.update({ time: dateStr, value: rounded })
      dayOffset++

      // Price displayed is always the real grid price, fixed
      setLivePrice(currentProduct.price)
    }, 1000)

    const handleResize = () => {
      if (container) {
        chart.applyOptions({ width: container.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
    // Nota: NO depende de isDark a propósito — el cambio de tema se aplica
    // in-place (useLayoutEffect de abajo) para no recrear el canvas.
  }, [getProduct])

  // Cambio de tema → actualiza colores del chart SIN recrearlo, y de forma
  // síncrona (useLayoutEffect), para que entre en la misma "foto" de la
  // transición de tema y no parpadee ni cambie por partes.
  useLayoutEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    const { axisText, gridColor, crossColor, crossLabelBg, markerBg } = chartPalette(isDark)
    chart.applyOptions({
      layout: { textColor: axisText },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
      crosshair: {
        vertLine: { color: crossColor },
        horzLine: { color: crossColor, labelBackgroundColor: crossLabelBg },
      },
    })
    seriesRef.current?.applyOptions({ crosshairMarkerBackgroundColor: markerBg })
  }, [isDark])

  // Product label
  const colorES = displayProduct.color ? (colorNameES[displayProduct.color] || displayProduct.color) : null
  const productLabel = colorES
    ? `${displayProduct.name} · ${displayProduct.storage} · ${colorES}`
    : `${displayProduct.name} · ${displayProduct.storage}`

  if (compact) {
    return (
      <div>
        {/* Product info above chart */}
        <div className="px-4 sm:px-5 pt-3 pb-1">
          <p className="text-xs sm:text-sm text-fg-muted font-mono mb-0.5 truncate">{productLabel}</p>
          <span className="text-fg text-lg sm:text-xl font-bold font-mono tabular-nums leading-none">
            ${livePrice.toLocaleString('es-AR')}
          </span>
        </div>
        {/* Chart */}
        <div ref={containerRef} className="[&_a[href*='tradingview']]:!hidden" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 relative">
      <div className="rounded-2xl border border-line bg-gradient-to-b from-fg/[0.02] to-transparent overflow-hidden">
        {/* HUD header */}
        <div className="px-5 sm:px-8 pt-5 pb-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-fg-muted font-mono mb-1">{productLabel}</p>
            <span className="text-fg text-4xl sm:text-5xl font-bold font-mono tabular-nums leading-none">
              ${livePrice.toLocaleString('es-AR')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-[pulse_1s_ease-in-out_infinite]" />
            <span className="text-[10px] text-fg-muted font-mono">EN VIVO</span>
          </div>
        </div>
        {/* Chart */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-bg dark:from-black/40 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg dark:from-black/40 to-transparent z-10 pointer-events-none" />
          <div ref={containerRef} className="[&_a[href*='tradingview']]:!hidden" />
        </div>
        {/* Footer bar */}
        <div className="px-5 sm:px-8 py-2.5 border-t border-line flex items-center justify-between">
          <span className="text-[10px] text-fg-subtle font-mono">{siteConfig.brand.name} · {siteConfig.location.city}</span>
          <span className="text-[10px] text-fg-subtle font-mono">Actualización cada 1s</span>
        </div>
      </div>
    </div>
  )
}
