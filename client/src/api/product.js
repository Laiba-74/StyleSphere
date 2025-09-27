import api from "./api";

// Add Product (Admin only)
export const addProduct = (formData) =>
  api.post("/products/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Get all products
export const getProducts = () => api.get("/products");

export const getCategoryCounts= () => api.get("/products/categories/count");

// Get product by ID
export const getProductById = (id) => api.get(`/products/${id}`);

// Update Product (Admin only)
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Delete Product (Admin only)
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getRelatedProducts = (id) => api.get(`/products/${id}/related`)

// Get Product Count
export const getProductCount = () => api.get("/products/count");

export const getFiveStarProduct = () => api.get("/products/five-star")