# BodegaOnline

PWA de control de ventas (React + TypeScript + Vite + Tailwind v4 + Supabase).

## Comandos

- `npm run dev` — dev server
- `npm run build` — typecheck + build (`tsc -b && vite build`)
- `npx tsc --noEmit` — solo typecheck (mas rapido)

## Stack

- React 18, TypeScript 5, Vite 5, **Tailwind CSS v4** (sin `tailwind.config.js` — configuracion en `src/index.css` via `@theme`)
- **PWA** via `vite-plugin-pwa` (workbox generateSW, SW generado en build)
- **Base de datos**: Supabase PostgreSQL (`src/lib/supabase.ts`) — 5 tablas relacionales: `productos`, `ventas`, `venta_items`, `config`, `historial`
- **Auth**: Supabase Auth (email/password) via `src/contexts/AuthContext.tsx`
- **Tiempo real**: Supabase Realtime via `postgres_changes` — cambios se reflejan instantaneamente en todos los dispositivos
- **Sin almacenamiento local**: no hay IndexedDB/Dexie ni localStorage para datos (solo sesion de auth). La app requiere conexion a internet
- **Sin router** — 4 paginas condicionales desde `App.tsx` (NuevaVenta, VentasDelDia, GananciasMensuales, Configuracion)
- **Login**: `src/pages/Login.tsx` — solo inicio de sesion (sin registro publico)

## Paleta (`src/index.css`)

- `primary: #7C3AED`, `primaryDark: #6D28D9`
- `accent: #0891B2`, `fondo: #F1F5F9`
- `exito: #16A34A`, `alerta: #DC2626`
- Escala de grises usa `slate-*` (no `gray-*`)
- Tailwind v4: colores definidos en `@theme` como `--color-primary`, usados como `bg-primary`, `text-primary`, etc.

## Arquitectura

- `src/pages/` — NuevaVenta, VentasDelDia, GananciasMensuales, Configuracion, Login
- `src/components/` — NavegacionInferior, CarritoFlotante, ProductCard, VentaItem, ModalPago, ToastNotification, ConfirmModal
- `src/lib/` — supabase (cliente)
- `src/contexts/` — AuthContext (proveedor de autenticacion)
- `src/hooks/` — useProductos, useVentasDirect, useConfig, useHistorial (lectura/escritura directa a Supabase + Realtime)
- `src/utils/` — calculos, exportar (PDF), imagenes, storage
- `src/App.tsx` — `AppWrapper` > `AuthProvider` > `AppInner` (login check) > `AppAuthed` (data + UI)

## Variables de entorno

Archivo `.env` requerido:

```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Esquema BD (`supabase-schema.sql`)

- `productos` — id (serial), user_id, nombre, precio_usd, precio_bs, tipo_precio ('usd'|'bs'), imagen, activo
- `ventas` — id (text PK), user_id, fecha (timestamptz), metodo_pago, referencia
- `venta_items` — id (serial), venta_id (FK > ventas CASCADE), producto_id (FK > productos), cantidad, precio_usd, precio_bs
- `config` — user_id (PK), tasa_dolar, ultima_actualizacion
- `historial` — id (serial), user_id, fecha (timestamptz), accion
- RLS: todas las tablas filtran por `user_id = auth.uid()`
- Trigger `updated_at` en productos y config

## Notas

- **Datos**: cada accion (crear/editar producto, registrar venta, cambiar tasa) escribe directamente a Supabase. Los hooks con Realtime propagan los cambios a todos los dispositivos conectados sin recargar
- **tipo_precio**: cada producto es "Fijo en USD" o "Fijo en Bs". Al cambiar la tasa, se recalcula automaticamente el precio secundario de todos los productos
- **Precios en ventas**: `venta_items` guarda una copia congelada de los precios al momento de la venta. Cambiar la tasa despues no afecta ventas pasadas
- **Sin conexion**: la app NO funciona offline. El service worker cachea el shell (HTML/CSS/JS) pero los datos requieren internet
- **Login solo**: no hay registro publico. Admin crea usuarios desde Supabase Dashboard > Authentication
- **PDF**: genera HTML con CSS inline y lo abre en nueva pestana (no es PDF real)
- **Imagenes**: comprimidas a ~250px max / <25KB via canvas, se almacenan como base64 en columna `productos.imagen`
- **Timezone**: Venezuela (UTC-4) — `ahoraVenezuela()`, `hoyVenezuela()`, `extraerFechaVzla()` en `calculos.ts`
- **Nav inferior**: iconos activos `text-primary`, inactivos `text-slate-400`
- **Botones**: `.btn-primary` bg primary, `.btn-secondary` bg slate-200
- **Cerrar sesion**: boton en Configuracion con ConfirmModal

## Git

- Origin: https://github.com/Lunar-Luis/Bodega.git
- Branch: main
