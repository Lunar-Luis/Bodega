# BodegaOnline

Sistema de control de ventas PWA con React + TypeScript + Supabase.

## Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) (free tier)
- Archivo `.env` con:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## Instalacion

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Base de datos

Ejecuta `supabase-schema.sql` en el SQL Editor de Supabase Dashboard para crear las tablas, RLS y triggers.

## Build

```bash
npm run build    # typecheck + build
npm run preview  # previsualizar build
```

## Deploy en Vercel

1. Conecta el repo a [Vercel](https://vercel.com)
2. Agrega las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
3. Vercel detecta Vite automaticamente — deploy

## Instalar en el telefono (PWA)

### Android (Chrome)
Menu (3 puntos) > "Instalar app"

### iOS (Safari)
Compartir > "Agregar a pantalla de inicio"

## Funcionalidades

- Registrar ventas con productos y cantidades
- Precios fijos en USD o en Bs por producto
- Al cambiar la tasa, los precios secundarios se recalculan automaticamente
- Aceptar Pago Movil, Efectivo $, Efectivo Bs
- Resumen de ventas del dia y ganancias mensuales
- Exportar a PDF
- Productos con foto (comprimida a ~250px / <25KB)
- Sincronizacion en tiempo real entre dispositivos via Supabase Realtime
- Autenticacion por email/password (sin registro publico)
- PWA instalable

## Stack

- React 18, TypeScript 5, Vite 5
- Tailwind CSS v4 (config en `src/index.css` via `@theme`)
- Supabase (PostgreSQL, Auth, Realtime)
- vite-plugin-pwa (Workbox generateSW)

## Estructura

```
src/
├── components/       # UI components
│   ├── ProductCard, CarritoFlotante, NavegacionInferior
│   ├── VentaItem, ModalPago, ToastNotification, ConfirmModal
├── contexts/         # AuthContext (proveedor de autenticacion)
├── hooks/            # useProductos, useVentasDirect, useConfig, useHistorial
├── lib/              # supabase (cliente)
├── pages/            # NuevaVenta, VentasDelDia, GananciasMensuales, Configuracion, Login
├── types/            # interfaces TypeScript
├── utils/            # calculos (Venezuela UTC-4), exportar (PDF), imagenes
├── App.tsx           # AuthProvider > login check > paginas condicionales
└── main.tsx
```

## Notas

- **Sin conexion**: la app requiere internet. El service worker cachea el shell pero los datos viven en Supabase.
- **Tiempo real**: los cambios se propagan instantaneamente a todos los dispositivos via Supabase Realtime sin recargar.
- **Ventas pasadas**: los precios quedan congelados en `venta_items` al momento de la venta. Cambiar la tasa despues no las afecta.
- **Login**: solo inicio de sesion. El admin crea usuarios desde Supabase Dashboard > Authentication.
- **Imagenes**: se almacenan como base64 en la columna `productos.imagen`.
- **Zona horaria**: Venezuela UTC-4.
