import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import imgUrl from '../api/imgUrl';
import ProductCard from '../components/ProductCard';

export default function ShopPage() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/shops/${id}`)
      .then(r => { setShop(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 animate-pulse">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 bg-navy-700 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-8 bg-navy-700 rounded w-48" />
            <div className="h-4 bg-navy-700 rounded w-72" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square bg-navy-700 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!shop) {
    return <div className="text-center py-20 text-gray-500">Магазин не найден</div>;
  }

  return (
    <div className="page-fade max-w-6xl mx-auto px-6 py-10">
      <div className="bg-navy-700 rounded-2xl p-8 border border-white/5 mb-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-navy-500 overflow-hidden shrink-0 flex items-center justify-center text-3xl font-bold text-white/30">
          {imgUrl(shop.logo_url) ? (
            <img src={imgUrl(shop.logo_url)} alt={shop.name} className="w-full h-full object-cover" />
          ) : shop.name?.[0]}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-heading text-3xl font-bold text-white mb-2">{shop.name}</h1>
          {shop.description && <p className="text-gray-400 text-sm max-w-xl">{shop.description}</p>}
          <p className="text-gray-600 text-xs mt-3">{shop.products?.length || 0} товаров</p>
        </div>
      </div>

      <h2 className="font-heading text-xl font-bold text-white mb-5">Товары магазина</h2>
      {shop.products?.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {shop.products.map(p => <ProductCard key={p.id} product={{ ...p, shop }} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">📦</div>
          <p>В этом магазине пока нет товаров</p>
        </div>
      )}
    </div>
  );
}
