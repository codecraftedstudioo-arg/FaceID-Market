import type { Variant } from '@/types/market'
import { formatPrice, formatStorage } from '@/lib/format'
import { buildBuyLink } from '@/lib/whatsapp-builder'
import { trackPixel } from '@/lib/analytics'

interface PriceCellProps {
  variant: Variant
  modelName: string
  compact?: boolean
}

const directionConfig = {
  up: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    arrow: '▲',
  },
  down: {
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    arrow: '▼',
  },
  same: {
    color: 'text-fg',
    bg: 'bg-fg/[0.06]',
    border: 'border-line',
    arrow: '',
  },
}

export function PriceCell({ variant, modelName, compact }: PriceCellProps) {
  const priceText = formatPrice(variant.priceUSD)
  const storageText = formatStorage(variant.storage)
  const waLink = buildBuyLink(modelName, storageText, `USD ${priceText}`)
  const isAvailable = variant.priceUSD > 0
  const config = directionConfig[variant.direction]

  return (
    <a
      href={isAvailable ? waLink : undefined}
      target={isAvailable ? '_blank' : undefined}
      rel={isAvailable ? 'noopener noreferrer' : undefined}
      onClick={isAvailable ? (e: React.MouseEvent) => {
        e.preventDefault()
        trackPixel('track', 'Contact')
        setTimeout(() => window.open(waLink, '_blank', 'noopener,noreferrer'), 300)
      } : undefined}
      className={`
        group block rounded-lg border transition-all duration-200
        ${isAvailable ? `${config.border} ${config.bg} hover:brightness-105 dark:hover:brightness-125 cursor-pointer` : 'border-line bg-fg/[0.03] opacity-50'}
        ${compact ? 'px-3 py-2' : 'px-4 py-3'}
      `}
    >
      <div className={`text-fg-muted ${compact ? 'text-[10px]' : 'text-xs'} mb-0.5 font-medium`}>
        {storageText}
      </div>
      <div className={`font-bold ${config.color} ${compact ? 'text-sm' : 'text-base sm:text-lg'} flex items-center gap-1.5`}>
        {priceText}
        {config.arrow && (
          <span className={`text-[10px] ${config.color}`}>{config.arrow}</span>
        )}
      </div>
    </a>
  )
}
