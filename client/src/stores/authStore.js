import { create } from 'zustand';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';

function loadUser() {
  try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; }
}
function saveUser(user) {
  try { localStorage.setItem('auth_user', JSON.stringify(user)); } catch {}
}
function clearUser() {
  try { localStorage.removeItem('auth_user'); localStorage.removeItem('auth_refresh'); } catch {}
}
function loadRefresh() {
  try { return localStorage.getItem('auth_refresh') || null; } catch { return null; }
}
function saveRefresh(token) {
  try { if (token) localStorage.setItem('auth_refresh', token); } catch {}
}

const stored = loadUser();

const useAuthStore = create((set) => ({
  user: stored,
  accessToken: null,
  loading: true,

  setAccessToken: (token) => set({ accessToken: token }),

  login: async (email, password) => {
    const { data } = await axios.post(`${BASE}/api/auth/login`, { email, password }, { withCredentials: true });
    saveUser(data.user);
    saveRefresh(data.refreshToken);
    set({ user: data.user, accessToken: data.accessToken });
    return data;
  },

  register: async (formData) => {
    const { data } = await axios.post(`${BASE}/api/auth/register`, formData, { withCredentials: true });
    saveUser(data.user);
    saveRefresh(data.refreshToken);
    set({ user: data.user, accessToken: data.accessToken });
    return data;
  },

  logout: async () => {
    try {
      await axios.post(`${BASE}/api/auth/logout`, {}, { withCredentials: true });
    } catch {}
    clearUser();
    set({ user: null, accessToken: null });
  },

  fetchMe: async () => {
    try {
      const storedRefresh = loadRefresh();
      const { data: refreshData } = await axios.post(
        `${BASE}/api/auth/refresh`,
        storedRefresh ? { refreshToken: storedRefresh } : {},
        { withCredentials: true }
      );
      if (!refreshData?.accessToken) throw new Error('no token');
      saveRefresh(refreshData.refreshToken);
      set({ accessToken: refreshData.accessToken });
      const { data: user } = await axios.get(`${BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${refreshData.accessToken}` },
        withCredentials: true,
      });
      if (!user?.id) throw new Error('no user');
      saveUser(user);
      set({ user, loading: false });
    } catch (err) {
      if (err?.response?.status === 401) {
        clearUser();
        set({ user: null, loading: false });
      } else {
        set({ loading: false });
      }
    }
  },

  updateUser: (updates) => set(state => {
    const updated = state.user ? { ...state.user, ...updates } : null;
    if (updated) saveUser(updated);
    return { user: updated };
  }),
}));

export default useAuthStore;
