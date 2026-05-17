# BodegaOnline 💧

Sistema de control de ventas para negocio de recarga de botellones de agua en Venezuela.

## Instalación

```bash
npm install
```

## Ejecutar localmente

```bash
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## Build para producción

```bash
npm run build
npm run preview
```

## Deploy en Vercel

1. Crea una cuenta en [Vercel](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Vercel detectará automáticamente que es un proyecto Vite
4. Haz clic en **Deploy**
5. ¡Listo! Tu app estará online en minutos

## Instalar en el teléfono

### Android (Chrome)
1. Abre la app en Chrome
2. Presiona el menú (3 puntos)
3. Selecciona **"Instalar app"** o **"Agregar a pantalla de inicio"**
4. Confirma la instalación

### iOS (Safari)
1. Abre la app en Safari
2. Presiona el botón **Compartir**
3. Desplázate y selecciona **"Agregar a pantalla de inicio"**
4. Ponle nombre y confirma

## Funcionalidades

- ✅ Registrar ventas con productos y cantidades
- ✅ Calcular totales en $ y Bs según tasa del día
- ✅ Aceptar Pago Móvil (con referencia de 4 dígitos), Efectivo $ y Efectivo Bs
- ✅ Ver resumen de ventas del día
- ✅ Exportar ventas del día a WhatsApp
- ✅ Gestionar productos (agregar, editar, activar/desactivar)
- ✅ Actualizar tasa del dólar manualmente
- ✅ Descargar respaldo JSON
- ✅ Funciona 100% offline
- ✅ Instalable como PWA en el teléfono

## Estructura del proyecto

```
src/
├── components/
│   ├── ProductCard.tsx       # Tarjeta de producto
│   ├── CarritoFlotante.tsx   # Carrito flotante inferior
│   ├── NavegacionInferior.tsx # Menú de navegación inferior
│   ├── VentaItem.tsx         # Item de venta en lista
│   └── ModalPago.tsx         # Modal de registro de pago
├── hooks/
│   └── useLocalStorage.ts    # Hook para localStorage
├── pages/
│   ├── NuevaVenta.tsx        # Pantalla principal de venta
│   ├── VentasDelDia.tsx      # Ventas del día
│   └── Configuracion.tsx     # Configuración y respaldo
├── types/
│   └── index.ts              # Tipos de TypeScript
├── utils/
│   ├── calculos.ts           # Funciones de cálculo
│   └── exportar.ts           # Exportación a WhatsApp y JSON
├── App.tsx
└── main.tsx
```

## Tecnologías

- React 18 + TypeScript
- Vite 5
- TailwindCSS 3
- vite-plugin-pwa
- LocalStorage
