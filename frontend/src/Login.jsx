import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await api.post('/auth/register', form);
      }
      const { data } = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
            📦
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isRegister ? 'Crear cuenta' : 'Bienvenido'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isRegister ? 'Regístrate para gestionar productos' : 'Inicia sesión para continuar'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {isRegister && (
            <input name="name" placeholder="Nombre" value={form.name} onChange={onChange} required className={inputClass} />
          )}
          <input name="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={onChange} required className={inputClass} />
          <input name="password" type="password" placeholder="Contraseña (mín. 6 caracteres)" value={form.password} onChange={onChange} required minLength={6} className={inputClass} />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="font-semibold text-indigo-600 hover:underline"
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  );
}
