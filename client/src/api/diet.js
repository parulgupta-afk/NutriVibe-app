import axios from 'axios';

const API_BASE = '/api';

export const dietApi = {
  generate: async (payload) => {
    const res = await axios.post(`${API_BASE}/diet-planner/generate`, payload);
    return res.data;
  },
  getCurrent: async () => {
    const res = await axios.get(`${API_BASE}/diet-planner/current`);
    return res.data;
  },
  getHistory: async () => {
    const res = await axios.get(`${API_BASE}/diet-planner/history`);
    return res.data;
  },

  regenerateMeal: async (id, payload) => {
    const res = await axios.post(`${API_BASE}/diet-planner/${id}/regenerate-meal`, payload);
    return res.data;
  },
  groceryList: async (id) => {
    const res = await axios.post(`${API_BASE}/diet-planner/${id}/grocery-list`);
    return res.data;
  },
};
