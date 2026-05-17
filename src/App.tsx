import { useState, useCallback, useEffect } from 'react';
import { Producto, Venta, Config, Pagina, CarritoItem, HistorialEntry } from './types';
import { usePersistedState } from './hooks/usePersistedState';
import { buscarProducto } from './utils/calculos';
import NavegacionInferior from './components/NavegacionInferior';
import NuevaVenta from './pages/NuevaVenta';
import VentasDelDia from './pages/VentasDelDia';
import Configuracion from './pages/Configuracion';
import GananciasMensuales from './pages/GananciasMensuales';

function svgImg(n: string, color: string): string {
  const l = n.charAt(0).toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="14" fill="${color}"/><text x="40" y="40" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="28" font-weight="bold" fill="white">${l}</text></svg>`
  )}`;
}

const C = [
  '#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6',
  '#EC4899','#14B8A6','#F97316','#6366F1','#84CC16',
  '#06B6D4','#D946EF','#22C55E','#EAB308','#A855F7',
  '#0EA5E9','#F43F5E','#2DD4BF','#FB923C','#818CF8',
];

const PRODUCTOS_INICIALES: Producto[] = [
  { id: 1, nombre: 'Recarga Botellon 5L', precioUSD: 0.50, activo: true, imagen: svgImg('Recarga Botellon 5L', C[0]) },
  { id: 2, nombre: 'Recarga Botellon 8L', precioUSD: 0.75, activo: true, imagen: svgImg('Recarga Botellon 8L', C[0]) },
  { id: 3, nombre: 'Botellon Sellado 5L', precioUSD: 1.50, activo: true, imagen: svgImg('Botellon Sellado 5L', C[1]) },
  { id: 4, nombre: 'Botellon Sellado 8L', precioUSD: 2.00, activo: true, imagen: svgImg('Botellon Sellado 8L', C[1]) },
];

const CONFIG_INICIAL: Config = {
  tasaDolar: 0,
  ultimaActualizacion: '',
};

const MAX_HISTORIAL = 100;
const DIAS_HISTORIAL = 30;

function limpiarHistorial(entries: HistorialEntry[]): HistorialEntry[] {
  const corte = Date.now() - DIAS_HISTORIAL * 24 * 60 * 60 * 1000;
  const filtrados = entries.filter((h) => new Date(h.fecha).getTime() > corte);
  return filtrados.slice(-MAX_HISTORIAL);
}

