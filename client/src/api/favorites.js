import axios from 'axios';

const API_BASE = '/api';

export const favoritesApi = {
  list: async () => {
    const response = await axios.get(`${API_BASE}/favorites`);
    return response.data;
  },

  add: async (productId) => {
    const response = await axios.post(`${API_BASE}/favorites/${productId}`);
    return response.data;
  },

  remove: async (productId) => {
    const response = await axios.delete(`${API_BASE}/favorites/${productId}`);
    return response.data;
  }
};
