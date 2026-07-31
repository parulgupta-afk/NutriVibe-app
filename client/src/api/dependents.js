import axios from 'axios';

const API_BASE = '/api';

export const dependentApi = {
  // Get all dependent profiles for the logged-in user
  getDependents: async () => {
    const response = await axios.get(`${API_BASE}/dependents`);
    return response.data;
  },

  // Create a new dependent profile
  createDependent: async (profileData) => {
    const response = await axios.post(`${API_BASE}/dependents`, profileData);
    return response.data;
  },

  // Update an existing dependent profile
  updateDependent: async (id, profileData) => {
    const response = await axios.put(`${API_BASE}/dependents/${id}`, profileData);
    return response.data;
  },

  // Delete a dependent profile
  deleteDependent: async (id) => {
    const response = await axios.delete(`${API_BASE}/dependents/${id}`);
    return response.data;
  }
};