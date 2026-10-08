import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const empty = { name: '', description: '', price: '', stock: '' };
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const load = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      if (err.response?.status === 401) logout();
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const body = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
    };
    try {
      if (editingId) {
        await api.patch(`/products/${editingId}`, body);
      } else {
        await api.post('/products', body);
      }
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error');
    }
  };

  const onEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onCancel = () => {
    setEditingId(null);
    setForm(empty);
    setError('');
  };

  const onDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const filtered = products.filter((p) =>
    `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-xl">📦</div>
            <h1 className="text-xl font-bold text-slate-800">Gestión de productos</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-700">{user.name}</p>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isAdmin ? 'Administrador' : 'Usuario'}
              </span>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            {editingId ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <input name="name" placeholder="Nombre" value={form.name} onChange={onChange} required className={inputClass} />
            <input name="description" placeholder="Descripción" value={form.description} onChange={onChange} className={inputClass} />
            <input name="price" type="number" step="0.01" min="0" placeholder="Precio" value={form.price} onChange={onChange} required className={inputClass} />
            <input name="stock" type="number" step="1" min="0" placeholder="Stock" value={form.stock} onChange={onChange} required className={inputClass} />

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 sm:col-span-2">{error}</p>
            )}

            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-indigo-700"
              >
                {editingId ? 'Actualizar' : 'Crear producto'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Productos <span className="text-slate-400">({filtered.length})</span>
            </h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className={`${inputClass} sm:max-w-xs`}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">
              No hay productos todavía
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <article key={p.id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-800">{p.name}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {p.stock > 0 ? `Stock: ${p.stock}` : 'Agotado'}
                    </span>
                  </div>
                  <p className="mt-1 flex-1 text-sm text-slate-500">{p.description || 'Sin descripción'}</p>
                  <p className="mt-3 text-2xl font-bold text-indigo-600">{money.format(p.price)}</p>
                  <p className="mt-1 text-xs text-slate-400">Creado por {p.createdBy}</p>

                  {isAdmin && (
                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                      <button
                        onClick={() => onEdit(p)}
                        className="flex-1 rounded-lg bg-indigo-50 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="flex-1 rounded-lg bg-red-50 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
