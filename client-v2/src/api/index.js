import axios from 'axios';
import * as mock from '../data/mock.js';

/**
 * API layer. Each function maps to an endpoint from the NutriVibe 2.0 plan.
 * While VITE_API_URL is empty the UI runs on mock data. When your Express
 * backend is ready, set VITE_API_URL in .env and the calls below go live.
 *
 *   VITE_API_URL=/api
 *   # or VITE_API_URL=http://localhost:5000/api
 */
const baseURL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';
export const http = axios.create({ baseURL, withCredentials: true });

// Attach the JWT stored after login (supports both storage keys for interoperability).
http.interceptors.request.use((config) => {
  const token =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('token') || localStorage.getItem('nutrivibe_token')
      : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const live = Boolean(baseURL);

export const api = {
  // Scanner (maps to existing backend /products/barcode/:barcode or fallback)
  scanBarcode: (barcode, profileId) =>
    live
      ? http
          .get(`/products/barcode/${barcode}`, { params: profileId ? { profileId } : {} })
          .then((r) => r.data)
      : Promise.resolve(mock.products[0]),

  scanLabel: (fileOrText, profileId) => {
    if (!live) return Promise.resolve(mock.products[0]);
    if (typeof fileOrText === 'string') {
      return http.post('/products/scan-label', { text: fileOrText, profileId }).then((r) => r.data);
    }
    const form = new FormData();
    form.append('image', fileOrText);
    if (profileId) form.append('profileId', profileId);
    return http.post('/products/scan-label', form).then((r) => r.data);
  },

  // Meals and nutrition
  getTodayMeals: () => (live ? http.get('/meals/today').then((r) => r.data) : Promise.resolve(mock.todayMeals)),
  getDailyNutrition: (date) =>
    live
      ? http
          .get('/tracking/daily', { params: { date } })
          .then((r) => r.data)
          .catch(() => mock.nutrition)
      : Promise.resolve(mock.nutrition),

  // Hydration
  logWater: (amountMl) => (live ? http.post('/hydration/log', { amount: amountMl }).then((r) => r.data) : Promise.resolve({})),
  getHydrationWeekly: () => (live ? http.get('/hydration/weekly').then((r) => r.data) : Promise.resolve(mock.hydrationWeek)),

  // Streaks
  getStreaks: () => (live ? http.get('/streaks').then((r) => r.data) : Promise.resolve(mock.streaks)),

  // VibeDiet
  generatePlan: (preferences) => http.post('/diet-planner/generate', preferences).then((r) => r.data),
  swapMeal: (planId, payload) => http.post(`/diet-planner/${planId}/swap-meal`, payload).then((r) => r.data),
  createGroceryList: (planId) => http.post(`/diet-planner/${planId}/grocery-list`).then((r) => r.data),

  // VibeAI
  chat: (message) => http.post('/ai/chat', { message }).then((r) => r.data),
};
