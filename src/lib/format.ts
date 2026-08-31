export function formatPrice(price: number): string {
  if (price === 0) return 'Consultar'
  return price.toLocaleString('es-AR')
}

export function formatStorage(storage: string): string {
  const gb = parseInt(storage)
  if (gb >= 1024) return `${gb / 1024} TB`
  return `${gb} GB`
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}
