# BodegaOnline

PWA de control de ventas para recarga de botellones (React + TypeScript + Vite + Tailwind).

## Comandos

- `npm run dev` — dev server
- `npm run build` — typecheck + build (usa `tsc -b && vite build`)
- `npx tsc --noEmit` — solo typecheck (más rápido)
- `npx vite build` — solo build sin typecheck

## Stack

- React 18, TypeScript 5, Vite 5, Tailwind CSS 3.4
- PWA via `vite-plugin-pwa` (workbox generateSW, SW generado en build)
- Sin backend — IndexedDB via hook `usePersistedState` (src/hooks/usePersistedState.ts)
- Sin router — 4 páginas condicionales desde App.tsx

## Paleta (tailwind.config.js)

- `primary: #7C3AED`, `primaryDark: #6D28D9`
- `accent: #0891B2`, `fondo: #F1F5F9`
- `exito: #16A34A`, `alerta: #DC2626`
- Escala de grises usa `slate-*` (no `gray-*`)

## Arquitectura

- `src/pages/` — NuevaVenta, VentasDelDia, GananciasMensuales, Configuracion
- `src/components/` — NavegacionInferior, CarritoFlotante, ProductCard, VentaItem, ModalPago
- `src/utils/` — calculos, db, exportar, imagenes, storage
- `src/hooks/` — usePersistedState, useStorageQuota

## Notas

- PDF: genera HTML con CSS inline y lo abre en nueva pestaña (no es PDF real)
- Imágenes comprimidas a ~250px máx / <25KB vía canvas
- Historial auto-limpiado: >30 días o >100 entradas
- Nav inferior: iconos activos `text-primary`, inactivos `text-slate-400`
- Carrito flotante: bg white, border slate-200, PAGAR primary
- Botones: `.btn-primary` bg primary, `.btn-secondary` bg slate-200

## Git

- Origin: https://github.com/Lunar-Luis/Bodega.git
- Branch: main
