import { Link } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../stores/authStore';
import useFavoritesStore from '../stores/favoritesStore';
import useCartStore from '../stores/cartStore';

export default function ProductCard({ product }) {
  const { user } = useAuthStore();
  const { toggle, isFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();
  const [adding, setAdding] = useState(false);

  const fav = isFavorite(product.id);
  const cat = product.category;
  const catColor = cat?.color || '#FF6B35';

  async function handleAddToCart(e) {
    e.preventDefault();
    if (!user) { window.location.href = '/login'; return; }
    setAdding(true);
    try { await addItem(product.id, 1); } catch {}
    setAdding(false);
  }

  async function handleFav(e) {
    e.preventDefault();
    if (!user) { window.location.href = '/login'; return; }
    await toggle(product.id);
  }

  return (
    <Link to={`/products/${product.id}`} className="block">
      <div className="bg-navy-700 rounded-xl overflow-hidden card-glow flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          {product.photo_url ? (
            <img
              src={product.photo_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div
            className={`w-full h-full items-center justify-center text-4xl font-bold text-white/20 ${product.photo_url ? 'hidden' : 'flex'}`}
            style={{ background: `linear-gradient(135deg, ${catColor}22, ${catColor}55)` }}
          >
            {product.name.charAt(0)}
          </div>
          {/* Favorite button */}
          <button
            onClick={handleFav}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-navy-900/70 backdrop-blur-sm hover:bg-navy-900 transition-colors"
          >
            <svg className={`w-5 h-5 transition-colors ${fav ? 'text-coral-500 fill-coral-500' : 'text-gray-400'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col gap-2 flex-1">
          {cat && (
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium self-start" style={{ backgroundColor: `${catColor}22`, color: catColor }}>
              {cat.name}
            </span>
          )}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-white">{product.name}</h3>
          {product.shop && (
            <p className="text-xs text-gray-500">{product.shop.name}</p>
          )}
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="text-coral-500 font-bold text-base">
              {Number(product.price).toLocaleString('ru-RU')} ₽
            </span>
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="p-1.5 bg-coral-500 hover:bg-coral-400 rounded-lg transition-colors disabled:opacity-50"
              title="В корзину"
            >
              {adding ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
