import api from "./api";

// Get all reviews for a product
export const getSettings = () => api.get(`/settings`);

export const updateSettings = (settingsData) =>
  api.put(`/settings`, settingsData);