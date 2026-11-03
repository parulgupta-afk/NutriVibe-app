/**
 * Meal tracking API helpers (NutriVibe 2.0 Phase 2)
 */
import axios from 'axios';

const API_BASE = '/api';

export const mealApi = {
  create: async (payload) => {
    const res = await axios.post(`${API_BASE}/meals`, payload);
    return res.data;
  },
  getToday: async (date) => {
    const res = await axios.get(`${API_BASE}/meals/today`, {
      params: date ? { date } : {},
    });
    return res.data;
  },
  getHistory: async (limit = 30) => {
    const res = await axios.get(`${API_BASE}/meals/history`, {
      params: { limit },
    });
    return res.data;
  },
  update: async (id, payload) => {
    const res = await axios.put(`${API_BASE}/meals/${id}`, payload);
    return res.data;
  },
  remove: async (id) => {
    const res = await axios.delete(`${API_BASE}/meals/${id}`);
    return res.data;
  },
};
