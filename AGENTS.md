# BodegaOnline

PWA de control de ventas (React + TypeScript + Vite + Tailwind v4 + Supabase).

## Comandos

- 
pm run dev — dev server
- 
pm run build — typecheck + build (	sc -b && vite build)
- 
px tsc --noEmit — solo typecheck (mas rapido)

## Stack

- React 18, TypeScript 5, Vite 5, **Tailwind CSS v4** (sin 	ailwind.config.js — configuracion en src/index.css via @theme)
- **PWA** via ite-plugin-pwa (workbox generateSW, SW generado en build)
- **Base de datos**: Supabase PostgreSQL (src/lib/supabase.ts) — 5 tablas relacionales: productos, entas, enta_items, config, historial
- **Auth**: Supabase Auth (email/password) via src/contexts/AuthContext.tsx
- **Tiempo real**: Supabase Realtime via postgres_changes — cambios se reflejan instantaneamente en todos los dispositivos
- **Sin almacenamiento local**: no hay IndexedDB/Dexie ni localStorage para datos (solo sesion de auth). La app requiere conexion a internet
- **Sin router** — 4 paginas condicionales desde App.tsx (NuevaVenta, VentasDelDia, GananciasMensuales, Configuracion)
- **Login**: src/pages/Login.tsx — solo inicio de sesion (sin registro publico)

## Paleta (src/index.css)

- primary: #7C3AED, primaryDark: #6D28D9
- ccent: #0891B2, ondo: #F1F5F9
- exito: #16A34A, lerta: #DC2626
- Escala de grises usa slate-* (no gray-*)
- Tailwind v4: colores definidos en @theme como --color-primary, usados como g-primary, 	ext-primary, etc.

## Arquitectura

- src/pages/ — NuevaVenta, VentasDelDia, GananciasMensuales, Configuracion, Login
- src/components/ — NavegacionInferior, CarritoFlotante, ProductCard, VentaItem, ModalPago, ToastNotification, ConfirmModal
- src/lib/ — supabase (cliente)
- src/contexts/ — AuthContext (proveedor de autenticacion)
- src/hooks/ — useProductos, useVentasDirect, useConfig, useHistorial (lectura/escritura directa a Supabase + Realtime)
- src/utils/ — calculos, exportar (PDF), imagenes, storage
- src/App.tsx — AppWrapper ? AuthProvider ? AppInner (login check) ? AppAuthed (data + UI)

## Variables de entorno

Archivo .env requerido:

`
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
`

## Esquema BD (supabase-schema.sql)

- productos — id (serial), user_id, nombre, precio_usd, precio_bs, imagen, activo
- entas — id (text PK), user_id, fecha (timestamptz), metodo_pago, referencia
- enta_items — id (serial), venta_id (FK ? ventas CASCADE), producto_id (FK ? productos), cantidad, precio_usd, precio_bs
- config — user_id (PK), tasa_dolar, ultima_actualizacion
- historial — id (serial), user_id, fecha (timestamptz), accion
- RLS: todas las tablas filtran por user_id = auth.uid()
- Trigger updated_at en productos y config

## Notas

- **Datos**: cada accion (crear/editar producto, registrar venta, cambiar tasa) escribe directamente a Supabase. Los hooks con Realtime propagan los cambios a todos los dispositivos conectados sin recargar
- **Sin conexion**: la app NO funciona offline. El service worker cachea el shell (HTML/CSS/JS) pero los datos requieren internet
- **Login solo**: no hay registro publico. Admin crea usuarios desde Supabase Dashboard ? Authentication
- **PDF**: genera HTML con CSS inline y lo abre en nueva pestana (no es PDF real)
- **Imagenes**: comprimidas a ~250px max / <25KB via canvas, se almacenan como base64 en columna productos.imagen
- **Timezone**: Venezuela (UTC-4) — horaVenezuela(), hoyVenezuela(), extraerFechaVzla() en calculos.ts
- **Nav inferior**: iconos activos 	ext-primary, inactivos 	ext-slate-400
- **Botones**: .btn-primary bg primary, .btn-secondary bg slate-200
- **Cerrar sesion**: boton en Configuracion con ConfirmModal

## Git

- Origin: https://github.com/Lunar-Luis/Bodega.git
- Branch: main
