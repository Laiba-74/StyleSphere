import React, { createContext, useContext, useState } from 'react';
import { addReview, deleteReview, getReviews, getReviewsWithStats, updateReview } from '../api/review';
const ReviewsContext = createContext(null);
import toast from "react-hot-toast";

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState({});
  const [stats, setStats] = useState({});

const fetchReviews = async (productId) => {
    try {
      const { data } = await getReviews(productId);
      console.log(data)
      setReviews((prev) => ({ ...prev, [productId]: data }));
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

const fetchReviewStats = async (productId) => {
    try {
      const { data } = await getReviewsWithStats(productId);
      // console.log(data)
      setStats((prev) => ({ ...prev, [productId]: data.stats }));
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleAddReview = async (productId, reviewData) => {
    try {
      const { data } = await addReview(productId, reviewData);
      setReviews((prev) => ({
        ...prev,
        [productId]: [...(prev[productId] || []), data],
      }));
      fetchReviewStats(productId);
      // toast.success("Review added successfully!");
    } catch (err) {
      console.error("Error adding review:", err);
      toast.error("Failed to add review.");
    }
  };

const handleUpdateReview = async (reviewId, updatedData, productId) => {
    try {
      const { data } = await updateReview(reviewId, updatedData);
      setReviews((prev) => ({
        ...prev,
        [productId]: (prev[productId] || []).map((r) =>
          r._id === reviewId ? data : r
        ),
      }));
      fetchReviewStats(productId);
      // toast.success("Review updated successfully!");
    } catch (err) {
      console.error("Error updating review:", err);
      toast.error("Failed to update review.");
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId, productId) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => ({
        ...prev,
        [productId]: (prev[productId] || []).filter((r) => r._id !== reviewId),
      }));
      fetchReviewStats(productId);
      toast.success("Review deleted successfully!");
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error("Failed to delete review.");
    }
  };

  const getProductReviews = (productId) => reviews[productId] || [];
  const getReviewStats = (productId) =>
    stats[productId] || {
      total: 0,
      average: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };


  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        stats,
        fetchReviews,
        fetchReviewStats,
        addReview: handleAddReview,
        updateReview: handleUpdateReview,
        deleteReview: handleDeleteReview,
        getProductReviews,
        getReviewStats,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};
