import api from "./api";

// Get all reviews for a product
export const getReviews = (productId) => api.get(`/reviews/${productId}`);

// Get reviews + stats
export const getReviewsWithStats = (productId) => api.get(`/reviews/${productId}/stats`);

// Add a new review
export const addReview = (productId, reviewData) => api.post(`/reviews/${productId}`, reviewData);

// Update an existing review
export const updateReview = (reviewId, updatedData) => api.put(`/reviews/${reviewId}`, updatedData);

// Delete a review
export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);
