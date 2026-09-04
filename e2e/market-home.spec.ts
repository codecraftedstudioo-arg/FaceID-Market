import { test, expect } from '@playwright/test'

test.describe('Market — Home y grilla', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('#precios', { timeout: 30000 })
  })

  test('hero muestra "iPhones disponibles"', async ({ page }) => {
    const hero = await page.textContent('main')
    expect(hero).toMatch(/iPhones disponibles/i)
  })

  test('header identifica FACE ID Market', async ({ page }) => {
    const header = page.locator('header')
    await expect(header.getByText('FACE ID')).toBeVisible()
    await expect(header.getByText('Market')).toBeVisible()
  })

  test('grilla de precios muestra al menos 5 modelos', async ({ page }) => {
    const body = await page.textContent('#precios')
    expect(body).toContain('iPhone 17 Pro Max')
    expect(body).toContain('iPhone 17 Pro')
    expect(body).toContain('iPhone 17')
    expect(body).toContain('iPhone 16')
    expect(body).toContain('iPhone 15')
  })

  test('badge "En vivo" visible', async ({ page }) => {
    const enVivo = page.locator('#precios').getByText('En vivo')
    await expect(enVivo).toBeVisible()
  })

  test('catálogo no muestra buscador ni filtros de sort', async ({ page }) => {
    const section = page.locator('#precios')
    await expect(page.getByPlaceholder(/Buscar modelo, color o almacenamiento/i)).toHaveCount(0)
    await expect(section.getByRole('button', { name: /^Disponibles$/i })).toHaveCount(0)
    await expect(section.getByRole('button', { name: /Menor precio/i })).toHaveCount(0)
    await expect(section.getByRole('button', { name: /Mayor precio/i })).toHaveCount(0)
  })
})

test.describe('Market — WhatsApp flotante', () => {
  test('botón flotante de WhatsApp visible y con link correcto', async ({ page }) => {
    await page.goto('/')
    const waBtn = page.getByRole('link', { name: /WhatsApp/i }).first()
    await expect(waBtn).toBeVisible()
    const href = await waBtn.getAttribute('href')
    expect(href).toMatch(/wa\.me/)
  })
})

test.describe('Market — Footer', () => {
  test('footer tiene branding FACE ID', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    const footerText = await footer.textContent()
    expect(footerText).toMatch(/FACE ID/i)
  })
})
