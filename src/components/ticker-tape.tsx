import type { Model } from '@/types/market'
import { formatPrice, formatStorage } from '@/lib/format'

const directionStyle = {
  up: { color: 'text-emerald-600 dark:text-emerald-400', symbol: '▲' },
  down: { color: 'text-red-500 dark:text-red-400', symbol: '▼' },
  same: { color: 'text-fg-muted', symbol: '' },
}

interface TickerTapeProps {
  models: Model[]
}

// Deduplicate variants: keep one per storage (first color / cheapest)
function getTickerVariants(model: Model) {
  const seen = new Set<string>()
  return model.variants.filter(v => {
    if (seen.has(v.storage)) return false
    seen.add(v.storage)
    return true
  })
}

function TickerItem({ model }: { model: Model }) {
  const variants = getTickerVariants(model)
  if (!variants.length) return null

  return (
    <span className="inline-flex items-center gap-2 px-4 whitespace-nowrap">
      <span className="text-fg-muted font-semibold text-xs">
        <span className="hidden sm:inline">iPhone </span>{model.name.replace('iPhone ', '')}
      </span>
      {variants.map((variant) => {
        const vs = directionStyle[variant.direction]
        return (
          <span key={variant.storage} className="inline-flex items-center gap-1">
            <span className="text-fg-subtle text-[11px]">{formatStorage(variant.storage)}</span>
            <span className={`font-mono font-bold text-xs ${vs.color}`}>
              {variant.priceUSD > 0 ? `$${formatPrice(variant.priceUSD)}` : 'Consultar'}
            </span>
            {vs.symbol && <span className={`text-[8px] ${vs.color}`}>{vs.symbol}</span>}
          </span>
        )
      })}
      <span className="text-line mx-2">│</span>
    </span>
  )
}

export function TickerTape({ models }: TickerTapeProps) {
  return (
    <div className="w-full overflow-hidden bg-bg-subtle border-b border-line py-2">
      <div className="flex animate-ticker">
        {/* Duplicate for seamless loop */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {models.map((model) => (
              <TickerItem key={`${copy}-${model.id}`} model={model} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
