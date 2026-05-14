import { useEffect, useState } from 'react';
import http from '../api/axios';

const TABS = ['Заявки продавцов', 'Пользователи', 'Категории', 'Заказы', 'Товары'];

const statusMap = { pending: 'Ожидает', paid: 'Оплачен', cancelled: 'Отменён' };
const statusCls = {
  pending: 'bg-yellow-500/15 text-yellow-400',
  paid: 'bg-green-500/15 text-green-400',
  cancelled: 'bg-red-500/15 text-red-400',
};
const roleCls = {
  admin: 'bg-coral-500/15 text-coral-400',
  seller: 'bg-violet-500/15 text-violet-400',
  user: 'bg-gray-500/15 text-gray-400',
};

function Table({ children }) {
  return (
    <div className="bg-navy-700 rounded-xl border border-white/5 overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('Заявки продавцов');
  const [data, setData] = useState({ requests: [], users: [], categories: [], orders: [], products: [] });
  const [catForm, setCatForm] = useState({ name: '', color: '#6C63FF' });
  const [editCat, setEditCat] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [req, usr, cat, ord, prd] = await Promise.all([
        http.get('/admin/seller-requests'),
        http.get('/admin/users'),
        http.get('/categories'),
        http.get('/admin/orders'),
        http.get('/admin/products'),
      ]);
      setData({ requests: req.data, users: usr.data, categories: cat.data, orders: ord.data, products: prd.data });
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approveRequest(id) {
    await http.put(`/admin/seller-requests/${id}/approve`);
    setData(d => ({ ...d, requests: d.requests.filter(r => r.id !== id) }));
  }

  async function rejectRequest(id) {
    await http.put(`/admin/seller-requests/${id}/reject`);
    setData(d => ({ ...d, requests: d.requests.filter(r => r.id !== id) }));
  }

  async function changeRole(id, role) {
    await http.put(`/admin/users/${id}/role`, { role });
    setData(d => ({ ...d, users: d.users.map(u => u.id === id ? { ...u, role } : u) }));
  }

  async function deleteUser(id) {
    if (!confirm('Удалить пользователя? Это действие необратимо.')) return;
    await http.delete(`/admin/users/${id}`);
    setData(d => ({ ...d, users: d.users.filter(u => u.id !== id) }));
  }

  async function changeOrderStatus(id, status) {
    await http.put(`/admin/orders/${id}/status`, { status });
    setData(d => ({ ...d, orders: d.orders.map(o => o.id === id ? { ...o, status } : o) }));
  }

  async function deleteProduct(id) {
    if (!confirm('Удалить товар?')) return;
    await http.delete(`/products/${id}`);
    setData(d => ({ ...d, products: d.products.filter(p => p.id !== id) }));
  }

  async function saveCategory(e) {
    e.preventDefault();
    if (editCat) {
      const res = await http.put(`/categories/${editCat.id}`, { name: catForm.name, color: catForm.color });
      setData(d => ({ ...d, categories: d.categories.map(c => c.id === editCat.id ? res.data : c) }));
      setEditCat(null);
    } else {
      const res = await http.post('/categories', catForm);
      setData(d => ({ ...d, categories: [...d.categories, res.data] }));
    }
    setCatForm({ name: '', color: '#6C63FF' });
  }

  async function deleteCategory(id) {
    if (!confirm('Удалить категорию?')) return;
    await http.delete(`/categories/${id}`);
    setData(d => ({ ...d, categories: d.categories.filter(c => c.id !== id) }));
  }

  return (
    <div className="page-fade max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-heading text-3xl font-bold text-white mb-6">Панель администратора</h1>

      <div className="flex border-b border-white/10 mb-8 gap-1 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${tab === t ? 'border-coral-500 text-coral-500' : 'border-transparent text-gray-500 hover:text-white'}`}>
            {t}
            {t === 'Заявки продавцов' && data.requests.length > 0 && (
              <span className="ml-2 bg-coral-500 text-white text-xs rounded-full px-1.5 py-0.5">{data.requests.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading && <div className="text-gray-500 text-sm mb-4">Загрузка...</div>}

      {tab === 'Заявки продавцов' && (
        data.requests.length === 0 ? (
          <div className="text-center py-16 text-gray-500"><div className="text-4xl mb-3">✅</div><p>Новых заявок нет</p></div>
        ) : (
          <Table>
            <thead><tr className="border-b border-white/5 text-gray-500 text-left">
              <th className="px-5 py-3">Пользователь</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Дата</th><th className="px-4 py-3">Действия</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {data.requests.map(u => (
                <tr key={u.id} className="hover:bg-white/2">
                  <td className="px-5 py-3 font-medium text-white">{u.first_name} {u.last_name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('ru-RU')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => approveRequest(u.id)} className="px-3 py-1 text-xs bg-green-500/15 text-green-400 hover:bg-green-500/25 rounded transition-colors">Одобрить</button>
                      <button onClick={() => rejectRequest(u.id)} className="px-3 py-1 text-xs bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded transition-colors">Отклонить</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      )}

      {tab === 'Пользователи' && (
        <Table>
          <thead><tr className="border-b border-white/5 text-gray-500 text-left">
            <th className="px-5 py-3">Пользователь</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Роль</th><th className="px-4 py-3">Изменить роль</th><th className="px-4 py-3">Удалить</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {data.users.map(u => (
              <tr key={u.id} className="hover:bg-white/2">
                <td className="px-5 py-3 font-medium text-white">{u.first_name} {u.last_name}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${roleCls[u.role]}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} className="bg-navy-600 border border-white/10 text-white text-xs rounded px-2 py-1">
                    <option value="user">user</option>
                    <option value="seller">seller</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteUser(u.id)} className="px-2 py-0.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors">Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {tab === 'Категории' && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <Table>
              <thead><tr className="border-b border-white/5 text-gray-500 text-left">
                <th className="px-5 py-3">Категория</th><th className="px-4 py-3">Цвет</th><th className="px-4 py-3">Действия</th>
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {data.categories.map(c => (
                  <tr key={c.id} className="hover:bg-white/2">
                    <td className="px-5 py-3 font-medium text-white">{c.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: c.color }} />
                        <span className="text-xs text-gray-500 font-mono">{c.color}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditCat(c); setCatForm({ name: c.name, color: c.color }); }} className="px-2 py-0.5 text-xs text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 rounded transition-colors">Изменить</button>
                        <button onClick={() => deleteCategory(c.id)} className="px-2 py-0.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors">Удалить</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="lg:w-72 shrink-0">
            <div className="bg-navy-700 rounded-xl p-5 border border-white/5">
              <h3 className="font-semibold text-white mb-4">{editCat ? 'Редактировать' : 'Новая категория'}</h3>
              <form onSubmit={saveCategory} className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Название</label>
                  <input type="text" required value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} className="input-dark text-sm py-2" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Цвет</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={catForm.color} onChange={e => setCatForm(f => ({ ...f, color: e.target.value }))} className="w-10 h-9 rounded cursor-pointer border-0 bg-transparent p-0" />
                    <input type="text" value={catForm.color} onChange={e => setCatForm(f => ({ ...f, color: e.target.value }))} className="input-dark text-sm py-2 font-mono flex-1" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary py-2 text-sm flex-1 justify-center">{editCat ? 'Сохранить' : 'Добавить'}</button>
                  {editCat && <button type="button" onClick={() => { setEditCat(null); setCatForm({ name: '', color: '#6C63FF' }); }} className="btn-outline py-2 px-3 text-sm">✕</button>}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {tab === 'Заказы' && (
        <Table>
          <thead><tr className="border-b border-white/5 text-gray-500 text-left">
            <th className="px-5 py-3">Заказ</th><th className="px-4 py-3">Покупатель</th><th className="px-4 py-3">Дата</th><th className="px-4 py-3">Статус</th><th className="px-4 py-3">Сумма</th><th className="px-4 py-3">Изменить</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {data.orders.map(o => (
              <tr key={o.id} className="hover:bg-white/2">
                <td className="px-5 py-3 font-mono text-gray-400 text-xs">#{o.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-4 py-3 text-sm text-white">{o.user?.email || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString('ru-RU')}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${statusCls[o.status]}`}>{statusMap[o.status]}</span>
                </td>
                <td className="px-4 py-3 font-bold text-white">{Number(o.total_price).toLocaleString('ru-RU')} ₽</td>
                <td className="px-4 py-3">
                  <select value={o.status} onChange={e => changeOrderStatus(o.id, e.target.value)} className="bg-navy-600 border border-white/10 text-white text-xs rounded px-2 py-1">
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {tab === 'Товары' && (
        <Table>
          <thead><tr className="border-b border-white/5 text-gray-500 text-left">
            <th className="px-5 py-3">Товар</th><th className="px-4 py-3 hidden md:table-cell">Магазин</th><th className="px-4 py-3 hidden md:table-cell">Категория</th><th className="px-4 py-3">Цена</th><th className="px-4 py-3">Удалить</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {data.products.map(p => (
              <tr key={p.id} className="hover:bg-white/2">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-navy-500 overflow-hidden shrink-0">
                      {p.photo_url ? <img src={p.photo_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-white/20">{p.name[0]}</div>}
                    </div>
                    <span className="text-white text-sm truncate max-w-[180px]">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">{p.shop?.name}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {p.category && <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: `${p.category.color}22`, color: p.category.color }}>{p.category.name}</span>}
                </td>
                <td className="px-4 py-3 font-bold text-coral-500">{Number(p.price).toLocaleString('ru-RU')} ₽</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteProduct(p.id)} className="px-2 py-0.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors">Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
