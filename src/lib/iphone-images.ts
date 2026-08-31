/**
 * Maps model ID + color to iPhone product image path.
 * Images go in /public/iphones/ with naming: {model-id}-{color}.png
 * For models without color variants: {model-id}.png
 * Fallback: generic iPhone silhouette.
 */

const BASE = '/iphones'

export function getIphoneImage(modelId: string, color?: string | null): string {
  if (color) {
    const colorSlug = color.toLowerCase()
    return `${BASE}/${modelId}-${colorSlug}.png`
  }
  return `${BASE}/${modelId}.png`
}
