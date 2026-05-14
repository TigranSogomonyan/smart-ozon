import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import api from '../api/axios';

export default function BecomeSeller() {
  const { user, loading, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && user && (user.role === 'seller' || user.role === 'admin')) {
      navigate('/my-shop', { replace: true });
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-navy-500 border-t-coral-500 rounded-full animate-spin" />
      </div>
    );
  }

  async function handleRequest() {
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/users/me/request-seller');
      updateUser({ seller_request: data.seller_request });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка отправки заявки');
    }
    setSubmitting(false);
  }

  const status = user?.seller_request;

  return (
    <div className="page-fade max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral-500/15 mb-4">
          <svg className="w-8 h-8 text-coral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v4H3V3zm0 7h18v11H3V10zm5 3h8" />
          </svg>
        </div>
        <h1 className="font-heading text-3xl font-bold text-white mb-3">Стать продавцом</h1>
        <p className="text-gray-400">Открой свой магазин на SmartOzon и начни продавать уже сегодня</p>
      </div>

      {!user ? (
        <div className="bg-navy-700 rounded-2xl p-8 border border-white/5 text-center">
          <p className="text-gray-300 mb-6">Для подачи заявки необходимо войти в аккаунт или зарегистрироваться</p>
          <div className="flex gap-3 justify-center">
            <Link to="/register" className="btn-primary py-3 px-8">Зарегистрироваться</Link>
            <Link to="/login" className="btn-outline py-3 px-8">Войти</Link>
          </div>
        </div>
      ) : (done || status === 'pending') ? (
        <div className="bg-navy-700 rounded-2xl p-8 border border-yellow-500/20 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="font-heading text-xl font-bold text-white mb-2">Заявка на рассмотрении</h2>
          <p className="text-gray-400 text-sm">Администратор рассмотрит вашу заявку в ближайшее время. После одобрения вы получите доступ к созданию магазина.</p>
          <Link to="/" className="inline-block mt-6 text-coral-500 hover:text-coral-400 text-sm transition-colors">← На главную</Link>
        </div>
      ) : status === 'rejected' ? (
        <div className="bg-navy-700 rounded-2xl p-8 border border-red-500/20 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="font-heading text-xl font-bold text-white mb-2">Заявка отклонена</h2>
          <p className="text-gray-400 text-sm mb-6">К сожалению, ваша заявка была отклонена. Свяжитесь с поддержкой для уточнения причин.</p>
          <Link to="/" className="btn-outline py-2 px-6">На главную</Link>
        </div>
      ) : (
        <div className="bg-navy-700 rounded-2xl p-8 border border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: '🏪', title: 'Свой магазин', desc: 'Создай витрину с логотипом и описанием' },
              { icon: '📦', title: 'Товары', desc: 'Добавляй неограниченное количество товаров' },
              { icon: '💰', title: 'Продажи', desc: 'Получай заказы и отслеживай выручку' },
            ].map(f => (
              <div key={f.title} className="bg-navy-600 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-semibold text-white text-sm mb-1">{f.title}</div>
                <div className="text-xs text-gray-500">{f.desc}</div>
              </div>
            ))}
          </div>
          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
          <button
            onClick={handleRequest}
            disabled={submitting}
            className="btn-primary w-full justify-center py-3 text-base"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Отправка заявки...
              </span>
            ) : 'Подать заявку на продавца'}
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">Заявка будет рассмотрена администратором</p>
        </div>
      )}
    </div>
  );
}
