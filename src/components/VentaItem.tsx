import { Venta, Producto } from '../types';
import { formatearUSD, formatearHora, buscarProducto } from '../utils/calculos';

interface Props {
  venta: Venta;
  productos: Producto[];
}

const metodoPagoConfig: Record<string, { label: string; clase: string }> = {
  pago_movil: { label: 'Pago Movil', clase: 'bg-violet-100 text-violet-700' },
  efectivo_usd: { label: 'Efectivo $', clase: 'bg-cyan-100 text-cyan-700' },
  efectivo_bs: { label: 'Efectivo Bs', clase: 'bg-amber-100 text-amber-700' },
};

export default function VentaItem({ venta, productos }: Props) {
  const mp = metodoPagoConfig[venta.metodoPago] || { label: venta.metodoPago, clase: 'bg-slate-100 text-slate-600' };

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-2">
        <div className="space-y-1">
          <p className="text-xs text-slate-400">{formatearHora(venta.fecha)}</p>
          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${mp.clase}`}>
            {mp.label}
          </span>
          {venta.referencia && (
            <p className="text-xs text-slate-400">
              Ref: <span className="font-mono font-bold text-slate-500">{venta.referencia}</span>
            </p>
          )}
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-base font-bold text-primary">{formatearUSD(venta.totalUSD)}</p>
          <p className="text-sm font-semibold text-primary">Bs. {venta.totalBs.toFixed(2)}</p>
        </div>
      </div>
      <div className="text-xs text-slate-500 space-y-0.5 border-t border-slate-200 pt-2 mt-1">
        {venta.items.map((item, i) => {
          const p = buscarProducto(productos, item.productoId);
          return (
            <div key={i} className="flex justify-between">
              <span>{p?.nombre || `#${item.productoId}`} x{item.cantidad}</span>
              <span>${((p?.precioUSD || 0) * item.cantidad).toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
