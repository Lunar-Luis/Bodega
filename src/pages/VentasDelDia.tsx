import { useState, useMemo } from 'react';
import { Venta, Producto } from '../types';
import { formatearUSD, formatearBs } from '../utils/calculos';
import VentaItem from '../components/VentaItem';
import { exportarPDF } from '../utils/exportar';

interface Props {
  ventas: Venta[];
  productos: Producto[];
}

const ITEMS_POR_PAGINA = 20;

function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatearFechaLocal(fechaStr: string) {
  const [y, m, d] = fechaStr.split('-');
  const f = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return f.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function VentasDelDia({ ventas, productos }: Props) {
  const [fecha, setFecha] = useState(hoy());
  const [verTodas, setVerTodas] = useState(false);

  const ventasFiltradas = useMemo(
    () => ventas.filter((v) => v.fecha.startsWith(fecha)),
    [ventas, fecha]
  );

  const resumen = useMemo(() => {
    let cant = 0;
    let totalUSD = 0;
    let totalBs = 0;
    for (const v of ventasFiltradas) {
      cant += v.items.reduce((s, i) => s + i.cantidad, 0);
      totalUSD += v.totalUSD;
      totalBs += v.totalBs;
    }
    return { cantArticulos: cant, totalUSD, totalBs };
  }, [ventasFiltradas]);

  const visibles = useMemo(
    () => (verTodas ? ventasFiltradas : ventasFiltradas.slice(0, ITEMS_POR_PAGINA)),
    [ventasFiltradas, verTodas]
  );

  const cambiarDia = (delta: number) => {
    const [y, m, d] = fecha.split('-').map(Number);
    const date = new Date(y, m - 1, d + delta);
    setFecha(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
    setVerTodas(false);
  };

  const esHoy = fecha === hoy();

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="bg-primary -mx-4 -mt-4 px-4 pt-4 pb-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Ventas</h1>
            <p className="text-xs text-white/70 mt-0.5">Historial de ventas</p>
          </div>
          {ventasFiltradas.length > 0 && (
            <button onClick={() => exportarPDF(ventasFiltradas, 'Ventas', formatearFechaLocal(fecha), resumen.totalUSD, resumen.totalBs, productos)} className="text-xs font-bold text-white bg-white/15 px-3 py-1.5 rounded-lg active:bg-white/25 border border-white/10">
              PDF
            </button>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => cambiarDia(-1)}
            className="p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-400"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <input
              type="date"
              value={fecha}
              onChange={(e) => { setFecha(e.target.value); setVerTodas(false); }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-center font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-100"
            />
          </div>
          <button
            onClick={() => cambiarDia(1)}
            className="p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-400"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          {!esHoy && (
            <button
              onClick={() => { setFecha(hoy()); setVerTodas(false); }}
              className="text-xs font-bold text-accent bg-slate-100 px-3 py-2 rounded-xl active:bg-slate-200 whitespace-nowrap border border-accent/30"
            >
              Hoy
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 text-center mt-1.5 capitalize">{formatearFechaLocal(fecha)}</p>
      </div>

      {ventasFiltradas.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">Sin ventas este dia</p>
          {!esHoy && (
            <button onClick={() => setFecha(hoy())} className="mt-3 text-sm font-bold text-accent">
              Ver ventas de hoy
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="card mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Ventas</span>
              <span className="text-2xl font-bold text-slate-800">{ventasFiltradas.length}</span>
            </div>
            <div className="w-full h-px bg-slate-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Articulos</span>
              <span className="text-2xl font-bold text-slate-800">{resumen.cantArticulos}</span>
            </div>
            <div className="w-full h-px bg-slate-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total USD</span>
              <span className="text-xl font-bold text-primary">{formatearUSD(resumen.totalUSD)}</span>
            </div>
            <div className="w-full h-px bg-slate-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Bs</span>
              <span className="text-xl font-bold text-primary">{formatearBs(resumen.totalBs)}</span>
            </div>
          </div>

          <div className="space-y-2">
            {visibles.map((venta) => (
              <VentaItem key={venta.id} venta={venta} productos={productos} />
            ))}
          </div>

          {ventasFiltradas.length > ITEMS_POR_PAGINA && !verTodas && (
            <button onClick={() => setVerTodas(true)} className="w-full mt-3 py-3.5 text-sm font-bold btn-primary">
              Cargar mas ({ventasFiltradas.length - ITEMS_POR_PAGINA} restantes)
            </button>
          )}
        </>
      )}
    </div>
  );
}
