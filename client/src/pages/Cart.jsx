import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/axios';
import imgUrl from '../api/imgUrl';
import useCartStore from '../stores/cartStore';

export default function Cart() {
  const { items, updateQty, removeItem, loading } = useCartStore();
  const total = items.reduce((s, i) => s + Number(i.product?.price || 0) * i.quantity, 0);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleCheckout() {
    setError('');
    setCheckingOut(true);
    try {
      const { data } = await api.post('/orders');
      if (data.checkoutUrl && data.checkoutUrl.startsWith('http')) {
        window.location.href = data.checkoutUrl;
      } else {
        navigate(`/orders/${data.order.id}?success=1`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка оформления заказа');
    }
    setCheckingOut(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-navy-500 border-t-coral-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-24 px-6 page-fade">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="font-heading text-2xl font-bold text-white mb-3">Корзина пуста</h2>
        <p className="text-gray-500 mb-8">Добавьте товары из каталога, чтобы оформить заказ</p>
        <Link to="/catalog" className="btn-primary text-base py-3 px-8">Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="page-fade max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-heading text-3xl font-bold text-white mb-8">Корзина</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {items.map(item => {
            const product = item.product;
            const cat = product?.category;
            return (
              <div key={item.id} className="bg-navy-700 rounded-xl p-4 border border-white/5 flex items-center gap-4 card-glow">
                <Link to={`/products/${product?.id}`} className="shrink-0">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-navy-500">
                    {imgUrl(product?.photo_url) ? (
                      <img src={imgUrl(product.photo_url)} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white/20"
                        style={{ background: cat ? `linear-gradient(135deg, ${cat.color}22, ${cat.color}44)` : '' }}>
                        {product?.name?.[0]}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product?.id}`} className="font-semibold text-white hover:text-coral-500 transition-colors text-sm line-clamp-2">
                    {product?.name}
                  </Link>
                  {cat && <div className="text-xs mt-1" style={{ color: cat.color }}>{cat.name}</div>}
                  <div className="text-coral-500 font-bold mt-1">{Number(product?.price).toLocaleString('ru-RU')} ₽</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => item.quantity > 1 ? updateQty(item.id, item.quantity - 1) : removeItem(item.id)}
                    className="w-7 h-7 bg-navy-600 hover:bg-navy-500 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">−</button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-7 h-7 bg-navy-600 hover:bg-navy-500 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">+</button>
                </div>
                <div className="text-right shrink-0 w-24">
                  <div className="font-bold text-white">{(Number(product?.price) * item.quantity).toLocaleString('ru-RU')} ₽</div>
                  <button onClick={() => removeItem(item.id)} className="text-xs text-red-400 hover:text-red-300 mt-1 transition-colors">Удалить</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:w-80 shrink-0">
          <div className="bg-navy-700 rounded-xl p-6 border border-white/5 sticky top-24">
            <h3 className="font-heading text-lg font-bold text-white mb-5">Ваш заказ</h3>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Товаров</span>
                <span>{items.reduce((s, i) => s + i.quantity, 0)} шт.</span>
              </div>
              <div className="border-t border-white/5 pt-3 flex justify-between font-bold text-white text-lg">
                <span>Итого</span>
                <span>{total.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <button onClick={handleCheckout} disabled={checkingOut} className="btn-primary w-full justify-center py-3">
              {checkingOut ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Оформляем...</span>
              ) : 'Оформить заказ'}
            </button>
            <Link to="/catalog" className="block text-center text-xs text-gray-500 hover:text-gray-300 mt-3 transition-colors">Продолжить покупки</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
