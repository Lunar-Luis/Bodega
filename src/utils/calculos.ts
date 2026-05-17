import { CarritoItem, Venta, Producto } from '../types';

export function buscarProducto(productos: Producto[], id: number): Producto | undefined {
  return productos.find((p) => p.id === id);
}

export function calcularTotalUSD(items: CarritoItem[], productos: Producto[]): number {
  return items.reduce((sum, item) => {
    const p = buscarProducto(productos, item.productoId);
    return sum + (p ? p.precioUSD * item.cantidad : 0);
  }, 0);
}

export function calcularTotalBs(totalUSD: number, tasaDolar: number): number {
  return totalUSD * tasaDolar;
}

export function formatearUSD(monto: number): string {
  return `$${monto.toFixed(2)}`;
}

export function formatearBs(monto: number): string {
  return `Bs. ${monto.toFixed(2)}`;
}

export function generarIdVenta(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

export function formatearHora(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatearFecha(fechaISO: string): string {
  const f = new Date(fechaISO);
  return f.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function esVentaDeHoy(venta: Venta): boolean {
  return venta.fecha.startsWith(hoy());
}

export function resumenVentasDelDia(ventas: Venta[], _md?: unknown) {
  const delDia = ventas.filter(esVentaDeHoy);
  const totalUSD = delDia.reduce((sum, v) => sum + v.totalUSD, 0);
  const totalBs = delDia.reduce((sum, v) => sum + v.totalBs, 0);
  return {
    ventas: delDia,
    totalVentas: delDia.length,
    totalUSD,
    totalBs,
  };
}

export function ventasPorFecha(ventas: Venta[], fecha: string): Venta[] {
  return ventas.filter((v) => v.fecha.startsWith(fecha));
}

export function resumenPorFecha(ventas: Venta[], fecha: string) {
  let totalUSD = 0;
  let totalBs = 0;
  const filtradas: Venta[] = [];
  for (const v of ventas) {
    if (v.fecha.startsWith(fecha)) {
      filtradas.push(v);
      totalUSD += v.totalUSD;
      totalBs += v.totalBs;
    }
  }
  return { ventas: filtradas, totalVentas: filtradas.length, totalUSD, totalBs };
}

export function ventasPorMes(ventas: Venta[], anio: number, mes: number): Venta[] {
  const prefijo = `${anio}-${String(mes).padStart(2, '0')}`;
  return ventas.filter((v) => v.fecha.startsWith(prefijo));
}

export function resumenPorMes(ventas: Venta[], anio: number, mes: number) {
  let totalUSD = 0;
  let totalBs = 0;
  const filtradas: Venta[] = [];
  const metodoCount: Record<string, number> = {};
  const prefijo = `${anio}-${String(mes).padStart(2, '0')}`;
  for (const v of ventas) {
    if (v.fecha.startsWith(prefijo)) {
      filtradas.push(v);
      totalUSD += v.totalUSD;
      totalBs += v.totalBs;
      metodoCount[v.metodoPago] = (metodoCount[v.metodoPago] || 0) + 1;
    }
  }
  return {
    ventas: filtradas,
    totalVentas: filtradas.length,
    totalUSD,
    totalBs,
    metodoCount,
  };
}

export function formatearFechaLocal(fechaISO: string): string {
  const d = new Date(fechaISO);
  return d.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