export default function App() {
  const [pagina, setPagina] = useState<Pagina>('venta');
  const [ventas, setVentas] = usePersistedState<Venta[]>('bodegaonline_ventas', []);
  const [config, setConfig] = usePersistedState<Config>('bodegaonline_config', CONFIG_INICIAL);
  const [productos, setProductos] = usePersistedState<Producto[]>('bodegaonline_productos', PRODUCTOS_INICIALES);
  const [historial, setHistorial] = usePersistedState<HistorialEntry[]>('bodegaonline_historial', []);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [bannerRespaldo, setBannerRespaldo] = useState(false);

  useEffect(() => {
    setHistorial((prev) => limpiarHistorial(prev));
  }, []);

  const agregarHistorial = useCallback((accion: string) => {
    setHistorial((prev) => {
      const updated = [...prev, { fecha: new Date().toISOString(), accion }];
      return limpiarHistorial(updated);
    });
  }, [setHistorial]);

  const incrementar = useCallback((producto: Producto) => {
    setCarrito((prev) => {
      const idx = prev.findIndex((item) => item.productoId === producto.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + 1 };
        return next;
      }
      return [...prev, { productoId: producto.id, cantidad: 1 }];
    });
  }, []);

  const decrementar = useCallback((producto: Producto) => {
    setCarrito((prev) => {
      const idx = prev.findIndex((item) => item.productoId === producto.id);
      if (idx < 0) return prev;
      if (prev[idx].cantidad <= 1) return prev.filter((_, i) => i !== idx);
      const next = [...prev];
      next[idx] = { ...next[idx], cantidad: next[idx].cantidad - 1 };
      return next;
    });
  }, []);

  const vaciarCarrito = useCallback(() => {
    setCarrito([]);
  }, []);

  const handleGuardarVenta = useCallback((venta: Venta) => {
    setVentas((prev) => [venta, ...prev]);
    const desc = venta.items.map((i) => {
      const p = buscarProducto(productos, i.productoId);
      return `${p?.nombre || '?'} x${i.cantidad}`;
    }).join(', ');
    agregarHistorial(`Venta registrada: ${desc}`);
  }, [setVentas, agregarHistorial, productos]);

  const handleActualizarTasa = useCallback((tasa: number) => {
    setConfig((prev) => ({ ...prev, tasaDolar: tasa, ultimaActualizacion: new Date().toISOString() }));
    agregarHistorial(`Tasa actualizada: ${tasa}`);
  }, [setConfig, agregarHistorial]);

  const handleActualizarProducto = useCallback((producto: Producto) => {
    setProductos((prev) => prev.map((p) => (p.id === producto.id ? producto : p)));
    agregarHistorial(`Producto actualizado: ${producto.nombre}`);
  }, [setProductos, agregarHistorial]);

  const handleAgregarProducto = useCallback((producto: Producto) => {
    setProductos((prev) => [...prev, producto]);
    agregarHistorial(`Producto agregado: ${producto.nombre}`);
  }, [setProductos, agregarHistorial]);

  const handleEliminarProducto = useCallback((id: number) => {
    const p = productos.find((pr) => pr.id === id);
    setProductos((prev) => prev.filter((pr) => pr.id !== id));
    if (p) agregarHistorial(`Producto eliminado: ${p.nombre}`);
  }, [setProductos, productos, agregarHistorial]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pagina]);

  useEffect(() => {
    const ultimo = localStorage.getItem('bodegaonline_ultimo_respaldo');
    if (ultimo) {
      const dias = Math.floor((Date.now() - new Date(ultimo).getTime()) / (1000 * 60 * 60 * 24));
      setBannerRespaldo(dias >= 7);
    }
  }, [ventas]);

  const handleDescargarRespaldo = useCallback(() => {
    if (window.confirm('Descargar respaldo de datos antes de continuar?')) {
      const data = { ventas, config, productos };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `respaldo-bodegaonline-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      localStorage.setItem('bodegaonline_ultimo_respaldo', new Date().toISOString());
      setBannerRespaldo(false);
    }
  }, [ventas, config, productos]);

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-fondo">
      {bannerRespaldo && pagina !== 'configuracion' && (
        <div className="bg-accent/20 border-b border-accent/30 px-4 py-2.5 text-sm text-slate-700 flex items-center justify-between gap-2">
          <span>Han pasado mas de 7 dias sin respaldo</span>
          <button onClick={handleDescargarRespaldo} className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg active:bg-primaryDark">Respaldar</button>
        </div>
      )}

      {pagina === 'venta' && (
        <NuevaVenta
          productos={productos}
          tasaDolar={config.tasaDolar}
          carrito={carrito}
          onIncrementar={incrementar}
          onDecrementar={decrementar}
          onVaciarCarrito={vaciarCarrito}
          onGuardarVenta={handleGuardarVenta}
        />
      )}

      {pagina === 'ventas-dia' && (
        <VentasDelDia ventas={ventas} productos={productos} />
      )}

      {pagina === 'ganancias' && (
        <GananciasMensuales ventas={ventas} productos={productos} />
      )}

      {pagina === 'configuracion' && (
        <Configuracion
          config={config}
          productos={productos}
          ventas={ventas}
          onActualizarTasa={handleActualizarTasa}
          onActualizarProducto={handleActualizarProducto}
          onAgregarProducto={handleAgregarProducto}
          onEliminarProducto={handleEliminarProducto}
          historial={historial}
        />
      )}

      <NavegacionInferior actual={pagina} onCambiar={setPagina} />
    </div>
  );
}
