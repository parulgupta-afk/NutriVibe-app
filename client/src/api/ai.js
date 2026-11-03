import axios from 'axios';
const API_BASE = '/api';

export const aiApi = {
  chat: async (message, history = []) => {
    const res = await axios.post(`${API_BASE}/ai/chat`, { message, history });
    return res.data;
  },
  suggestFromText: async (text) => {
    const res = await axios.post(`${API_BASE}/ai/meals/suggest-text`, { text });
    return res.data;
  },
  confirmMeal: async (payload) => {
    const res = await axios.post(`${API_BASE}/ai/meals/confirm`, payload);
    return res.data;
  },
};
