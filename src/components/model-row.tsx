import type { Model } from '@/types/market'
import { PriceCell } from './price-cell'

interface ModelRowProps {
  model: Model
  index: number
}

export function ModelRow({ model, index }: ModelRowProps) {
  return (
    <div
      className="animate-fadeSlideIn rounded-xl border border-line bg-surface-2 dark:bg-white/[0.04] overflow-hidden"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="flex items-center px-4 sm:px-5 py-2.5 border-b border-line bg-fg/[0.03]">
        <h3 className="text-sm sm:text-base font-bold text-fg">
          {model.name}
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-px bg-line p-px">
        {model.variants.map((v, i) => (
          <PriceCell key={`${v.storage}-${v.color || i}`} variant={v} modelName={model.name} compact />
        ))}
      </div>
    </div>
  )
}
