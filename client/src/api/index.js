import axios from 'axios';
import * as mock from '../data/mock.js';

/**
 * NutriVibe 2.0 API Client
 *
 * Maps directly to backend endpoints:
 *  - /api/products/barcode/:barcode
 *  - /api/products/scan-label
 *  - /api/meals/*
 *  - /api/hydration/*
 *  - /api/streaks
 *  - /api/diet-planner/*
 *  - /api/ai/chat
 *  - /api/me/*
 *  - /api/dependents/*
 */
const baseURL = import.meta.env.VITE_API_URL || '';
export const http = axios.create({ baseURL, withCredentials: true });

// Attach JWT stored in localStorage
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('nutrivibe_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const live = Boolean(baseURL);

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const api = {
  // Scanner & Products
  scanBarcode: (barcode, profileId) => {
    if (!live) {
      const match = mock.products.find((p) => p.barcode === barcode) || mock.products[0];
      return Promise.resolve({ success: true, data: match });
    }
    const params = profileId ? { profileId } : {};
    return http.get(`/products/barcode/${encodeURIComponent(barcode)}`, { params }).then((r) => r.data);
  },

  scanLabel: async (fileOrBase64, profileId) => {
    if (!live) return Promise.resolve({ success: true, data: mock.products[0] });
    let image = fileOrBase64;
    if (typeof window !== 'undefined' && (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob)) {
      image = await fileToBase64(fileOrBase64);
    }
    return http.post('/products/scan-label', { image, profileId }).then((r) => r.data);
  },

  searchProducts: (query) =>
    live ? http.get('/products/search', { params: { q: query } }).then((r) => r.data) : Promise.resolve({ success: true, data: mock.products }),

  getProduct: (id) =>
    live ? http.get(`/products/${id}`).then((r) => r.data) : Promise.resolve({ success: true, data: mock.products[0] }),

  // Meals and nutrition
  getTodayMeals: (date) =>
    live ? http.get('/meals/today', { params: date ? { date } : {} }).then((r) => r.data) : Promise.resolve({ success: true, data: mock.todayMeals }),
  createMeal: (mealData) =>
    live ? http.post('/meals', mealData).then((r) => r.data) : Promise.resolve({ success: true, data: mealData }),
  updateMeal: (id, mealData) =>
    live ? http.put(`/meals/${id}`, mealData).then((r) => r.data) : Promise.resolve({ success: true }),
  deleteMeal: (id) =>
    live ? http.delete(`/meals/${id}`).then((r) => r.data) : Promise.resolve({ success: true }),

  // Hydration
  logWater: (amountMl) =>
    live ? http.post('/hydration/log', { amountMl, amount: amountMl }).then((r) => r.data) : Promise.resolve({ success: true, todayTotalMl: amountMl }),
  getTodayHydration: () =>
    live ? http.get('/hydration/today').then((r) => r.data) : Promise.resolve({ success: true, data: { totalMl: 1250, goalMl: 2500 } }),
  getHydrationWeekly: () =>
    live ? http.get('/hydration/weekly').then((r) => r.data) : Promise.resolve({ success: true, data: mock.hydrationWeek }),

  // Streaks
  getStreaks: () =>
    live ? http.get('/streaks').then((r) => r.data) : Promise.resolve({ success: true, data: mock.streaks }),

  // VibeDiet
  generatePlan: (preferences) =>
    live ? http.post('/diet-planner/generate', preferences).then((r) => r.data) : Promise.resolve({ success: true, data: {} }),
  swapMeal: (planId, payload) =>
    live ? http.post(`/diet-planner/${planId}/swap-meal`, payload).then((r) => r.data) : Promise.resolve({ success: true }),
  createGroceryList: (planId) =>
    live ? http.post(`/diet-planner/${planId}/grocery-list`).then((r) => r.data) : Promise.resolve({ success: true, items: [] }),

  // VibeAI
  chat: (message) =>
    live ? http.post('/ai/chat', { message }).then((r) => r.data) : Promise.resolve({ reply: 'NutriVibe AI assistant offline demo mode.' }),

  // Dependents
  getDependents: () =>
    live ? http.get('/dependents').then((r) => r.data) : Promise.resolve({ success: true, data: [] }),
  createDependent: (data) =>
    live ? http.post('/dependents', data).then((r) => r.data) : Promise.resolve({ success: true, data }),
  updateDependent: (id, data) =>
    live ? http.put(`/dependents/${id}`, data).then((r) => r.data) : Promise.resolve({ success: true }),
  deleteDependent: (id) =>
    live ? http.delete(`/dependents/${id}`).then((r) => r.data) : Promise.resolve({ success: true }),

  // Account GDPR / Privacy
  exportData: () =>
    live ? http.get('/me/export').then((r) => r.data) : Promise.resolve({ success: true, data: {} }),
  deleteAccount: (password) =>
    live ? http.delete('/me', { data: { password } }).then((r) => r.data) : Promise.resolve({ success: true }),

  // Health
  checkHealth: () =>
    live ? http.get('/health').then((r) => r.data) : Promise.resolve({ status: 'ok' }),
  checkReady: () =>
    live ? http.get('/ready').then((r) => r.data) : Promise.resolve({ status: 'ready' }),
};
