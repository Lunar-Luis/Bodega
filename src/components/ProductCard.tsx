import { useState } from 'react';
import { Producto } from '../types';

interface Props {
  producto: Producto;
  contador: number;
  onIncrement: (producto: Producto) => void;
  onDecrement: (producto: Producto) => void;
}

export default function ProductCard({ producto, contador, onIncrement, onDecrement }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={
        contador > 0
          ? 'card-producto-seleccionado'
          : 'card-producto'
      }
    >
      <button
        onClick={() => onIncrement(producto)}
        className="flex flex-col items-center justify-center gap-1.5 w-full flex-1 pt-3 px-2"
      >
        <div className="relative">
          {producto.imagen && !imgError ? (
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="w-14 h-14 object-cover rounded-xl"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center">
              <span className="text-xl text-primary font-bold">
                {producto.nombre.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {contador > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-sm">
              {contador}
            </span>
          )}
        </div>
        <span className="text-sm font-semibold text-center leading-tight px-0.5 line-clamp-2 text-slate-800">
          {producto.nombre}
        </span>
        <span className="text-[11px] font-semibold text-primary/70 whitespace-nowrap">
          ${producto.precioUSD.toFixed(2)} | Bs. {(producto.precioBs ?? 0).toFixed(2)}
        </span>
      </button>

      {contador > 0 && (
        <div className="flex items-center justify-between gap-3 px-3 py-2 border-t border-primary/10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDecrement(producto);
            }}
            className="w-9 h-9 rounded-xl bg-alerta/10 text-alerta font-bold text-lg flex items-center justify-center active:bg-alerta/20 active:scale-90 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="text-base font-bold text-primary min-w-[1.5rem] text-center select-none tabular-nums">
            {contador}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIncrement(producto);
            }}
            className="w-9 h-9 rounded-xl bg-primary text-white font-bold text-lg flex items-center justify-center active:bg-primaryDark active:scale-90 transition-all shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
