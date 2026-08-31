import { test, expect } from '@playwright/test'
import { COTIZADOR_URL } from './urls'

// Estos tests corren contra el cotizador en LOCAL (E2E_COTIZADOR_URL o localhost:5174).
// Requiere levantar el cotizador en otra terminal, p. ej. `npx vite --port 5174`.
// Los mismos tests existen también en cotizador-flow-prod.spec.ts.

test.describe('Cotizador LOCAL — Flujo de Plan Canje', () => {
  test.beforeAll(async ({ request }) => {
    // Verifica que el cotizador local esté corriendo
    try {
      await request.get(COTIZADOR_URL, { timeout: 3000 })
    } catch {
      test.skip(true, `Cotizador local no disponible en ${COTIZADOR_URL}. Levantarlo con "npx vite --port 5174" en /mnt/c/Point-iPhone-Price-Calculator`)
    }
  })

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

test.describe('Cotizador LOCAL — Precios (canje usa datos vivos del market)', () => {
  // Datos VIVOS: el operador edita precios y stock a diario. NO afirmamos valores fijos
  // (hardcodear "iPhone 15 = USD 650" rompía con cada edición de la planilla);
  // verificamos estructura y comportamiento, que es lo estable.
  const MODEL = 'iPhone 17 Pro Max' // gama alta, estable en stock

  test('completar modelo → capacidad → color muestra un precio en USD', async ({ page }) => {
    await page.goto(`${COTIZADOR_URL}/cotizar?canje=1`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Elegí un modelo' }).click()
    await page.getByRole('button', { name: MODEL, exact: true }).click()
    // primera capacidad en stock (cuál exactamente depende de los datos vivos)
    await page.getByRole('button').filter({ hasText: /^\d+\s?(GB|TB)$/ }).first().click()
    // primer color disponible: el botón de color lleva el círculo <span style="background...">
    await page.locator('button:has(span[style*="background"])').first().click()
    await page.waitForTimeout(300)

    const body = await page.textContent('body')
    expect(body).toMatch(/USD\s?\d[\d.]*/)
  })

  test('un modelo en stock ofrece solo capacidades válidas (no vacías)', async ({ page }) => {
    await page.goto(`${COTIZADOR_URL}/cotizar?canje=1`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Elegí un modelo' }).click()
    await page.getByRole('button', { name: MODEL, exact: true }).click()
    await page.waitForTimeout(500)

    const storages = (
      await page.getByRole('button').filter({ hasText: /^\d+\s?(GB|TB)$/ }).allTextContents()
    ).map((s) => s.trim())

    expect(storages.length).toBeGreaterThan(0)
    for (const s of storages) {
      expect(['128 GB', '256 GB', '512 GB', '1 TB', '2 TB']).toContain(s)
    }
  })
})

test.describe('Cotizador LOCAL — Dólar blue visible solo en resultado', () => {
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
