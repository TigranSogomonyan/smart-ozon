import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

function Skeleton() {
  return (
    <div className="bg-navy-700 rounded-xl animate-pulse overflow-hidden">
      <div className="aspect-square bg-navy-500" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-navy-500 rounded w-1/3" />
        <div className="h-4 bg-navy-500 rounded w-3/4" />
        <div className="h-5 bg-navy-500 rounded w-1/2 mt-2" />
      </div>
    </div>
  );
}

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [smartMode, setSmartMode] = useState(false);
  const [smartLoading, setSmartLoading] = useState(false);
  const [smartResults, setSmartResults] = useState(null);
  const [smartQuery, setSmartQuery] = useState('');

  const search = params.get('search') || '';
  const category_id = params.get('category_id') || '';
  const sort = params.get('sort') || 'newest';
  const page = parseInt(params.get('page') || '1');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    api.get('/categories').then(r => { if (Array.isArray(r.data)) setCategories(r.data); }).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (category_id) query.set('category_id', category_id);
      if (sort) query.set('sort', sort);
      query.set('page', page);
      query.set('limit', 20);
      const { data } = await api.get(`/products?${query}`);
      let prods = Array.isArray(data.products) ? data.products : [];
      if (minPrice) prods = prods.filter(p => Number(p.price) >= Number(minPrice));
      if (maxPrice) prods = prods.filter(p => Number(p.price) <= Number(maxPrice));
      setProducts(prods);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {}
    setLoading(false);
  }, [search, category_id, sort, page, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function setParam(key, val) {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    setParams(next);
  }

  function handleSearch(e) {
    e.preventDefault();
    if (smartMode) {
      handleSmartSearch();
    } else {
      setParam('search', searchInput);
    }
  }

  async function handleSmartSearch() {
    if (!searchInput.trim()) return;
    setSmartLoading(true);
    setSmartResults(null);
    setSmartQuery(searchInput.trim());
    try {
      const { data } = await api.post('/search/smart', { query: searchInput.trim() });
      setSmartResults(Array.isArray(data) ? data : []);
    } catch {
      setSmartResults([]);
    }
    setSmartLoading(false);
  }

  function exitSmartMode() {
    setSmartMode(false);
    setSmartResults(null);
    setSmartQuery('');
  }

  function toggleCategory(id) {
    setParam('category_id', category_id === id ? '' : id);
  }

  const sortOptions = [
    { value: 'newest', label: 'Новинки' },
    { value: 'price_asc', label: 'Цена: по возрастанию' },
    { value: 'price_desc', label: 'Цена: по убыванию' },
  ];

  return (
    <div className="page-fade max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h1 className="font-heading text-3xl font-bold text-white">Каталог</h1>
        <span className="text-gray-500 text-sm">Найдено: {total} товаров</span>
        <button onClick={() => setSidebarOpen(v => !v)} className="md:hidden ml-auto btn-outline py-2 px-4 text-sm">
          Фильтры
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={`w-64 shrink-0 ${sidebarOpen ? 'block' : 'hidden'} md:block`}>
          <div className="bg-navy-700 rounded-xl p-5 border border-white/5 sticky top-24">
            <h3 className="font-heading font-semibold text-white mb-4">Категории</h3>
            <div className="space-y-2 mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio" name="cat" checked={!category_id}
                  onChange={() => setParam('category_id', '')}
                  className="accent-coral-500"
                />
                <span className="text-sm text-gray-300 group-hover:text-white">Все категории</span>
              </label>
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio" name="cat" checked={category_id === cat.id}
                    onChange={() => toggleCategory(cat.id)}
                    className="accent-coral-500"
                  />
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm text-gray-300 group-hover:text-white">{cat.name}</span>
                </label>
              ))}
            </div>

            <h3 className="font-heading font-semibold text-white mb-3">Цена (₽)</h3>
            <div className="flex gap-2 items-center">
              <input type="number" placeholder="От" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="input-dark text-sm py-2 px-3" />
              <span className="text-gray-500">—</span>
              <input type="number" placeholder="До" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="input-dark text-sm py-2 px-3" />
            </div>
            <button onClick={fetchProducts} className="btn-primary w-full justify-center mt-3 text-sm py-2">
              Применить
            </button>
            {(category_id || search || minPrice || maxPrice) && (
              <button
                onClick={() => { setParams({}); setMinPrice(''); setMaxPrice(''); setSearchInput(''); }}
                className="w-full text-xs text-gray-500 hover:text-white mt-2 transition-colors"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-3 mb-5 flex-wrap">
            <form onSubmit={handleSearch} className="flex-1 min-w-0 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  placeholder={smartMode ? 'Опишите что ищете: "подарок маме до 2000₽"...' : 'Поиск товаров...'}
                  className={`input-dark w-full text-sm ${smartMode ? 'border-violet-500/50 focus:border-violet-500' : ''}`}
                />
                {smartMode && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 text-xs font-medium pointer-events-none">ИИ</span>
                )}
              </div>
              <button type="submit" disabled={smartLoading} className={`py-2 px-4 text-sm rounded-lg font-medium transition-all ${smartMode ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'btn-primary'}`}>
                {smartLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Думаю...
                  </span>
                ) : 'Найти'}
              </button>
            </form>
            <button
              type="button"
              onClick={() => { setSmartMode(v => !v); setSmartResults(null); setSmartQuery(''); }}
              className={`py-2 px-4 text-sm rounded-lg font-medium border transition-all whitespace-nowrap ${smartMode ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'}`}
            >
              ✨ Умный поиск
            </button>
            {!smartMode && (
              <select
                value={sort}
                onChange={e => setParam('sort', e.target.value)}
                className="input-dark text-sm w-auto min-w-[160px]"
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
          </div>

          {/* Smart search results */}
          {smartMode && smartResults !== null && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 text-violet-400 text-sm font-medium">
                  <span className="text-base">✨</span>
                  Умный поиск: <span className="text-white">"{smartQuery}"</span>
                </div>
                <span className="text-gray-500 text-sm">— найдено {smartResults.length} товаров</span>
                <button onClick={exitSmartMode} className="ml-auto text-xs text-gray-500 hover:text-white transition-colors">✕ Обычный поиск</button>
              </div>
              {smartResults.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="text-4xl mb-3">🤔</div>
                  <p>ИИ не нашёл подходящих товаров</p>
                  <p className="text-sm mt-1">Попробуйте переформулировать запрос</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {smartResults.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          )}

          {smartMode && smartResults === null && !smartLoading && (
            <div className="mb-6 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl text-center">
              <p className="text-violet-300 text-sm">Опишите что ищете своими словами — ИИ подберёт подходящие товары</p>
              <p className="text-gray-500 text-xs mt-1">Например: "недорогой подарок для мамы", "спорт для зала", "что-то для кухни"</p>
            </div>
          )}

          {(smartMode && (smartResults !== null || smartLoading)) ? null : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg">Товары не найдены</p>
              <p className="text-sm mt-2">Попробуйте изменить фильтры</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setParam('page', page - 1)}
                    disabled={page <= 1}
                    className="px-4 py-2 bg-navy-700 rounded-lg text-sm disabled:opacity-40 hover:bg-navy-600 transition-colors"
                  >← Назад</button>
                  <span className="px-4 py-2 text-sm text-gray-400">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setParam('page', page + 1)}
                    disabled={page >= totalPages}
                    className="px-4 py-2 bg-navy-700 rounded-lg text-sm disabled:opacity-40 hover:bg-navy-600 transition-colors"
                  >Далее →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
