import { test, expect } from '@playwright/test'

test.describe('Market — Plan Canje integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('#precios')
  })

  test('botón "Ver catálogo" existe en hero', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Ver catálogo/i })
    await expect(btn).toBeVisible()
  })

  test('botón hero scrollea hacia precios', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Ver catálogo/i }).first()
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
  test('catálogo visible en desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 860 })
    await page.goto('/')
    await page.waitForSelector('#precios')
    await expect(page.locator('#precios')).toBeVisible()
  })

  test('catálogo visible en mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForSelector('#precios')
    await expect(page.locator('#precios')).toBeVisible()
  })
})
