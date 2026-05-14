import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';

function getHeaders() {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const useFavoritesStore = create((set, get) => ({
  items: [],

  fetchFavorites: async () => {
    try {
      const { data } = await axios.get('/api/favorites', { headers: getHeaders(), withCredentials: true });
      set({ items: data });
    } catch {}
  },

  toggle: async (product_id) => {
    const exists = get().items.find(f => f.product_id === product_id);
    if (exists) {
      await axios.delete(`/api/favorites/${product_id}`, { headers: getHeaders(), withCredentials: true });
      set(state => ({ items: state.items.filter(f => f.product_id !== product_id) }));
    } else {
      const { data } = await axios.post('/api/favorites', { product_id }, { headers: getHeaders(), withCredentials: true });
      set(state => ({ items: [...state.items, data] }));
    }
  },

  isFavorite: (product_id) => get().items.some(f => f.product_id === product_id),
}));

export default useFavoritesStore;
