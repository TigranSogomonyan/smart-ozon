import { Link } from 'react-router-dom';
import useFavoritesStore from '../stores/favoritesStore';
import ProductCard from '../components/ProductCard';

export default function Favorites() {
  const { items } = useFavoritesStore();
  const products = items.map(f => f.product).filter(Boolean);

  return (
    <div className="page-fade max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <svg className="w-7 h-7 text-coral-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h1 className="font-heading text-3xl font-bold text-white">Избранное</h1>
        <span className="text-gray-500 text-sm">{products.length} товаров</span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="font-heading text-xl font-bold text-white mb-2">Ничего не добавлено</h2>
          <p className="text-sm mb-8">Нажмите на сердечко на любом товаре, чтобы сохранить его</p>
          <Link to="/catalog" className="btn-primary py-3 px-8">Перейти в каталог</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
