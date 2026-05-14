import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../stores/authStore';

const statusMap = {
  pending: { label: 'Ожидает оплаты', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  paid: { label: 'Оплачен', cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  cancelled: { label: 'Отменён', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    axios.get('/api/orders', { headers: { Authorization: `Bearer ${accessToken}` }, withCredentials: true })
      .then(r => { setOrders(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleCancel(id) {
    try {
      await axios.put(`/api/orders/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${accessToken}` }, withCredentials: true });
      setOrders(os => os.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    } catch {}
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-navy-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="page-fade max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-heading text-3xl font-bold text-white mb-8">Мои заказы</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="font-heading text-xl font-bold text-white mb-2">Заказов пока нет</h2>
          <p className="text-sm mb-8">Оформите первый заказ в нашем каталоге</p>
          <Link to="/catalog" className="btn-primary py-3 px-8">Перейти в каталог</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const st = statusMap[order.status] || statusMap.pending;
            return (
              <div key={order.id} className="bg-navy-700 rounded-xl p-5 border border-white/5 card-glow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-mono text-sm text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="font-bold text-white text-lg">
                      {Number(order.total_price).toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/orders/${order.id}`} className="btn-outline py-1.5 px-3 text-sm">Подробнее</Link>
                      {order.status === 'pending' && (
                        <button onClick={() => handleCancel(order.id)} className="py-1.5 px-3 text-sm border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded transition-colors">
                          Отменить
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
