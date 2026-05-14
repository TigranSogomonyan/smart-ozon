import { create } from 'zustand';
import api from '../api/axios';

const useFavoritesStore = create((set, get) => ({
  items: [],

  fetchFavorites: async () => {
    try {
      const { data } = await api.get('/favorites');
      set({ items: data });
    } catch {}
  },

  toggle: async (product_id) => {
    const exists = get().items.find(f => f.product_id === product_id);
    if (exists) {
      await api.delete(`/favorites/${product_id}`);
      set(state => ({ items: state.items.filter(f => f.product_id !== product_id) }));
    } else {
      const { data } = await api.post('/favorites', { product_id });
      set(state => ({ items: [...state.items, data] }));
    }
  },

  isFavorite: (product_id) => get().items.some(f => f.product_id === product_id),
}));

export default useFavoritesStore;
