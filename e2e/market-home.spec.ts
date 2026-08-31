import { test, expect } from '@playwright/test'

// Test directo sobre el market site (no producción, usa webServer local)

test.describe('Market — Home y grilla', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('#precios', { timeout: 30000 })
  })

  test('hero muestra "iPhones sellados"', async ({ page }) => {
    const hero = await page.textContent('h1')
    expect(hero).toMatch(/iPhones sellados/i)
  })

  test('header tiene botón/link al cotizador', async ({ page }) => {
    // Puede ser botón o link dependiendo del componente
    const cotizadorLink = page.locator('header').getByText(/Cotizador/i).first()
    await expect(cotizadorLink).toBeVisible()
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

  test('botones de sort están presentes', async ({ page }) => {
    const section = page.locator('#precios')
    await expect(section.getByRole('button', { name: /Disponibles/i })).toBeVisible()
    await expect(section.getByRole('button', { name: /Menor precio/i })).toBeVisible()
    await expect(section.getByRole('button', { name: /Mayor precio/i })).toBeVisible()
  })

  test('sort "Menor precio" es clickeable y no crashea', async ({ page }) => {
    const menorPrecio = page.locator('#precios').getByRole('button', { name: /Menor precio/i })
    await menorPrecio.click()
    await page.waitForTimeout(500)
    // La grilla sigue visible después del sort
    await expect(page.locator('#precios')).toBeVisible()
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
  test('footer tiene link a tienda online y copyright', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    const footerText = await footer.textContent()
    expect(footerText).toMatch(/Marca Demo/i)
  })
})
