// Formato de accesorios (el upsell que se carga desde el panel).
//
// La regla la define EL PRECIO, no un flag de "es promo":
//   priceUSD > 0   → accesorio pago      → "+USD 50"
//   priceUSD === 0 → accesorio de regalo → "Gratis"
//
// Así el que carga los accesorios no tiene que marcar nada extra: pone el precio
// en el panel y la web se acomoda sola. Una promo con precio se sigue mostrando
// con su precio.

/**
 * Marcador que se escribe a mano en el nombre cuando el accesorio va sin cargo
 * (ej. "Cargador 20W (De regalo)"). Solo se saca si el accesorio ES de regalo:
 * la UI ya lo comunica con el badge y si no quedaría repetido.
 */
const GIFT_SUFFIX = /\s*\(\s*(?:de\s+regalo|regalo|gratis|sin\s+cargo|bonificad[oa])\s*\)\s*$/i

/** Un accesorio es de regalo cuando no tiene precio. */
export function isGiftAccessory(priceUSD: number): boolean {
  return !(priceUSD > 0)
}

/**
 * Nombre a mostrar. Si el accesorio tiene precio, el nombre NO se toca nunca:
 * solo se limpia el marcador de regalo redundante en los que van sin cargo.
 */
export function accessoryDisplayName(name: string, priceUSD: number): string {
  if (!isGiftAccessory(priceUSD)) return name
  return name.replace(GIFT_SUFFIX, '').trim() || name
}

/**
 * Texto del accesorio para el mensaje de WhatsApp y para el campo que va al CRM.
 * Antes decía "(+USD 0)" en los de regalo, que es justo lo que se quiere evitar.
 */
export function accessoryLabel(name: string, priceUSD: number): string {
  const display = accessoryDisplayName(name, priceUSD)
  return isGiftAccessory(priceUSD)
    ? `${display} (de regalo)`
    : `${display} (+USD ${priceUSD})`
}
