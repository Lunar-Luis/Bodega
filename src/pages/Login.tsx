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
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');
    setLoading(true);

    const fn = modo === 'login' ? signIn : signUp;
    const errMsg = await fn(email, password);

    if (errMsg) {
      setError(traducirError(errMsg));
    } else if (modo === 'registro') {
      setExito('Cuenta creada correctamente');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-fondo flex items-center justify-center p-6">
      <ToastNotification message={error} type="error" visible={!!error} onClose={() => setError('')} />
      <ToastNotification message={exito} type="success" visible={!!exito} onClose={() => setExito('')} />

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
          <h2 className="text-base font-semibold text-slate-700 text-center">
            {modo === 'login' ? 'Iniciar Sesion' : 'Crear Cuenta'}
          </h2>

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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white text-slate-800"
              placeholder="minimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Procesando...' : modo === 'login' ? 'Entrar' : 'Crear Cuenta'}
          </button>

          <p className="text-sm text-center text-slate-400">
            {modo === 'login' ? (
              <>No tienes cuenta?{' '}
                <button type="button" onClick={() => { setModo('registro'); setError(''); }} className="text-primary font-medium hover:underline">
                  Registrarse
                </button>
              </>
            ) : (
              <>Ya tienes cuenta?{' '}
                <button type="button" onClick={() => { setModo('login'); setError(''); }} className="text-primary font-medium hover:underline">
                  Iniciar Sesion
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
