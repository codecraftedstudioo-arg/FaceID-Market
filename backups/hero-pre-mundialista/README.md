# Backup — Hero anterior

Snapshot del hero anterior al banner promocional (2026-06-09).
Guardado por si hace falta volver al hero anterior sin rehacerlo de cero.

## Qué hay acá

- **`hero-section.pre-mundialista.tsx`** — el componente del hero anterior
  (dark + verde: "iPhones sellados. / Precio real. / Sin vueltas." con foto a la
  derecha). Corresponde al commit git `6152efa` del repo de origen.
- **`hero-store-cropped.jpg`** — la foto que usaba ese hero (también sigue en `public/`).
- **`hero-mundialista-CON-ring-original.jpg`** — el banner promocional ORIGINAL,
  CON el "Ring!" y el timbre (antes de retocarlo).

## Cómo volver al hero anterior

1. Copiar `hero-section.pre-mundialista.tsx` a `src/components/hero-section.tsx`.
2. Asegurarse de que `public/hero-store-cropped.jpg` exista (ya está).

## Cómo volver al banner CON "Ring!"

1. Copiar `hero-mundialista-CON-ring-original.jpg` a `public/hero-mundialista.jpg`.

> El archivo `public/hero-mundialista.jpg` no está en el flujo activo del hero actual.
