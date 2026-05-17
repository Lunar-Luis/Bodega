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

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function GananciasMensuales({ ventas, productos }: Props) {
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [verTodas, setVerTodas] = useState(false);

  const ventasFiltradas = useMemo(
    () => ventas.filter((v) => v.fecha.startsWith(mesSeleccionado)),
    [ventas, mesSeleccionado]
  );

  const resumen = useMemo(() => {
    let cantArticulos = 0;
    let totalUSD = 0;
    let totalBs = 0;
    for (const v of ventasFiltradas) {
      cantArticulos += v.items.reduce((s, i) => s + i.cantidad, 0);
      totalUSD += v.totalUSD;
      totalBs += v.totalBs;
    }
    return { cantVentas: ventasFiltradas.length, cantArticulos, totalUSD, totalBs };
  }, [ventasFiltradas]);

  const visibles = useMemo(
    () => (verTodas ? ventasFiltradas : ventasFiltradas.slice(0, ITEMS_POR_PAGINA)),
    [ventasFiltradas, verTodas]
  );

  const [year, month] = mesSeleccionado.split('-');
  const mesLabel = `${NOMBRES_MESES[parseInt(month) - 1]} ${year}`;

  const navegarMes = (delta: number) => {
    const d = new Date(parseInt(year), parseInt(month) - 1 + delta, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    setMesSeleccionado(`${y}-${m}`);
    setVerTodas(false);
  };

  const ahora = new Date();
  const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
  const esMesActual = mesSeleccionado === mesActual;

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="bg-primary -mx-4 -mt-4 px-4 pt-4 pb-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Ganancias</h1>
            <p className="text-xs text-white/70 mt-0.5">Resumen mensual</p>
          </div>
          {ventasFiltradas.length > 0 && (
            <button onClick={() => exportarPDF(ventasFiltradas, `Ganancias - ${mesLabel}`, mesLabel, resumen.totalUSD, resumen.totalBs, productos)} className="text-xs font-bold text-white bg-white/15 px-3 py-1.5 rounded-lg active:bg-white/25 border border-white/10">
              PDF
            </button>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navegarMes(-1)} className="p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1 text-center">
            <span className="text-base font-bold text-slate-800">{mesLabel}</span>
          </div>
          <button onClick={() => navegarMes(1)} className="p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          {!esMesActual && (
            <button onClick={() => { setMesSeleccionado(mesActual); setVerTodas(false); }} className="text-xs font-bold text-accent bg-slate-100 px-3 py-2 rounded-xl active:bg-slate-200 whitespace-nowrap border border-accent/30">
              Este mes
            </button>
          )}
        </div>
      </div>

      {ventasFiltradas.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">Sin ventas en {mesLabel.toLowerCase()}</p>
        </div>
      ) : (
        <>
          <div className="card mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Ventas</span>
              <span className="text-2xl font-bold text-slate-800">{resumen.cantVentas}</span>
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

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Ventas del mes</h2>
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
