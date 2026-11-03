/**
 * Hydration + goals API (NutriVibe 2.0 Phase 3)
 */
import axios from 'axios';

const API_BASE = '/api';

export const hydrationApi = {
  log: async (amountMl, source = 'quick') => {
    const res = await axios.post(`${API_BASE}/hydration/log`, { amountMl, source });
    return res.data;
  },
  getToday: async (date) => {
    const res = await axios.get(`${API_BASE}/hydration/today`, {
      params: date ? { date } : {},
    });
    return res.data;
  },
  getWeekly: async () => {
    const res = await axios.get(`${API_BASE}/hydration/weekly`);
    return res.data;
  },
  getGoals: async () => {
    const res = await axios.get(`${API_BASE}/hydration/goals`);
    return res.data;
  },
  updateGoals: async (payload) => {
    const res = await axios.put(`${API_BASE}/hydration/goals`, payload);
    return res.data;
  },
};

export const streakApi = {
  get: async () => {
    const res = await axios.get(`${API_BASE}/streaks`);
    return res.data;
  },
};
