import api from "./api";

export const getCart = () => api.get("/cart");

// Add item to cart
export const addToCart = (productId, size, quantity) =>
  api.post("/cart/add", { productId, size, quantity });

// Update item quantity
export const updateCartQuantity = (productId, size, quantity) =>
  api.put("/cart/update", { productId, size, quantity });

// Remove item
export const removeFromCart = (productId, size) =>
  api.delete("/cart/remove", { data: { productId, size } });

// Clear cart
export const clearCartApi = () => api.delete("/cart/clear");