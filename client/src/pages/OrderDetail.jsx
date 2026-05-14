import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../stores/authStore';

const statusMap = {
  pending: { label: 'Ожидает оплаты', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  paid: { label: 'Оплачен', cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  cancelled: { label: 'Отменён', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const { accessToken } = useAuthStore();

  async function handlePay() {
    setPayError('');
    setPaying(true);
    try {
      const { data } = await axios.post('/api/payments/create-checkout', { order_id: id }, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
      window.location.href = data.url;
    } catch (err) {
      setPayError(err.response?.data?.error || 'Ошибка при создании сессии оплаты');
      setPaying(false);
    }
  }

  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');

  useEffect(() => {
    const headers = { Authorization: `Bearer ${accessToken}` };
    const load = async () => {
      try {
        // If returning from successful Stripe payment, verify and mark as paid
        if (success) {
          await axios.post(`/api/orders/${id}/verify-payment`, {}, { headers, withCredentials: true }).catch(() => {});
        }
        const r = await axios.get(`/api/orders/${id}`, { headers, withCredentials: true });
        setOrder(r.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 animate-pulse space-y-4">
        <div className="h-8 bg-navy-700 rounded w-1/3" />
        <div className="h-32 bg-navy-700 rounded" />
        <div className="h-24 bg-navy-700 rounded" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-20 text-gray-500">Заказ не найден</div>;
  }

  const st = statusMap[order.status] || statusMap.pending;

  return (
    <div className="page-fade max-w-3xl mx-auto px-6 py-10">
      <Link to="/orders" className="text-gray-500 hover:text-white text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        ← Назад к заказам
      </Link>

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Оплата прошла успешно! Заказ принят в обработку.</span>
        </div>
      )}
      {cancelled && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Оплата была отменена. Заказ сохранён как ожидающий.</span>
        </div>
      )}

      <div className="bg-navy-700 rounded-xl p-6 border border-white/5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="font-heading text-2xl font-bold text-white mb-2">
              Заказ #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${st.cls}`}>
              {st.label}
            </span>
            {(order.status === 'pending' || order.status === 'cancelled') && (
              <button onClick={handlePay} disabled={paying} className="btn-primary py-2 px-5 text-sm">
                {paying ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Переход...
                  </span>
                ) : 'Оплатить'}
              </button>
            )}
          </div>
        </div>
        {payError && <p className="text-red-400 text-sm mt-3">{payError}</p>}
        {order.stripe_payment_id && (
          <p className="text-xs text-gray-600 mt-3 font-mono">Payment ID: {order.stripe_payment_id}</p>
        )}
      </div>

      {/* Items */}
      <div className="bg-navy-700 rounded-xl border border-white/5 overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-white/5">
          <h3 className="font-semibold text-white">Состав заказа</h3>
        </div>
        <div className="divide-y divide-white/5">
          {order.items?.map(item => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-12 h-12 rounded-lg bg-navy-500 overflow-hidden shrink-0">
                {item.product?.photo_url ? (
                  <img src={item.product.photo_url} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 font-bold">
                    {item.product?.name?.[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.product?.name || 'Товар удалён'}</p>
                <p className="text-xs text-gray-500">{Number(item.price_at_purchase).toLocaleString('ru-RU')} ₽ × {item.quantity}</p>
              </div>
              <div className="font-bold text-white shrink-0">
                {(Number(item.price_at_purchase) * item.quantity).toLocaleString('ru-RU')} ₽
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-white/5 flex justify-between items-center bg-navy-800">
          <span className="font-heading font-bold text-white">Итого</span>
          <span className="font-heading font-bold text-xl text-coral-500">{Number(order.total_price).toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>
    </div>
  );
}
