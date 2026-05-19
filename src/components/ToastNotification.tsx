import { useEffect, useState } from 'react';

interface Props {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function ToastNotification({ message, type, visible, onClose, duration = 3000 }: Props) {
  const [animando, setAnimando] = useState(false);

  useEffect(() => {
    if (visible) {
      const t1 = setTimeout(() => setAnimando(true), 10);
      const t2 = setTimeout(() => {
        setAnimando(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setAnimando(false);
    }
  }, [visible]);

  if (!visible && !animando) return null;

  const bg = type === 'success' ? 'bg-exito' : 'bg-alerta';
  const icono = type === 'success'
    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;

  return (
    <div className={`fixed top-4 left-4 right-4 z-[100] flex justify-center pointer-events-none transition-all duration-300 ${animando ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
      <div className={`${bg} text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 pointer-events-auto max-w-sm`}>
        {icono}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={() => { setAnimando(false); setTimeout(onClose, 300); }} className="ml-auto text-white/70 hover:text-white p-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
    </div>
  );
}
