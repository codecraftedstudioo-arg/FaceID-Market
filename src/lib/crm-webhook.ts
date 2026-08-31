import { siteConfig } from '@/config/site'

/**
 * CRM webhook — Market.
 *
 * Sends lead data to the CRM webhook (siteConfig.crm + VITE_CRM_WEBHOOK_URL).
 * Fire-and-forget: doesn't wait for response, doesn't block the UI.
 *
 * Anti-spam:
 * - Honeypot field (if filled, skip send — bot detected)
 * - Rate limiting via localStorage (max 3 sends per 5 minutes)
 */

function crmWebhookUrl(): string {
  return (import.meta.env.VITE_CRM_WEBHOOK_URL || siteConfig.crm.webhookUrl || '').trim()
}

function isCrmEnabled(): boolean {
  return siteConfig.crm.enabled && Boolean(crmWebhookUrl())
}

const RATE_LIMIT_KEY = 'crm-webhook-sends-market'
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000

export interface MarketLead {
  nombre: string
  telefono: string
  modelo: string
  almacenamiento: string
  color?: string
  precio_usd: number
  origen: 'market'
  /** Lead pidió ser avisado cuando vuelva el stock (waitlist). */
  sin_stock?: boolean
  /** Accesorios que el cliente quiere sumar (ej. "Cargador (+USD 50)"). */
  accesorios?: string
  honeypot?: string
}

const SPAM_PATTERNS: RegExp[] = [
  /^(\d)\1{9,}$/,
  /^0123456789$/, /^1234567890$/, /^9876543210$/,
  /0123456789$/, /1234567890$/, /9876543210$/,
]

function hasLowDigitVariety(localDigits: string): boolean {
  const unique = new Set(localDigits)
  return unique.size <= 2
}

export function isValidArgPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-+()]/g, '')
  if (!/^\d{10,13}$/.test(cleaned)) return false

  let lengthOk = false
  if (cleaned.length === 10) lengthOk = true
  if (cleaned.length === 11 && cleaned.startsWith('9')) lengthOk = true
  if (cleaned.length === 12 && cleaned.startsWith('54')) lengthOk = true
  if (cleaned.length === 13 && cleaned.startsWith('549')) lengthOk = true
  if (!lengthOk) return false

  if (SPAM_PATTERNS.some(p => p.test(cleaned))) return false

  const localDigits = cleaned.slice(-10)
  if (hasLowDigitVariety(localDigits)) return false

  return true
}

function isRateLimited(): boolean {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY)
    if (!raw) return false
    const sends: number[] = JSON.parse(raw)
    const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS
    const recent = sends.filter(t => t > cutoff)
    return recent.length >= RATE_LIMIT_MAX
  } catch {
    return false
  }
}

function recordSend() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY)
    const sends: number[] = raw ? JSON.parse(raw) : []
    const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS
    const recent = sends.filter(t => t > cutoff)
    recent.push(Date.now())
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent))
  } catch { /* ignore */ }
}

export async function sendLeadToCrm(lead: MarketLead): Promise<boolean> {
  if (lead.honeypot && lead.honeypot.trim() !== '') {
    return false
  }

  if (isRateLimited()) {
    return false
  }

  if (!lead.nombre || !lead.telefono) {
    return false
  }
  if (!isValidArgPhone(lead.telefono)) {
    return false
  }

  const { honeypot: _, ...payload } = lead

  recordSend()

  const isLocalhost = typeof window !== 'undefined' &&
    /^(localhost|127\.|0\.0\.0\.0|10\.|172\.|192\.168\.|::1)/.test(window.location.hostname)

  if (import.meta.env.DEV || isLocalhost) {
    console.log('[DEV/LOCAL] CRM webhook (NO enviado):', payload)
    return true
  }

  if (!isCrmEnabled()) {
    return true
  }

  const webhookUrl = crmWebhookUrl()

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
    return true
  } catch {
    return false
  }
}
