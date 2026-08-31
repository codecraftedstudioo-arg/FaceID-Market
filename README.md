# Plantilla-iPhone-Market

Vidriera online reutilizable: precios de iPhone en vivo, cotización de Plan Canje y contacto directo (WhatsApp / CRM).

Configurá la identidad del cliente en `src/config/site.ts` antes de desplegar.

## Características
- Precios de iPhone en vivo (Market Admin API; Apps Script opcional sin panel)

- Gráfico de tendencia de precios
- Plan Canje: enlace al cotizador
- Formulario de contacto integrable a un CRM
- Modo claro / oscuro
- Diseño responsive (mobile + desktop)

## Stack
- **React 19** + **TypeScript**
- **Vite 7** (build y dev server)
- **Tailwind CSS 4**
- **Lightweight Charts** (gráfico de precios)
- **Vitest** + **Playwright** (tests)

## Puesta en marcha
Requisitos: **Node.js 20+** y **npm**.

```bash
npm install            # 1. instalar dependencias
cp .env.example .env   # 2. configurar variables (completar valores)
npm run dev            # 3. levantar dev server → http://localhost:5173
```

## Configuración del cliente
Editá `src/config/site.ts`:

- Marca, logo, WhatsApp, Instagram, dirección, Maps
- SEO (title, description, URL pública)
- Analytics (desactivado por defecto; cargá Pixel / Clarity solo con `enabled: true` e IDs propios)
- CRM (`enabled` + webhook)
- Widget de reservas (`booking.enabled` + URL del iframe)
- Reseñas (`reviews.items`)
- Fotos del local (`assets.storePhotos`)

Los precios y el catálogo no se editan en `site.ts`. Fuente principal: Market Admin (`VITE_PANEL_API_URL` → `/api/v1/market-items`). Sin panel: Apps Script (`VITE_MARKET_PRICES_URL`) o `src/config/market-pricing.json` (demo).


Los campos `links` dentro de `market-pricing.json` son residuales: la UI usa `getSiteLinks()` (`site.ts`). No los edites como fuente de marca.

## Variables de entorno
| Variable | Para qué sirve |
|---|---|
| `VITE_PANEL_API_URL` | Origen del Market Admin (ej. `https://tu-admin.ejemplo.com`). Fuente exclusiva si está definida → `GET …/api/v1/market-items` |
| `VITE_MARKET_PRICES_URL` | Google Apps Script — solo si `VITE_PANEL_API_URL` está vacío |
| `VITE_CRM_WEBHOOK_URL` | Webhook donde se envían los leads del formulario (solo si `siteConfig.crm.enabled`) |

Los valores reales no se commitean: viven en `.env` local y en el dashboard de hosting.

## Scripts
| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualiza el build |
| `npm run test` | Tests unitarios |
| `npm run test:e2e` | Tests end-to-end (Playwright) |

Los E2E del cotizador (`test:e2e:cotizador-local`, `test:e2e:cotizador-prod`) requieren un cotizador levantado. URLs: `E2E_COTIZADOR_URL` (default `http://localhost:5174`) y `E2E_MARKET_URL` (default `http://localhost:5173`).

## Deploy
Pensado para **Vercel**. Las variables de entorno se configuran en el dashboard (Settings → Environment Variables). `vercel.json` hace rewrite SPA a `index.html`.
