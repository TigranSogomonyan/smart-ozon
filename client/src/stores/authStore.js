import { create } from 'zustand';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  loading: true,

  setAccessToken: (token) => set({ accessToken: token }),

  login: async (email, password) => {
    const { data } = await axios.post(`${BASE}/api/auth/login`, { email, password }, { withCredentials: true });
    set({ user: data.user, accessToken: data.accessToken });
    return data;
  },

  register: async (formData) => {
    const { data } = await axios.post(`${BASE}/api/auth/register`, formData, { withCredentials: true });
    set({ user: data.user, accessToken: data.accessToken });
    return data;
  },

  logout: async () => {
    try {
      await axios.post(`${BASE}/api/auth/logout`, {}, { withCredentials: true });
    } catch {}
    set({ user: null, accessToken: null });
  },

  fetchMe: async () => {
    try {
      const { data: refreshData } = await axios.post(`${BASE}/api/auth/refresh`, {}, { withCredentials: true });
      set({ accessToken: refreshData.accessToken });
      const { data: user } = await axios.get(`${BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${refreshData.accessToken}` },
        withCredentials: true,
      });
      set({ user, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateUser: (updates) => set(state => ({ user: state.user ? { ...state.user, ...updates } : null })),
}));

export default useAuthStore;
