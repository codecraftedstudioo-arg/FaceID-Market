import { test, expect } from '@playwright/test'
import { COTIZADOR_URL } from './urls'

// Breakpoints a testear
const VIEWPORTS = [
  { name: 'iPhone SE viejo', width: 320, height: 568 },
  { name: 'iPhone moderno', width: 390, height: 844 },
  { name: 'Pixel / Android', width: 412, height: 915 },
  { name: 'Tablet vertical', width: 768, height: 1024 },
  { name: 'Desktop pequeño', width: 1280, height: 800 },
  { name: 'Desktop grande', width: 1920, height: 1080 },
]

test.describe('Cotizador — Responsive en múltiples viewports', () => {
  for (const vp of VIEWPORTS) {
    test(`${vp.name} (${vp.width}x${vp.height}): home carga sin overflow horizontal`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(`${COTIZADOR_URL}/cotizar?new=1`)
      await page.waitForLoadState('networkidle')

      // No debe haber scroll horizontal
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(hasHorizontalScroll).toBe(false)

      // El botón principal ("Plan Canje" o similar) debe estar visible
      const planCanje = page.getByRole('button').filter({ hasText: /^Plan Canje/i }).first()
      await expect(planCanje).toBeVisible()
    })

    test(`${vp.name}: paso 1 Plan Canje es usable`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(`${COTIZADOR_URL}/cotizar?canje=1`)
      await page.waitForLoadState('networkidle')

      const dropdown = page.getByRole('button', { name: 'Elegí un modelo' })
      await expect(dropdown).toBeVisible()

      // El dropdown no debe estar cortado por la pantalla
      const box = await dropdown.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width)
    })
  }
})

test.describe('Cotizador — Concurrencia (2 pestañas)', () => {
  test('dos sesiones en paralelo no pisan los datos del usuario', async ({ browser }) => {
    // Creamos dos contextos independientes (simula dos pestañas en el mismo browser pero aisladas)
    const ctx1 = await browser.newContext()
    const ctx2 = await browser.newContext()

    const page1 = await ctx1.newPage()
    const page2 = await ctx2.newPage()

    try {
      // Pestaña 1: entra por canje
      await page1.goto(`${COTIZADOR_URL}/cotizar?canje=1`)
      await page1.waitForLoadState('networkidle')
      const body1 = await page1.textContent('body')
      expect(body1).toContain('Qué iPhone querés')

      // Pestaña 2: entra por venta (otra sesión)
      await page2.goto(`${COTIZADOR_URL}/cotizar?new=1`)
      await page2.waitForLoadState('networkidle')
      const body2 = await page2.textContent('body')
      expect(body2).toContain('Qué querés hacer')

      // Pestaña 1 sigue en canje, no debe haber cambiado por lo que hizo pestaña 2
      const bodyAfter1 = await page1.textContent('body')
      expect(bodyAfter1).toContain('Qué iPhone querés')
    } finally {
      await ctx1.close()
      await ctx2.close()
    }
  })

  test('misma pestaña: ?canje=1 reinicia estado de sesión anterior', async ({ page }) => {
    // Sesión 1
    await page.goto(`${COTIZADOR_URL}/cotizar?canje=1`)
    await page.waitForLoadState('networkidle')

    // Inyectamos estado falso (simula que el usuario avanzó)
    await page.evaluate(() => {
      sessionStorage.setItem('original-upgrade', JSON.stringify({
        model: 'iPhone 17 Pro Max',
        storage: '256',
        color: 'Silver',
        price: 1460,
      }))
    })

    // Sesión 2: entra con ?canje=1 de nuevo
    await page.goto(`${COTIZADOR_URL}/cotizar?canje=1`)
    await page.waitForLoadState('networkidle')

    // El flag viejo debería estar limpio
    const originalUpgrade = await page.evaluate(() => sessionStorage.getItem('original-upgrade'))
    expect(originalUpgrade).toBeNull()
  })
})
