export interface Producto {
  id: number;
  nombre: string;
  precioUSD: number;
  imagen?: string;
  activo: boolean;
}

export interface CarritoItem {
  productoId: number;
  cantidad: number;
}

export interface Venta {
  id: string;
  fecha: string;
  items: CarritoItem[];
  totalUSD: number;
  totalBs: number;
  metodoPago: 'pago_movil' | 'efectivo_bs' | 'efectivo_usd';
  referencia?: string;
}

export interface HistorialEntry {
  fecha: string;
  accion: string;
}

export interface Config {
  tasaDolar: number;
  ultimaActualizacion: string;
}

export type Pagina = 'venta' | 'ventas-dia' | 'ganancias' | 'configuracion';

export type MetodoPago = 'pago_movil' | 'efectivo_bs' | 'efectivo_usd';
