import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './stores/authStore';
import useCartStore from './stores/cartStore';
import useFavoritesStore from './stores/favoritesStore';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import SellerRoute from './components/SellerRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductPage from './pages/ProductPage';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Account from './pages/Account';
import MyShop from './pages/MyShop';
import ProductForm from './pages/ProductForm';
import ShopPage from './pages/ShopPage';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import BecomeSeller from './pages/BecomeSeller';

export default function App() {
  const { fetchMe, user, loading } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchFavorites } = useFavoritesStore();

  useEffect(() => { fetchMe(); }, []);

  useEffect(() => {
    if (user && !loading) {
      fetchCart();
      fetchFavorites();
    }
  }, [user?.id, loading]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/catalog" element={<Layout><Catalog /></Layout>} />
        <Route path="/products/:id" element={<Layout><ProductPage /></Layout>} />
        <Route path="/shops/:id" element={<Layout><ShopPage /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/become-seller" element={<Layout><BecomeSeller /></Layout>} />
        <Route path="/cart" element={<Layout><PrivateRoute><Cart /></PrivateRoute></Layout>} />
        <Route path="/favorites" element={<Layout><PrivateRoute><Favorites /></PrivateRoute></Layout>} />
        <Route path="/orders" element={<Layout><PrivateRoute><Orders /></PrivateRoute></Layout>} />
        <Route path="/orders/:id" element={<Layout><PrivateRoute><OrderDetail /></PrivateRoute></Layout>} />
        <Route path="/account" element={<Layout><PrivateRoute><Account /></PrivateRoute></Layout>} />
        <Route path="/my-shop" element={<Layout><SellerRoute><MyShop /></SellerRoute></Layout>} />
        <Route path="/my-shop/products/new" element={<Layout><SellerRoute><ProductForm /></SellerRoute></Layout>} />
        <Route path="/my-shop/products/:id/edit" element={<Layout><SellerRoute><ProductForm /></SellerRoute></Layout>} />
        <Route path="/admin" element={<Layout><AdminRoute><Admin /></AdminRoute></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
