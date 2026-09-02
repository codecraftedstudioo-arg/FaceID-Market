import { useEffect, useState } from 'react'

interface StickyMobileCTAProps {
  /** Element id to watch — sticky shows when this element is scrolled OUT of view (above viewport) */
  watchAnchorId?: string
  /** Element id whose appearance HIDES the sticky (e.g. footer) */
  hideOnAnchorId?: string
  productLabel?: string
  priceText?: string
  ctaText?: React.ReactNode
  onClick: () => void
}

/**
 * Sticky bottom CTA bar shown on mobile when the user has scrolled past a target section
 * but hasn't reached the footer yet. Hidden on `sm` and up.
 */
export function StickyMobileCTA({
  watchAnchorId,
  hideOnAnchorId,
  productLabel,
  priceText,
  ctaText = <>Reservar al precio<br />de hoy</>,
  onClick,
}: StickyMobileCTAProps) {
  const [pastAnchor, setPastAnchor] = useState(false)
  const [nearFooter, setNearFooter] = useState(false)

  useEffect(() => {
    if (!watchAnchorId) return
    const el = document.getElementById(watchAnchorId)
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Anchor scrolled fully above viewport top => we're past it
        setPastAnchor(entry.boundingClientRect.bottom < 0)
      },
      { threshold: 0, rootMargin: '0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [watchAnchorId])

  useEffect(() => {
    if (!hideOnAnchorId) return
    const el = document.getElementById(hideOnAnchorId)
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setNearFooter(entry.isIntersecting),
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hideOnAnchorId])

  const visible = pastAnchor && !nearFooter

  return (
    <div
      className={`lg:hidden fixed inset-x-0 bottom-0 z-50 transform-gpu transition-transform duration-300 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
      inert={!visible}
    >
      <div className="bg-bg/95 backdrop-blur-md border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex flex-col min-w-0 flex-1">
            {productLabel && (
              <span className="text-[11px] leading-tight text-fg-muted truncate">
                {productLabel}
              </span>
            )}
            {priceText && (
              <span className="text-base leading-tight font-semibold text-fg truncate">
                {priceText}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClick}
            className="shrink-0 bg-cta hover:bg-cta-hover text-cta-contrast text-sm font-semibold rounded-[10px] px-4 py-2.5 leading-tight text-center transition-colors"
          >
            {ctaText}
          </button>
        </div>
      </div>
    </div>
  )
}
