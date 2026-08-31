import { test, expect } from '@playwright/test'
import { COTIZADOR_URL } from './urls'

test.describe('Market — Plan Canje integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('#precios')
  })

  test('botón "Ver precios de hoy" existe en hero', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Ver precios de hoy/i })
    await expect(btn).toBeVisible()
  })

  test('sección Plan Canje está visible (#plan-canje)', async ({ page }) => {
    const section = page.locator('#plan-canje')
    await expect(section).toBeVisible()
  })

  test('card Plan Canje usa estilo de acento', async ({ page }) => {
    const link = page.locator('#plan-canje a').filter({ hasText: /Activar mi Plan Canje/i })
    const classes = await link.getAttribute('class')
    expect(classes).toMatch(/accent/)
  })

  test('link de la card apunta al cotizador con ?canje=1', async ({ page }) => {
    const link = page.locator('#plan-canje a').filter({ hasText: /Activar mi Plan Canje/i })
    const href = await link.getAttribute('href')
    expect(href).toBe(`${COTIZADOR_URL}/cotizar?canje=1`)
  })

  test('botón hero scrollea hacia precios', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Ver precios de hoy/i })
    await btn.click()
    await page.waitForTimeout(1500)

    const precios = page.locator('#precios')
    await expect(precios).toBeInViewport()
  })

  test('iPhone 17 Pro aparece en la grilla de precios', async ({ page }) => {
    const body = await page.textContent('#precios')
    expect(body).toContain('iPhone 17 Pro')
  })
})

test.describe('Market — responsive', () => {
  test('card Plan Canje centrada en desktop (max-w-md)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 860 })
    await page.goto('/')
    await page.waitForSelector('#plan-canje')

    const link = page.locator('#plan-canje a').filter({ hasText: /Activar mi Plan Canje/i })
    const box = await link.boundingBox()
    expect(box).not.toBeNull()
    // En desktop la card no debe ocupar todo el ancho de la grilla (max-w-md ≈ 448px)
    expect(box!.width).toBeLessThan(500)
  })

  test('card Plan Canje full width en mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForSelector('#plan-canje')

    const link = page.locator('#plan-canje a').filter({ hasText: /Activar mi Plan Canje/i })
    const box = await link.boundingBox()
    expect(box).not.toBeNull()
    // En mobile ocupa casi todo el ancho del viewport
    expect(box!.width).toBeGreaterThan(300)
  })
})
