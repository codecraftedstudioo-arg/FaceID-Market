import { useMemo, useState, type ReactNode } from 'react'
import { getIphoneImage } from '@/lib/iphone-images'

interface IphoneImageProps {
  modelId: string
  color?: string | null
  /**
   * Foto del color en el panel (Supabase Storage). Se usa como fallback cuando el
   * bundle local no tiene imagen para ese color (típico de un color cargado nuevo
   * desde el panel, que todavía no tiene archivo en /public/iphones/).
   */
  photoUrl?: string
  alt: string
  className?: string
  draggable?: boolean
  /** Qué renderizar si fallan TODAS las fuentes (ej. silueta SVG). */
  fallback?: ReactNode
}

/**
 * Imagen de iPhone con cadena de fuentes:
 *   bundle con color → bundle sin color → foto del panel → fallback.
 * Avanza a la siguiente fuente en cada `onError`; cuando se agotan, muestra `fallback`.
 */
export function IphoneImage({
  modelId,
  color,
  photoUrl,
  alt,
  className,
  draggable,
  fallback = null,
}: IphoneImageProps) {
  const sources = useMemo(() => {
    const list = [getIphoneImage(modelId, color), getIphoneImage(modelId)]
    if (photoUrl) list.push(photoUrl)
    return Array.from(new Set(list))
  }, [modelId, color, photoUrl])

  const [idx, setIdx] = useState(0)
  // Si cambian las fuentes (otro color/modelo), reseteamos a la primera.
  const key = sources.join('|')
  const [lastKey, setLastKey] = useState(key)
  if (key !== lastKey) {
    setLastKey(key)
    setIdx(0)
  }

  if (idx >= sources.length) return <>{fallback}</>

  return (
    <img
      src={sources[idx]}
      alt={alt}
      className={className}
      draggable={draggable}
      onError={() => setIdx((i) => i + 1)}
    />
  )
}
