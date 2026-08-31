import { locationLine, siteConfig } from '@/config/site'

export function StorePhotos() {
  return (
    <section className="py-16 px-6 bg-bg-subtle dark:bg-[#191919]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-fg mb-3">
          Nuestro local
        </h2>
        <p className="text-center text-fg-muted text-sm sm:text-base mb-10 max-w-md mx-auto">
          {locationLine()}. Atención personalizada y retiro inmediato.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {siteConfig.assets.storePhotos.map((photo, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-line group"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                width={600}
                height={400}
                className="w-full h-56 sm:h-72 lg:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
