import api from "./api";

// Create new order
export const createOrder = (orderData) =>
  api.post("/orders", orderData);

// Get all orders for logged-in user
export const getUserOrders = () =>
  api.get("/orders");

// Get a specific order by ID
export const getOrderById = (id) =>
  api.get(`/orders/${id}`);

// Admin: Get all orders
export const getAllOrders = () =>
  api.get("/orders/all");

// Admin: Update order status
export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status });

// Admin: Delete order
export const deleteOrder = (id) =>
  api.delete(`/orders/${id}`);

// Order stats
export const getOrderCount = () =>
  api.get("/orders/count");

export const getRevenue = () =>
  api.get("/orders/revenue");

export const getRecentOrders = () =>
  api.get("/orders/recent");

export const getAllProductSales = () =>{
  return api.get("/orders/top-products");
}