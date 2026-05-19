import { useState } from 'react';
import { CarritoItem, MetodoPago, Producto } from '../types';
import { calcularTotalUSD, calcularTotalBs, formatearUSD, formatearBs, buscarProducto } from '../utils/calculos';

interface Props {
  items: CarritoItem[];
  productos: Producto[];
  onConfirmar: (metodo: MetodoPago, referencia?: string) => Promise<void>;
  onCerrar: () => void;
}

const metodos: { id: MetodoPago; label: string }[] = [
  { id: 'pago_movil', label: 'Pago Movil' },
  { id: 'efectivo_usd', label: 'Efectivo $' },
  { id: 'efectivo_bs', label: 'Efectivo Bs' },
];

export default function ModalPago({ items, productos, onConfirmar, onCerrar }: Props) {
  const [metodo, setMetodo] = useState<MetodoPago>('pago_movil');
  const [referencia, setReferencia] = useState('');
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);

  const totalUSD = calcularTotalUSD(items, productos);
  const totalBs = calcularTotalBs(items, productos);

  const handleConfirmar = async () => {
    if (procesando) return;
    let ref: string | undefined;
    if (metodo === 'pago_movil') {
      ref = referencia.trim();
      if (!ref || ref.length !== 4 || !/^\d{4}$/.test(ref)) {
        setError('Ingresa los ultimos 4 digitos de la referencia');
        return;
      }
    }
    setProcesando(true);
    try {
      await onConfirmar(metodo, ref);
    } catch {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center pt-4 sm:pt-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCerrar} />
      <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl flex flex-col max-h-[calc(100dvh-2rem)]">
        <div className="px-5 pt-5 pb-2 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-center text-slate-800">Registrar Pago</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 min-h-0">
          <div className="space-y-2 mb-4">
            {items.map((item, i) => {
              const p = buscarProducto(productos, item.productoId);
              return (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    {p?.nombre || `#${item.productoId}`} x{item.cantidad}
                  </span>
                  <div className="text-right">
                    <span className="text-slate-800 font-medium block">${((p?.precioUSD || 0) * item.cantidad).toFixed(2)}</span>
                    <span className="text-xs text-slate-400">Bs. {((p?.precioBs || 0) * item.cantidad).toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-3 mb-4 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Total $</span>
              <span className="font-bold text-primary">{formatearUSD(totalUSD)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Bs</span>
              <span className="font-bold text-primary">{formatearBs(totalBs)}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Metodo de pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              {metodos.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setMetodo(m.id); setError(''); }}
                  className={`py-3 px-2 rounded-xl text-sm font-medium transition-all min-h-12 ${
                    metodo === m.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 active:bg-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {metodo === 'pago_movil' && (
            <div className="mb-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Ultimos 4 digitos de referencia
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={referencia}
                onChange={(e) => {
                  setReferencia(e.target.value.replace(/\D/g, '').slice(0, 4));
                  setError('');
                }}
                placeholder="1234"
                className="input-base text-center text-2xl font-bold tracking-[0.5em]"
                autoFocus
              />
              {error && <p className="text-alerta text-xs mt-1">{error}</p>}
            </div>
          )}
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-slate-200 flex-shrink-0">
          <div className="flex gap-2">
            <button onClick={onCerrar} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button onClick={handleConfirmar} disabled={procesando} className="btn-primary flex-[2] disabled:opacity-50">
              {procesando ? 'GUARDANDO...' : 'CONFIRMAR VENTA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
