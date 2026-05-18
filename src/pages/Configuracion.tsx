import { useState, useRef, useCallback, useEffect } from 'react';
import { Producto, Config, Venta, HistorialEntry } from '../types';
import { formatearFecha, formatearUSD, formatearBs, ahoraVenezuela } from '../utils/calculos';
import { useStorageQuota } from '../hooks/useStorageQuota';
import { comprimirImagen } from '../utils/imagenes';

interface Props {
  config: Config;
  productos: Producto[];
  ventas: Venta[];
  onActualizarTasa: (tasa: number) => void;
  onActualizarProducto: (producto: Producto) => void;
  onAgregarProducto: (producto: Producto) => void;
  onEliminarProducto: (id: number) => void;
  historial: HistorialEntry[];
}

function bytesParaHumanos(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const UMBRAL_AMARILLO = 5 * 1024 * 1024;
const UMBRAL_ROJO = 8 * 1024 * 1024;

export default function Configuracion({
  config,
  productos,
  ventas,
  onActualizarTasa,
  onActualizarProducto,
  onAgregarProducto,
  onEliminarProducto,
  historial,
}: Props) {
  const [tasaInput, setTasaInput] = useState('');
  const [editandoProducto, setEditandoProducto] = useState<Producto | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecioUSD, setNuevoPrecioUSD] = useState('');
  const [nuevoPrecioBs, setNuevoPrecioBs] = useState('');
  const ultimoEditadoNuevo = useRef<'usd' | 'bs' | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [comprimiendo, setComprimiendo] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const usado = useStorageQuota();
  const soportado = 'storage' in navigator && 'estimate' in navigator.storage;

  useEffect(() => {
    if (config.tasaDolar > 0) {
      setTasaInput(config.tasaDolar.toString());
    }
  }, [config.tasaDolar]);

  const porcentaje = Math.min((usado / (10 * 1024 * 1024)) * 100, 100);
  const colorBarra = usado >= UMBRAL_ROJO ? '#EF4444' : usado >= UMBRAL_AMARILLO ? '#F59E0B' : '#22C55E';

  const manejarTasa = useCallback(() => {
    const t = parseFloat(tasaInput);
    if (t > 0) {
      onActualizarTasa(t);
    }
  }, [tasaInput, onActualizarTasa]);

  const handleFileSelect = useCallback(async (file: File | undefined, onResult: (base64: string) => void) => {
    if (!file) return;
    try {
      setComprimiendo(true);
      const base64 = await comprimirImagen(file);
      onResult(base64);
    } catch {
      // silent
    } finally {
      setComprimiendo(false);
    }
  }, []);

  const handleCambiarFotoEdicion = useCallback(async () => {
    const file = editFileInputRef.current?.files?.[0];
    if (!file || !editandoProducto) return;
    await handleFileSelect(file, (base64) => {
      onActualizarProducto({ ...editandoProducto, imagen: base64 });
      setEditandoProducto({ ...editandoProducto, imagen: base64 });
    });
  }, [editandoProducto, handleFileSelect, onActualizarProducto]);

  const descargarRespaldo = useCallback(() => {
    if (!window.confirm('Descargar respaldo de datos?')) return;
    const data = { config, productos, ventas };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
      a.download = `config-bodegaonline-${ahoraVenezuela().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [config, productos]);

  return (
    <div className="px-4 pt-4 pb-24 space-y-5">
      <div className="bg-primary -mx-4 -mt-4 px-4 pt-4 pb-5 mb-2">
        <h1 className="text-xl font-bold text-white">Configuracion</h1>
        <p className="text-xs text-white/70 mt-0.5">Administra tu negocio</p>
      </div>

      {soportado && usado > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700">Almacenamiento</p>
            <p className="text-xs text-slate-400">{bytesParaHumanos(usado)}</p>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${porcentaje}%`, backgroundColor: colorBarra }}
            />
          </div>
        </div>
      )}

      <div className="card">
        <p className="text-sm font-medium text-slate-700 mb-2">Tasa del Dolar (Bs.)</p>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={tasaInput}
            onChange={(e) => setTasaInput(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            className="input-base flex-1"
          />
          <button
            onClick={manejarTasa}
            className="bg-primary text-white font-bold px-5 rounded-xl min-h-touch active:bg-primaryDark active:scale-95 transition-all text-sm whitespace-nowrap shadow-sm"
          >
            Guardar
          </button>
        </div>
        {config.ultimaActualizacion && (
          <p className="text-xs text-slate-400 mt-1.5">
            Actualizada: {formatearFecha(config.ultimaActualizacion)}
          </p>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-700">Productos ({productos.length})</p>
              <button
                onClick={() => { setMostrarFormulario(true); setNuevoPrecioBs(''); setPreviewImg(null); }}
            className="text-xs font-bold bg-primary text-white px-4 py-2 rounded-xl active:bg-primaryDark active:scale-95 transition-all shadow-sm"
          >
            + Nuevo
          </button>
        </div>

        {mostrarFormulario && (
          <div className="border-2 border-primary/30 bg-slate-50 rounded-2xl p-4 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-accent">Nuevo Producto</p>
              <button
                onClick={() => { setMostrarFormulario(false); setPreviewImg(null); }}
                className="text-slate-400 active:text-slate-600 p-1"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nombre del producto</label>
              <input type="text" placeholder="Ej: Refresco 2L" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} className="input-base" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Precio en USD</label>
                <input type="text" inputMode="decimal" placeholder="0.00" value={nuevoPrecioUSD}
                  onFocus={() => ultimoEditadoNuevo.current = 'usd'}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, '');
                    setNuevoPrecioUSD(v);
                    ultimoEditadoNuevo.current = 'usd';
                    if (config.tasaDolar > 0 && v) {
                      setNuevoPrecioBs((parseFloat(v) * config.tasaDolar).toFixed(2));
                    }
                  }}
                  className="input-base" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Precio en Bs</label>
                <input type="text" inputMode="decimal" placeholder="0.00" value={nuevoPrecioBs}
                  onFocus={() => ultimoEditadoNuevo.current = 'bs'}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, '');
                    setNuevoPrecioBs(v);
                    ultimoEditadoNuevo.current = 'bs';
                    if (config.tasaDolar > 0 && v) {
                      setNuevoPrecioUSD((parseFloat(v) / config.tasaDolar).toFixed(2));
                    }
                  }}
                  className="input-base" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Foto (opcional)</label>
              <div className="flex items-center gap-3">
                {previewImg ? (
                  <div className="relative">
                    <img src={previewImg} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-accent/30" />
                    <button onClick={() => { setPreviewImg(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute -top-2 -right-2 bg-alerta text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">x</button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} disabled={comprimiendo} className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 active:border-primary active:text-primary transition-colors">
                    {comprimiendo ? <div className="spinner" /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>}
                  </button>
                )}
                <span className="text-xs text-slate-400">Max 25KB, automatico</span>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  if (!nuevoNombre.trim() || !(parseFloat(nuevoPrecioUSD) > 0)) return;
                  onAgregarProducto({
                    id: Date.now(), nombre: nuevoNombre.trim(),
                    precioUSD: parseFloat(nuevoPrecioUSD),
                    precioBs: parseFloat(nuevoPrecioBs) || 0,
                    activo: true, imagen: previewImg || '',
                  });
                  setNuevoNombre(''); setNuevoPrecioUSD(''); setNuevoPrecioBs(''); setPreviewImg(null); setMostrarFormulario(false);
                }}
                disabled={!nuevoNombre.trim() || !(parseFloat(nuevoPrecioUSD) > 0)}
                className="bg-primary text-white font-bold py-3 rounded-xl min-h-touch active:bg-primaryDark active:scale-[0.97] transition-all disabled:opacity-50 w-full text-center shadow-sm flex-[2] text-sm"
              >
                Guardar Producto
              </button>
              <button onClick={() => { setMostrarFormulario(false); setNuevoPrecioBs(''); setPreviewImg(null); }} className="bg-slate-200 text-slate-700 font-bold py-3 rounded-xl min-h-touch active:bg-slate-300 active:scale-[0.97] transition-all w-full text-center flex-1 text-sm">
                Cancelar
              </button>
            </div>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try { setComprimiendo(true); const base64 = await comprimirImagen(file); setPreviewImg(base64); } catch {} finally { setComprimiendo(false); }
        }} />
        <input ref={editFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCambiarFotoEdicion} />

        <div className="space-y-2 max-h-[30rem] overflow-y-auto">
          {productos.map((p) => (
            <div key={p.id} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${p.activo ? 'bg-slate-50 border-slate-100 shadow-sm' : 'bg-slate-100/50 border-slate-200/50 opacity-60'}`}>
              <button onClick={() => setEditandoProducto(p)} className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
                  {p.imagen ? <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white" style={{ backgroundColor: '#7C3AED' }}>{p.nombre.charAt(0).toUpperCase()}</div>}
                </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.nombre}</p>
                    <p className="text-xs font-bold text-primary/70">{formatearUSD(p.precioUSD)} | {formatearBs(p.precioBs ?? 0)}</p>
                  </div>
              </button>
              <button onClick={() => onActualizarProducto({ ...p, activo: !p.activo })} className={`relative inline-flex h-7 w-11 items-center rounded-full transition-colors flex-shrink-0 ${p.activo ? 'bg-primary' : 'bg-slate-300'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${p.activo ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
              </button>
              <button onClick={() => { if (window.confirm(`Eliminar ${p.nombre}?`)) { onEliminarProducto(p.id); } }} className="text-slate-400 active:text-alerta p-2 transition-colors flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {editandoProducto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditandoProducto(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-5 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Editar Producto</h3>
            <div className="space-y-3">
              {editandoProducto.imagen && <div className="flex justify-center mb-2"><img src={editandoProducto.imagen} alt={editandoProducto.nombre} className="w-24 h-24 object-cover rounded-2xl border border-slate-200 shadow-sm" /></div>}
              <div>
                <label className="text-xs text-slate-500 block mb-1">Nombre</label>
                <input type="text" value={editandoProducto.nombre} onChange={(e) => setEditandoProducto({ ...editandoProducto, nombre: e.target.value })} className="input-base" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Precio USD</label>
                  <input type="text" inputMode="decimal" value={editandoProducto.precioUSD}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                      setEditandoProducto((prev) => {
                        if (!prev) return null;
                        return { ...prev, precioUSD: v, precioBs: config.tasaDolar > 0 ? parseFloat((v * config.tasaDolar).toFixed(2)) : (prev.precioBs ?? 0) };
                      });
                    }}
                    className="input-base" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Precio Bs</label>
                  <input type="text" inputMode="decimal" value={editandoProducto.precioBs ?? 0}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                      setEditandoProducto((prev) => {
                        if (!prev) return null;
                        return { ...prev, precioBs: v, precioUSD: config.tasaDolar > 0 ? parseFloat((v / config.tasaDolar).toFixed(2)) : (prev.precioUSD ?? 0) };
                      });
                    }}
                    className="input-base" />
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <button onClick={() => editFileInputRef.current?.click()} className="bg-slate-200 text-slate-700 font-bold py-3 rounded-xl min-h-touch active:bg-slate-300 active:scale-[0.97] transition-all text-xs flex-1 text-center" disabled={comprimiendo}>{comprimiendo ? 'Comprimiendo...' : 'Cambiar foto'}</button>
                {editandoProducto.imagen && <button onClick={() => setEditandoProducto({ ...editandoProducto, imagen: '' })} className="text-xs text-slate-400 active:text-slate-600 font-medium">Quitar</button>}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditandoProducto(null)} className="bg-slate-200 text-slate-700 font-bold py-3 rounded-xl min-h-touch active:bg-slate-300 active:scale-[0.97] transition-all w-full text-center flex-1">Cancelar</button>
              <button onClick={() => { onActualizarProducto(editandoProducto); setEditandoProducto(null); }} className="bg-primary text-white font-bold py-3 rounded-xl min-h-touch active:bg-primaryDark active:scale-[0.97] transition-all w-full text-center shadow-sm flex-[2]">Guardar</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <details>
          <summary className="text-sm font-medium text-slate-700 cursor-pointer">
            Historial de acciones ({historial.length})
          </summary>
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {historial.length === 0 ? <p className="text-xs text-slate-400">Sin acciones registradas</p>
            : [...historial].reverse().slice(0, 20).map((h, i) => (
              <div key={i} className="flex justify-between text-xs text-slate-500 py-0.5">
                <span className="truncate mr-2">{h.accion}</span>
                <span className="text-slate-300 whitespace-nowrap">{formatearFecha(h.fecha)}</span>
              </div>
            ))}
          </div>
        </details>
      </div>

      <div className="text-center">
        <button onClick={descargarRespaldo} className="text-xs text-slate-400 py-2 active:text-slate-600">Descargar configuracion</button>
      </div>
    </div>
  );
}
