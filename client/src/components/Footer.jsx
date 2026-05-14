import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <Link to="/" className="font-heading text-xl font-bold text-white">
            Smart<span className="text-coral-500">Ozon</span>
          </Link>
          <p className="text-sm text-gray-500 mt-1">Умный маркетплейс для умных покупок</p>
        </div>
        <div className="flex gap-6 text-sm text-gray-500">
          <Link to="/catalog" className="hover:text-white transition-colors">Каталог</Link>
          <Link to="/orders" className="hover:text-white transition-colors">Заказы</Link>
          <Link to="/account" className="hover:text-white transition-colors">Аккаунт</Link>
        </div>
        <p className="text-xs text-gray-600">© {new Date().getFullYear()} Smart Ozon. Дипломный проект.</p>
      </div>
    </footer>
  );
}
