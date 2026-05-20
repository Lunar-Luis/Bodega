import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ToastNotification from '../components/ToastNotification';

function traducirError(msg: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'Correo o contrasena incorrectos',
    'User already registered': 'El usuario ya esta registrado',
    'Email already registered': 'El correo ya esta registrado',
    'Password should be at least 6 characters': 'La contrasena debe tener al menos 6 caracteres',
    'Invalid email': 'Correo electronico invalido',
    'Email not confirmed': 'Correo electronico no confirmado',
    'Email link is invalid or has expired': 'El enlace es invalido o ha expirado',
    'Invalid email or password': 'Correo o contrasena incorrectos',
    'Password recovery requires an email': 'Debes ingresar un correo electronico',
    'Signup requires a valid password': 'Debes ingresar una contrasena valida',
    'Request rate limit reached': 'Demasiados intentos. Intenta de nuevo en unos minutos',
  };
  return map[msg] || msg;
}

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const errMsg = await signIn(email, password);
    if (errMsg) setError(traducirError(errMsg));
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-fondo flex items-center justify-center p-6">
      <ToastNotification message={error} type="error" visible={!!error} onClose={() => setError('')} />

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800">BodegaOnline</h1>
          <p className="text-sm text-slate-400 mt-1">Control de Ventas</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-700 text-center">Iniciar Sesion</h2>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Correo electronico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white text-slate-800"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Contrasena</label>
            <div className="relative">
              <input
                type={verPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 pr-11 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white text-slate-800"
                placeholder="minimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setVerPassword(!verPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                tabIndex={-1}
              >
                {verPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
