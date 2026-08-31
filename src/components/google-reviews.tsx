import { siteConfig } from '@/config/site'

type Review = (typeof siteConfig.reviews.items)[number] & { photos?: string[] }

const reviewsData: Review[] = [...siteConfig.reviews.items]

// El marquee se anima con translateX(-50%), así que la pista tiene que ser dos mitades
// idénticas. Con solo 3 reseñas una mitad no llega a cubrir un monitor ancho y se ve el
// corte, por eso cada mitad repite el set dos veces.
const half = [...reviewsData, ...reviewsData]
const track = [...half, ...half]

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const StarIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    className={`w-3.5 h-3.5 ${filled ? 'text-amber-400' : 'text-fg/20'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

// Iniciales para el avatar, al estilo de la ficha de Google cuando el autor no tiene foto.
function initials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function GoogleReviews() {
  return (
    <section className="relative py-3 sm:py-6 overflow-hidden">
      <div className="absolute inset-0 bg-bg-subtle dark:bg-gradient-to-b dark:from-[#0B0D0B] dark:via-[#070A07] dark:to-[#0B0D0B]" />

      {/* El puntaje va arriba y centrado: al costado quedaba flotando en un hueco y las
          cards le pasaban por detrás. Con poco margen la banda sigue siendo compacta. */}
      <div className="relative z-10">
        <div className="px-4 mb-2.5 flex items-center justify-center gap-2.5">
          <GoogleIcon />
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => <StarIcon key={s} filled />)}
          </div>
          <span className="text-fg-muted text-sm whitespace-nowrap">{siteConfig.reviews.scoreLabel}</span>
        </div>

        {/* overflow-hidden propio: la pista mide varios miles de px y sin esto se
            desborda por encima del puntaje de Google. */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll gap-4 w-max">
            {track.map((review, i) => (
              <article
                key={i}
                className="flex-shrink-0 w-[21rem] bg-surface dark:bg-neutral-900 border border-line rounded-2xl px-4 py-3.5 shadow-sm dark:shadow-none"
              >
                {/* Encabezado: primero quién lo dijo. El autor estaba suelto al pie, que es
                    la jerarquía al revés; acá ancla la card y de paso se ahorra esa línea.
                    La card es ancha (21rem) porque el ancho no cuesta scroll y así entran
                    la línea de "Local Guide · N opiniones" y las estrellas sin truncarse. */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="grid place-items-center shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent text-[11px] font-bold">
                    {initials(review.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-fg text-sm font-semibold leading-tight truncate">{review.name}</p>
                    <p className="text-fg-subtle text-[11px] leading-tight truncate">{review.meta}</p>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= review.stars} />)}
                  </div>
                </div>

                {/* Sin comillas: el encabezado ya deja claro que es una cita.
                    3 líneas y no 2: con esta card (21rem) los tres textos entran enteros,
                    así que el clamp no corta nada y el único "…" que queda es el que ya
                    trae Google en la ficha. */}
                <p className="text-fg-muted text-sm leading-snug line-clamp-3">{review.text}</p>

                {review.photos && (
                  <div className="flex gap-1.5 mt-2">
                    {review.photos.map((src, j) => (
                      <img
                        key={j}
                        src={src}
                        alt={`Foto que subió ${review.name} con su reseña`}
                        loading="lazy"
                        className="w-7 h-7 rounded-md object-cover border border-line"
                      />
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Bordes difuminados: la pista entra y sale sin corte duro */}
          <div className="absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-bg-subtle dark:from-[#080B08] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-bg-subtle dark:from-[#080B08] to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
