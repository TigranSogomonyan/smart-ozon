import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

function Skeleton() {
  return (
    <div className="bg-navy-700 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-navy-500" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-navy-500 rounded w-1/3" />
        <div className="h-4 bg-navy-500 rounded w-3/4" />
        <div className="h-3 bg-navy-500 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function Home() {
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/products/top').then(r => { setTopProducts(r.data); setLoadingProducts(false); }).catch(() => setLoadingProducts(false));
    axios.get('/api/categories').then(r => setCategories(r.data));
  }, []);

  return (
    <div className="page-fade">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-coral-500/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-coral-500/10 border border-coral-500/20 rounded-full px-4 py-1.5 text-coral-400 text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Новый уровень шопинга
            </div>
            <h1 className="font-heading text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Умный<br />
              <span className="text-coral-500">маркетплейс</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-lg">
              Лучшие товары от проверенных продавцов. Быстрая доставка, безопасная оплата, гарантия качества.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link to="/catalog" className="btn-primary text-base py-3 px-8">
                Перейти в каталог
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link to="/register" className="btn-outline text-base py-3 px-8">
                Стать продавцом
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-10 justify-center md:justify-start">
              {[['500+', 'Товаров'], ['50+', 'Продавцов'], ['24/7', 'Поддержка']].map(([n, l]) => (
                <div key={l} className="text-center">
                  <div className="font-heading text-2xl font-bold text-coral-500">{n}</div>
                  <div className="text-xs text-gray-500">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 bg-gradient-to-br from-coral-500/20 to-violet-500/20 rounded-full blur-2xl" />
              <div className="relative bg-navy-700 rounded-2xl p-8 border border-white/5 flex flex-col gap-4">
                {[
                  { icon: '⚡', text: 'Мгновенная оплата' },
                  { icon: '🛡️', text: 'Безопасные сделки' },
                  { icon: '🚀', text: 'Быстрая доставка' },
                  { icon: '⭐', text: 'Лучшие продавцы' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-3 bg-navy-600 rounded-lg p-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="font-heading text-2xl font-bold text-white mb-6">Категории</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/catalog?category_id=${cat.id}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all hover:scale-105"
                style={{ borderColor: `${cat.color}40`, backgroundColor: `${cat.color}15`, color: cat.color }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Top products */}
      <section className="max-w-7xl mx-auto px-6 py-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl font-bold text-white">Топ товары</h2>
          <Link to="/catalog" className="text-coral-500 hover:text-coral-400 text-sm font-medium flex items-center gap-1">
            Смотреть все
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loadingProducts
            ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} />)
            : topProducts.map(p => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </section>
    </div>
  );
}
