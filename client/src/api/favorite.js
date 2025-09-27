import api from "./api"; // your axios instance

// Add to favorites
export const addFavorite = (productId) =>
  api.post("/favorites/add", { productId });

// Remove from favorites
export const removeFavorite = (productId) =>
  api.delete(`/favorites/${productId}`);

// Get all favorites
export const getFavorites = () =>
  api.get("/favorites");
