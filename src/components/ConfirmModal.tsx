interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, confirmText, cancelText, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-pop text-center">
        <div className="w-14 h-14 bg-alerta/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-secondary flex-1 text-sm">{cancelText}</button>
          <button onClick={onConfirm} className="bg-alerta text-white font-bold py-3 px-4 rounded-xl min-h-12 active:scale-[0.97] transition-all w-full text-center flex-[2] text-sm shadow-sm">{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
