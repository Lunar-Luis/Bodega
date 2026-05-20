export interface Producto {
  id: number;
  nombre: string;
  precioUSD: number;
  precioBs: number;
  tipoPrecio: 'usd' | 'bs';
  imagen?: string;
  activo: boolean;
}

export interface CarritoItem {
  productoId: number;
  cantidad: number;
}

export interface VentaItem {
  id: number;
  ventaId: string;
  productoId: number;
  cantidad: number;
  precioUSD: number;
  precioBs: number;
}

export interface Venta {
  id: string;
  fecha: string;
  items: CarritoItem[];
  totalUSD: number;
  totalBs: number;
  metodoPago: MetodoPago;
  referencia?: string;
}

export interface Config {
  tasaDolar: number;
  ultimaActualizacion: string;
}

export type Pagina = 'venta' | 'ventas-dia' | 'ganancias' | 'configuracion';

export type MetodoPago = 'pago_movil' | 'efectivo_bs' | 'efectivo_usd';
