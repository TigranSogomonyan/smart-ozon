import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';

function getHeaders() {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const useCartStore = create((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await axios.get('/api/cart', { headers: getHeaders(), withCredentials: true });
      set({ items: data });
    } catch {}
    set({ loading: false });
  },

  addItem: async (product_id, quantity = 1) => {
    await axios.post('/api/cart', { product_id, quantity }, { headers: getHeaders(), withCredentials: true });
    await get().fetchCart();
  },

  updateQty: async (id, quantity) => {
    await axios.put(`/api/cart/${id}`, { quantity }, { headers: getHeaders(), withCredentials: true });
    await get().fetchCart();
  },

  removeItem: async (id) => {
    await axios.delete(`/api/cart/${id}`, { headers: getHeaders(), withCredentials: true });
    set(state => ({ items: state.items.filter(i => i.id !== id) }));
  },

  clearCart: async () => {
    await axios.delete('/api/cart', { headers: getHeaders(), withCredentials: true });
    set({ items: [] });
  },

}));

export default useCartStore;
