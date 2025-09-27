import api from "./api";

// Create a new shipping address
export const createShippingAddress = (addressData) =>
  api.post("/shipping", addressData);

// Get all shipping addresses of logged-in user
export const getUserShippingAddresses = () =>
  api.get("/shipping");

export const updateShipping = (id, shippingData) => 
  api.put(`/shipping/${id}`, shippingData);

export const deleteShipping = (id) => 
  api.delete(`/shipping/${id}`);