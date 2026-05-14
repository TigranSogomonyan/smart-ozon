import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import imgUrl from '../api/imgUrl';

const tabs = ['Магазин', 'Товары', 'Заказы'];
const statusMap = { pending: 'Ожидает', paid: 'Оплачен', cancelled: 'Отменён' };
const statusCls = {
  pending: 'bg-yellow-500/15 text-yellow-400',
  paid: 'bg-green-500/15 text-green-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

export default function MyShop() {
  const [tab, setTab] = useState('Магазин');
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopForm, setShopForm] = useState({ name: '', description: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [shopMsg, setShopMsg] = useState('');
  const [shopErr, setShopErr] = useState('');
  const navigate = useNavigate();

  async function loadData() {
    setLoading(true);
    try {
      const meRes = await api.get('/users/me');
      if (meRes.data.shop) {
        const shopRes = await api.get(`/shops/${meRes.data.shop?.id || ''}`).catch(() => null);
        if (shopRes) {
          setShop(shopRes.data);
          setShopForm({ name: shopRes.data.name || '', description: shopRes.data.description || '' });
        }
      }
      const [prodsRes, ordersRes] = await Promise.all([
        api.get('/seller/products'),
        api.get('/seller/orders'),
      ]);
      setProducts(prodsRes.data);
      setOrders(ordersRes.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleShopSave(e) {
    e.preventDefault();
    setShopMsg(''); setShopErr('');
    try {
      const fd = new FormData();
      fd.append('name', shopForm.name);
      fd.append('description', shopForm.description);
      if (logoFile) fd.append('logo', logoFile);

      let res;
      if (shop) {
        res = await api.put(`/shops/${shop.id}`, fd);
      } else {
        res = await api.post('/shops', fd);
      }
      setShop(res.data);
      setShopMsg('Магазин сохранён!');
      setTimeout(() => setShopMsg(''), 3000);
    } catch (err) {
      setShopErr(err.response?.data?.error || 'Ошибка сохранения');
    }
  }

  async function handleDeleteProduct(id) {
    if (!confirm('Удалить товар?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(ps => ps.filter(p => p.id !== id));
    } catch {}
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse space-y-4">
        <div className="h-10 bg-navy-700 rounded w-1/3" />
        <div className="h-64 bg-navy-700 rounded" />
      </div>
    );
  }

  return (
    <div className="page-fade max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-heading text-3xl font-bold text-white mb-6">Мой магазин</h1>

      <div className="flex border-b border-white/10 mb-8 gap-1">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${tab === t ? 'border-coral-500 text-coral-500' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Магазин' && (
        <div className="bg-navy-700 rounded-2xl p-6 border border-white/5 max-w-lg">
          <h2 className="font-heading text-lg font-bold text-white mb-5">{shop ? 'Информация о магазине' : 'Создать магазин'}</h2>
          <form onSubmit={handleShopSave} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Название</label>
              <input type="text" required value={shopForm.name} onChange={e => setShopForm(f => ({ ...f, name: e.target.value }))} className="input-dark" placeholder="Мой магазин" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Описание</label>
              <textarea rows={3} value={shopForm.description} onChange={e => setShopForm(f => ({ ...f, description: e.target.value }))} className="input-dark resize-none" placeholder="Расскажите о вашем магазине..." />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Логотип</label>
              {imgUrl(shop?.logo_url) && <img src={imgUrl(shop.logo_url)} alt="logo" className="w-16 h-16 rounded-lg object-cover mb-2" />}
              <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} className="input-dark text-sm" />
            </div>
            {shopErr && <p className="text-red-400 text-sm">{shopErr}</p>}
            {shopMsg && <p className="text-green-400 text-sm">{shopMsg}</p>}
            <button type="submit" className="btn-primary py-2.5">{shop ? 'Сохранить' : 'Создать магазин'}</button>
          </form>
        </div>
      )}

      {tab === 'Товары' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <span className="text-gray-400 text-sm">{products.length} товаров</span>
            <Link to="/my-shop/products/new" className="btn-primary py-2 px-5 text-sm">
              + Добавить товар
            </Link>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">📦</div>
              <p>У вас пока нет товаров</p>
            </div>
          ) : (
            <div className="bg-navy-700 rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500">
                    <th className="text-left px-5 py-3">Товар</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Категория</th>
                    <th className="text-right px-4 py-3">Цена</th>
                    <th className="text-center px-4 py-3">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-navy-500 overflow-hidden shrink-0">
                            {imgUrl(p.photo_url) ? <img src={imgUrl(p.photo_url)} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-white/30">{p.name[0]}</div>}
                          </div>
                          <span className="font-medium text-white truncate max-w-[200px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {p.category && <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: `${p.category.color}22`, color: p.category.color }}>{p.category.name}</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-coral-500">{Number(p.price).toLocaleString('ru-RU')} ₽</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`/my-shop/products/${p.id}/edit`} className="text-xs text-violet-400 hover:text-violet-300 transition-colors px-2 py-1 bg-violet-500/10 rounded">Изменить</Link>
                          <button onClick={() => handleDeleteProduct(p.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 bg-red-500/10 rounded">Удалить</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'Заказы' && (
        <div>
          <p className="text-gray-400 text-sm mb-5">{orders.length} заказов с вашими товарами</p>
          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">📋</div>
              <p>Заказов пока нет</p>
            </div>
          ) : (
            <div className="bg-navy-700 rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500">
                    <th className="text-left px-5 py-3">Заказ</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Дата</th>
                    <th className="text-left px-4 py-3">Статус</th>
                    <th className="text-right px-5 py-3">Сумма</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3 font-mono text-gray-400">#{o.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                        {new Date(o.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${statusCls[o.status]}`}>{statusMap[o.status]}</span>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-white">{Number(o.total_price).toLocaleString('ru-RU')} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
