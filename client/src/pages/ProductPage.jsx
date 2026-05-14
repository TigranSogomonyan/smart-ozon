import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import imgUrl from '../api/imgUrl';
import useAuthStore from '../stores/authStore';
import useCartStore from '../stores/cartStore';
import useFavoritesStore from '../stores/favoritesStore';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState('');
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggle, isFavorite } = useFavoritesStore();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(r => { setProduct(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    if (!user) { window.location.href = '/login'; return; }
    setAdding(true);
    try {
      await addItem(product.id, qty);
      setAddedMsg('Добавлено в корзину!');
      setTimeout(() => setAddedMsg(''), 2000);
    } catch {}
    setAdding(false);
  }

  async function handleFav() {
    if (!user) { window.location.href = '/login'; return; }
    await toggle(product.id);
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-navy-700 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-navy-700 rounded w-1/4" />
            <div className="h-8 bg-navy-700 rounded w-3/4" />
            <div className="h-10 bg-navy-700 rounded w-1/3" />
            <div className="h-24 bg-navy-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-gray-500">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-xl">Товар не найден</p>
        <Link to="/catalog" className="text-coral-500 hover:text-coral-400 text-sm mt-4 inline-block">← Вернуться в каталог</Link>
      </div>
    );
  }

  const cat = product.category;
  const fav = isFavorite(product.id);

  return (
    <div className="page-fade max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-white">Главная</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-white">Каталог</Link>
        <span>/</span>
        <span className="text-white truncate">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative">
          <div className="rounded-2xl overflow-hidden bg-navy-700 border border-white/5 aspect-square">
            {imgUrl(product.photo_url) ? (
              <img src={imgUrl(product.photo_url)} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-6xl font-bold text-white/10"
                style={{ background: cat ? `linear-gradient(135deg, ${cat.color}22, ${cat.color}44)` : '' }}
              >
                {product.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {cat && (
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium self-start" style={{ backgroundColor: `${cat.color}22`, color: cat.color }}>
              {cat.name}
            </span>
          )}

          <h1 className="font-heading text-3xl font-bold text-white leading-tight">{product.name}</h1>

          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold text-coral-500">{Number(product.price).toLocaleString('ru-RU')} ₽</span>
            {product.weight && <span className="text-sm text-gray-500">{product.weight >= 1000 ? `${(product.weight / 1000).toFixed(1)} кг` : `${product.weight} г`}</span>}
          </div>

          {product.description && (
            <p className="text-gray-400 leading-relaxed text-sm">{product.description}</p>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-navy-600 rounded-lg border border-white/10">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-400 hover:text-white transition-colors text-lg">−</button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 text-gray-400 hover:text-white transition-colors text-lg">+</button>
            </div>
            <button onClick={handleAddToCart} disabled={adding} className="btn-primary flex-1 justify-center py-3">
              {adding ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Добавляем...</span>
              ) : addedMsg ? (
                <span className="flex items-center gap-2">✓ {addedMsg}</span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" /></svg>
                  В корзину
                </span>
              )}
            </button>
            <button
              onClick={handleFav}
              className={`p-3 rounded-lg border transition-all ${fav ? 'border-coral-500 text-coral-500 bg-coral-500/10' : 'border-white/10 text-gray-400 hover:border-coral-500 hover:text-coral-500'}`}
            >
              <svg className={`w-6 h-6 ${fav ? 'fill-coral-500' : ''}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {product.shop && (
            <Link
              to={`/shops/${product.shop.id}`}
              className="flex items-center gap-3 p-4 bg-navy-700 rounded-xl border border-white/5 hover:border-coral-500/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-navy-500 flex items-center justify-center text-white font-bold">
                {imgUrl(product.shop.logo_url) ? (
                  <img src={imgUrl(product.shop.logo_url)} alt={product.shop.name} className="w-full h-full object-cover rounded-lg" />
                ) : product.shop.name?.[0]}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{product.shop.name}</div>
                <div className="text-xs text-gray-500">Перейти в магазин →</div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
