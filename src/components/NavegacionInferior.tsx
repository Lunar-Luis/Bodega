import { Pagina } from '../types';

interface Props {
  actual: Pagina;
  onCambiar: (pag: Pagina) => void;
}

const items: { id: Pagina; label: string }[] = [
  { id: 'venta', label: 'Venta' },
  { id: 'ventas-dia', label: 'Ventas' },
  { id: 'ganancias', label: 'Mes' },
  { id: 'configuracion', label: 'Config' },
];

function IconoVenta({ activo }: { activo: boolean }) {
  const c = activo ? '#7C3AED' : '#9CA3AF';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconoVentas({ activo }: { activo: boolean }) {
  const c = activo ? '#7C3AED' : '#9CA3AF';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14.01" />
      <line x1="12" y1="14" x2="12" y2="14.01" />
      <line x1="16" y1="14" x2="16" y2="14.01" />
    </svg>
  );
}

function IconoGanancias({ activo }: { activo: boolean }) {
  const c = activo ? '#7C3AED' : '#9CA3AF';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function IconoConfig({ activo }: { activo: boolean }) {
  const c = activo ? '#7C3AED' : '#9CA3AF';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

const iconos: Record<string, (props: { activo: boolean }) => JSX.Element> = {
  venta: IconoVenta,
  'ventas-dia': IconoVentas,
  ganancias: IconoGanancias,
  configuracion: IconoConfig,
};

export default function NavegacionInferior({ actual, onCambiar }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom shadow-lg border-t border-slate-200 bg-white">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const activo = actual === item.id;
          const Icono = iconos[item.id];
          return (
            <button
              key={item.id}
              onClick={() => onCambiar(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 min-h-touch px-1 rounded-xl transition-all ${
                activo ? 'text-primary' : 'text-slate-400'
              }`}
            >
              <span className="text-xl transition-transform duration-150 active:scale-90">
                <Icono activo={activo} />
              </span>
              <span className={`text-[10px] leading-tight ${activo ? 'font-bold text-primary' : 'font-medium text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
