import { useState, useCallback, useEffect, useRef } from 'react';
import { Producto, Pagina, CarritoItem, Venta } from './types';
import { useProductos } from './hooks/useProductos';
import { useVentasDirect } from './hooks/useVentasDirect';
import { useConfig } from './hooks/useConfig';
import { useHistorial } from './hooks/useHistorial';
import { buscarProducto } from './utils/calculos';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import NavegacionInferior from './components/NavegacionInferior';
import NuevaVenta from './pages/NuevaVenta';
import VentasDelDia from './pages/VentasDelDia';
import Configuracion from './pages/Configuracion';
import GananciasMensuales from './pages/GananciasMensuales';
import Login from './pages/Login';

export default function AppWrapper() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

function AppInner() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="max-w-lg mx-auto min-h-screen bg-fondo flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: 24, height: 24, borderWidth: 3 }} />
          <p className="text-slate-400 text-sm font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <AppAuthed />;
}

function AppAuthed() {
  const [pagina, setPagina] = useState<Pagina>('venta');
  const [ventas, addVenta, ventasLoaded] = useVentasDirect();
  const [config, actualizarTasa, configLoaded] = useConfig();
  const [productos, agregarProducto, actualizarProducto, eliminarProducto, productosLoaded] = useProductos();
  const [historial, agregarHistorial, historialLoaded] = useHistorial();
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const todoCargado = ventasLoaded && configLoaded && productosLoaded && historialLoaded;

  const migroProductos = useRef(false);

  useEffect(() => {
    if (!productosLoaded || migroProductos.current) return;
    if (config.tasaDolar <= 0) return;
    let changed = false;
    const migrados = productos.map((p) => {
      if (p.precioBs === undefined || p.precioBs === null) {
        changed = true;
        return { ...p, precioBs: Math.round(p.precioUSD * config.tasaDolar * 100) / 100 };
      }
      return p;
    });
    if (changed) {
      migrados.forEach((p) => actualizarProducto(p));
    }
    migroProductos.current = true;
  }, [productosLoaded, config.tasaDolar, productos, actualizarProducto]);

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

  const handleGuardarVenta = useCallback(async (venta: Venta) => {
    await addVenta(venta, productos);
    const desc = venta.items.map((i) => {
      const p = buscarProducto(productos, i.productoId);
      return (p?.nombre || '?') + ' x' + i.cantidad;
    }).join(', ');
    agregarHistorial('Venta registrada: ' + desc);
  }, [addVenta, agregarHistorial, productos]);

  const handleActualizarTasa = useCallback((tasa: number) => {
    actualizarTasa(tasa);
    agregarHistorial('Tasa actualizada: ' + tasa);
  }, [actualizarTasa, agregarHistorial]);

  const handleActualizarProducto = useCallback((producto: Producto) => {
    actualizarProducto(producto);
    agregarHistorial('Producto actualizado: ' + producto.nombre);
  }, [actualizarProducto, agregarHistorial]);

  const handleAgregarProducto = useCallback((producto: Producto) => {
    agregarProducto(producto);
    agregarHistorial('Producto agregado: ' + producto.nombre);
  }, [agregarProducto, agregarHistorial]);

  const handleEliminarProducto = useCallback((id: number) => {
    const p = productos.find((pr) => pr.id === id);
    eliminarProducto(id);
    if (p) agregarHistorial('Producto eliminado: ' + p.nombre);
  }, [eliminarProducto, productos, agregarHistorial]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pagina]);

  if (!todoCargado) {
    return (
      <div className="max-w-lg mx-auto min-h-screen bg-fondo flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: 24, height: 24, borderWidth: 3 }} />
          <p className="text-slate-400 text-sm font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-fondo">
      {pagina === 'venta' && (
        <NuevaVenta
          productos={productos}
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