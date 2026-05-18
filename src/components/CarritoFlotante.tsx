import { CarritoItem, Producto } from '../types';
import { calcularTotalUSD, calcularTotalBs, formatearUSD, formatearBs } from '../utils/calculos';

interface Props {
  items: CarritoItem[];
  productos: Producto[];
  onAbrirPago: () => void;
  onVaciar: () => void;
}

export default function CarritoFlotante({ items, productos, onAbrirPago, onVaciar }: Props) {
  if (items.length === 0) return null;

  const totalUSD = calcularTotalUSD(items, productos);
  const totalBs = calcularTotalBs(items, productos);
  const totalItems = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-3 pb-2 pointer-events-none">
      <div className="pointer-events-auto bg-white rounded-2xl shadow-lg border border-slate-200 px-5 py-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">{totalItems}</span>
            <span className="text-sm text-slate-400">{totalItems === 1 ? 'item' : 'items'}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onVaciar}
              className="text-sm px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold active:bg-slate-200 active:scale-95 transition-all min-h-touch"
            >
              Vaciar
            </button>
            <button
              onClick={onAbrirPago}
              className="text-sm px-6 py-2.5 rounded-xl font-bold active:scale-95 transition-all shadow-sm min-h-touch"
              style={{ background: '#7C3AED', color: 'white' }}
            >
              PAGAR
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-base font-bold text-primary">{formatearUSD(totalUSD)}</span>
          <span className="text-lg font-bold text-primary">{formatearBs(totalBs)}</span>
        </div>
      </div>
    </div>
  );
}
