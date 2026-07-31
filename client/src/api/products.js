import axios from 'axios';

const API_BASE = '/api';

export const productApi = {
  // Search products by barcode. Pass profileId to get a verdict
  // personalized to a dependent's profile instead of the account owner.
  searchByBarcode: async (barcode, profileId) => {
    const response = await axios.get(`${API_BASE}/products/barcode/${barcode}`, {
      params: profileId ? { profileId } : {}
    });
    return response.data;
  },

  // Get product details
  getProductDetails: async (productId) => {
    const response = await axios.get(`${API_BASE}/products/${productId}`);
    return response.data;
  },

  // Get product alternatives (personalized to whichever profile is active)
  getAlternatives: async (productId, profileId) => {
    const response = await axios.get(`${API_BASE}/products/${productId}/alternatives`, {
      params: profileId ? { profileId } : {}
    });
    return response.data;
  },

  // Get safety report
  getSafetyReport: async (productId) => {
    const response = await axios.get(`${API_BASE}/safety/product/${productId}`);
    return response.data;
  },

  // Log product consumption. Pass profileId to log this as being for
  // a dependent instead of the account owner.
  logProduct: async (productId, quantity = 1, profileId) => {
    const response = await axios.post(`${API_BASE}/tracking/log`, {
      productId,
      quantity,
      action: 'log',
      profileId
    });
    return response.data;
  },

  // Get daily tracking. profileId === null means "just the account
  // owner, no dependent" (as opposed to undefined, meaning "all profiles").
  getDailyTracking: async (date, profileId) => {
    const params = { date };
    if (profileId !== undefined) {
      params.profileId = profileId === null ? 'null' : profileId;
    }
    const response = await axios.get(`${API_BASE}/tracking/daily`, { params });
    return response.data;
  },

  // Get tracking history
  getTrackingHistory: async (params) => {
    const response = await axios.get(`${API_BASE}/tracking/history`, { params });
    return response.data;
  },

  // Clear tracking logs (optionally scoped to a single day)
  clearLogs: async (date) => {
    const response = await axios.delete(`${API_BASE}/tracking/clear`, {
      params: date ? { date } : {}
    });
    return response.data;
  },

  // Delete a single log entry
  deleteLog: async (logId) => {
    const response = await axios.delete(`${API_BASE}/tracking/${logId}`);
    return response.data;
  },

  // Create a product from OCR'd label text (no barcode needed)
  scanLabel: async (rawText, productName, profileId) => {
    const response = await axios.post(`${API_BASE}/products/scan-label`, {
      rawText,
      productName,
      profileId
    });
    return response.data;
  },

  // Get an AI-generated plain-English explanation of a product's
  // ingredients, personalized to the active profile
  explainProduct: async (productId, profileId) => {
    const response = await axios.get(`${API_BASE}/products/${productId}/explain`, {
      params: profileId ? { profileId } : {}
    });
    return response.data;
  },

  // Force-refresh a product's image from Open Food Facts
  refreshImage: async (productId) => {
    const response = await axios.post(`${API_BASE}/products/${productId}/refresh-image`);
    return response.data;
  }
};