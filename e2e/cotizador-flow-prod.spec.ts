import { test, expect } from '@playwright/test'
import { COTIZADOR_URL } from './urls'

test.describe('Cotizador — Flujo de Plan Canje (producción)', () => {
  test('pantalla de elección no muestra "Paso X/Y"', async ({ page }) => {
    await page.goto(`${COTIZADOR_URL}/cotizar?new=1`)
    await page.waitForLoadState('networkidle')

    const body = await page.textContent('body')
    expect(body).toContain('Qué querés hacer')
    expect(body).not.toMatch(/Paso \d+\/\d+/)
  })

  test('?canje=1 entra directo a "¿Qué iPhone querés?" con Paso 1/6', async ({ page }) => {
    await page.goto(`${COTIZADOR_URL}/cotizar?canje=1`)
    await page.waitForLoadState('networkidle')

    const body = await page.textContent('body')
    expect(body).toContain('Qué iPhone querés')
    expect(body).toContain('Paso 1/6')
  })

  test('click en "Solo quiero vender" lleva a Paso 1/5', async ({ page }) => {
    await page.goto(`${COTIZADOR_URL}/cotizar?new=1`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button').filter({ hasText: /Solo quiero vender/i }).click()
    await page.waitForTimeout(500)

    const body = await page.textContent('body')
    expect(body).toContain('Qué iPhone tenés')
    expect(body).toContain('Paso 1/5')
  })

  test('click en "Plan Canje" lleva a Paso 1/6', async ({ page }) => {
    await page.goto(`${COTIZADOR_URL}/cotizar?new=1`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button').filter({ hasText: /^Plan Canje/i }).click()
    await page.waitForTimeout(500)

    const body = await page.textContent('body')
    expect(body).toContain('Qué iPhone querés')
    expect(body).toContain('Paso 1/6')
  })

  test('botón Volver regresa a elección sin paso', async ({ page }) => {
    await page.goto(`${COTIZADOR_URL}/cotizar?canje=1`)
    await page.waitForLoadState('networkidle')

    // Volver desde flujo canje
    await page.getByRole('button', { name: 'Volver', exact: true }).click()
    await page.waitForTimeout(500)

    const body = await page.textContent('body')
    expect(body).toContain('Qué querés hacer')
    expect(body).not.toMatch(/Paso \d+\/\d+/)
  })

  test('Plan Canje → Volver → Plan Canje muestra Paso 1/6 nuevamente', async ({ page }) => {
    await page.goto(`${COTIZADOR_URL}/cotizar?new=1`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button').filter({ hasText: /^Plan Canje/i }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Volver', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button').filter({ hasText: /^Plan Canje/i }).click()
    await page.waitForTimeout(300)

    const body = await page.textContent('body')
    expect(body).toContain('Paso 1/6')
  })
})

test.describe('Cotizador — Precios (canje usa datos del market)', () => {
  test('iPhone 15 128GB Azul = USD 650', async ({ page }) => {
    await page.goto(`${COTIZADOR_URL}/cotizar?canje=1`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Elegí un modelo' }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'iPhone 15', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: '128 GB', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Azul', exact: true }).click()
    await page.waitForTimeout(300)

    const body = await page.textContent('body')
    expect(body).toContain('USD 650')
  })

  test('iPhone 17 Pro 1TB Naranja = USD 1.750 (verifica fix del bug)', async ({ page }) => {
    await page.goto(`${COTIZADOR_URL}/cotizar?canje=1`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Elegí un modelo' }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'iPhone 17 Pro', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: '1 TB', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Naranja', exact: true }).click()
    await page.waitForTimeout(300)

    const body = await page.textContent('body')
    expect(body).toContain('USD 1.750')
  })

  test('iPhone 17 Pro incluye opción 1 TB', async ({ page }) => {
    await page.goto(`${COTIZADOR_URL}/cotizar?canje=1`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Elegí un modelo' }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'iPhone 17 Pro', exact: true }).click()
    await page.waitForTimeout(500)

    const storages = await page.getByRole('button').filter({ hasText: /GB|TB/ }).allTextContents()
    expect(storages).toContain('1 TB')
  })
})

test.describe('Cotizador — Dólar blue visible solo en resultado', () => {
  test('paso 1 de canje NO muestra "Dólar blue"', async ({ page }) => {
    await page.goto(`${COTIZADOR_URL}/cotizar?canje=1`)
    await page.waitForLoadState('networkidle')

    const body = await page.textContent('body')
    expect(body).not.toContain('Dólar blue')
  })

  test('paso 1 de venta NO muestra "Dólar blue"', async ({ page }) => {
    await page.goto(`${COTIZADOR_URL}/cotizar?new=1`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button').filter({ hasText: /Solo quiero vender/i }).click()
    await page.waitForTimeout(500)

    const body = await page.textContent('body')
    expect(body).not.toContain('Dólar blue')
  })
})
