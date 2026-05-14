import { create } from 'zustand';
import api from '../api/axios';

const useCartStore = create((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/cart');
      set({ items: data });
    } catch {}
    set({ loading: false });
  },

  addItem: async (product_id, quantity = 1) => {
    await api.post('/cart', { product_id, quantity });
    await get().fetchCart();
  },

  updateQty: async (id, quantity) => {
    await api.put(`/cart/${id}`, { quantity });
    await get().fetchCart();
  },

  removeItem: async (id) => {
    await api.delete(`/cart/${id}`);
    set(state => ({ items: state.items.filter(i => i.id !== id) }));
  },

  clearCart: async () => {
    await api.delete('/cart');
    set({ items: [] });
  },
}));

export default useCartStore;
