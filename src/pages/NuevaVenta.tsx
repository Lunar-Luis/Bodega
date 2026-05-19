import { useState, useCallback, useMemo, useRef } from 'react';
import { Producto, CarritoItem, MetodoPago, Venta } from '../types';
import { generarIdVenta, buscarProducto, formatearUSD, formatearBs, ahoraVenezuela } from '../utils/calculos';
import ProductCard from '../components/ProductCard';
import CarritoFlotante from '../components/CarritoFlotante';
import ModalPago from '../components/ModalPago';

const METODO_LABEL: Record<string, string> = {
  pago_movil: 'Pago Movil',
  efectivo_bs: 'Efectivo Bs',
  efectivo_usd: 'Efectivo $',
};

interface Props {
  productos: Producto[];
  carrito: CarritoItem[];
  onIncrementar: (producto: Producto) => void;
  onDecrementar: (producto: Producto) => void;
  onVaciarCarrito: () => void;
  onGuardarVenta: (venta: Venta) => void;
}

export default function NuevaVenta({
  productos,
  carrito,
  onIncrementar,
  onDecrementar,
  onVaciarCarrito,
  onGuardarVenta,
}: Props) {
  const [mostrarPago, setMostrarPago] = useState(false);
  const [ultimaVenta, setUltimaVenta] = useState<Venta | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [confirmando, setConfirmando] = useState(false);

  const handleConfirmarPago = useCallback(
    async (metodo: MetodoPago, referencia?: string) => {
      if (confirmando) return;
      setConfirmando(true);
      try {
        let totalUSD = 0;
        let totalBs = 0;
        for (const item of carrito) {
          const p = buscarProducto(productos, item.productoId);
          if (p) {
            totalUSD += p.precioUSD * item.cantidad;
            totalBs += (p.precioBs ?? 0) * item.cantidad;
          }
        }
        const venta: Venta = {
          id: generarIdVenta(),
          fecha: ahoraVenezuela(),
          items: [...carrito],
          totalUSD,
          totalBs,
          metodoPago: metodo,
          referencia,
        };
        await onGuardarVenta(venta);
        onVaciarCarrito();
        setMostrarPago(false);
        setUltimaVenta(venta);
        setConfirmando(false);
      } catch {
        setConfirmando(false);
      }
    },
    [carrito, onGuardarVenta, onVaciarCarrito, productos, confirmando]
  );

  const productosFiltrados = useMemo(
    () => productos.filter((p) => p.activo && p.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [productos, busqueda]
  );

  return (
    <div className="px-4 pt-4 pb-52">
      <div className="bg-primary -mx-4 -mt-4 px-4 pt-4 pb-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Nueva Venta</h1>
            <p className="text-xs text-white/70 mt-0.5">Registrar ventas</p>
          </div>
          <div className="bg-white/15 text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/10">
            {carrito.length} items
          </div>
        </div>
      </div>

      {ultimaVenta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setUltimaVenta(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-pop">
            <div className="w-16 h-16 bg-exito/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-center text-slate-800 mb-4">Venta registrada</h2>
            <div className="space-y-2.5 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Articulos</span>
                <span className="font-bold text-slate-800">{ultimaVenta.items.reduce((s, i) => s + i.cantidad, 0)}</span>
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total USD</span>
                <span className="font-bold text-primary">{formatearUSD(ultimaVenta.totalUSD)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Bs</span>
                <span className="font-bold text-primary">{formatearBs(ultimaVenta.totalBs)}</span>
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Metodo de pago</span>
                <span className="font-bold text-slate-800">{METODO_LABEL[ultimaVenta.metodoPago]}</span>
              </div>
              {ultimaVenta.referencia && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Referencia</span>
                  <span className="font-bold text-slate-800">{ultimaVenta.referencia}</span>
                </div>
              )}
            </div>
            <button onClick={() => setUltimaVenta(null)} className="btn-primary">
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-base pl-10"
        />
        {busqueda && (
          <button onClick={() => { setBusqueda(''); inputRef.current?.focus(); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 active:text-slate-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {productosFiltrados.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              contador={carrito.find((i) => i.productoId === producto.id)?.cantidad ?? 0}
              onIncrement={onIncrementar}
              onDecrement={onDecrementar}
            />
          ))}
        </div>
      )}

      <CarritoFlotante
        items={carrito}
        productos={productos}
        onAbrirPago={() => setMostrarPago(true)}
        onVaciar={onVaciarCarrito}
      />

      {mostrarPago && (
        <ModalPago
          items={carrito}
          productos={productos}
          onConfirmar={handleConfirmarPago}
          onCerrar={() => setMostrarPago(false)}
        />
      )}
    </div>
  );
}
