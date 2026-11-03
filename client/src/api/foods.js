/**
 * Verified food database API
 */
import axios from 'axios';

const API_BASE = '/api';

export const foodApi = {
  search: async (q = '', limit = 20) => {
    const res = await axios.get(`${API_BASE}/foods`, {
      params: { q, limit },
    });
    return res.data;
  },
  getById: async (id) => {
    const res = await axios.get(`${API_BASE}/foods/${id}`);
    return res.data;
  },
  seed: async () => {
    const res = await axios.post(`${API_BASE}/foods/seed`);
    return res.data;
  },
};
