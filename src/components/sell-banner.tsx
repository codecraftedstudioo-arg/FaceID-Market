interface SellBannerProps {
  storeUrl: string
  instagramUrl: string
}

function ShoppingBagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4A6BDB] dark:text-[#6B8AED]">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4A6BDB] dark:text-[#6B8AED]">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export function SellBanner({ storeUrl, instagramUrl }: SellBannerProps) {
  return (
    <section className="py-8 sm:py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="animate-fadeSlideIn group rounded-xl border border-[#4A6BDB]/25 dark:border-[#263A99]/60 bg-[#4A6BDB]/[0.06] p-5 hover:bg-[#4A6BDB]/[0.12] hover:border-[#4A6BDB]/50 dark:hover:border-[#263A99] transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#4A6BDB]/20 flex items-center justify-center">
              <ShoppingBagIcon />
            </div>
            <h3 className="text-base font-bold text-fg">Tienda online</h3>
          </div>
          <p className="text-fg-muted text-xs leading-relaxed">
            Todos nuestros productos disponibles con compra segura y garantizada.
          </p>
        </a>

        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="animate-fadeSlideIn group rounded-xl border border-[#4A6BDB]/25 dark:border-[#263A99]/60 bg-[#4A6BDB]/[0.06] p-5 hover:bg-[#4A6BDB]/[0.12] hover:border-[#4A6BDB]/50 dark:hover:border-[#263A99] transition-all"
          style={{ animationDelay: '0.08s' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#4A6BDB]/20 flex items-center justify-center">
              <InstagramIcon />
            </div>
            <h3 className="text-base font-bold text-fg">Seguinos en Instagram</h3>
          </div>
          <p className="text-fg-muted text-xs leading-relaxed">
            Mirá lo último que ingresó y el día a día del local.
          </p>
        </a>
      </div>
    </section>
  )
}
