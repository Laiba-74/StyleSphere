
import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { deleteReview, getReviewsWithStats } from '../api/review';

const baseURL = import.meta.env.VITE_API_URL;

const ReviewsSection = ({ productId }) => {
  const { user, authorizationtoken } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, total: 0, distribution: { 1:0,2:0,3:0,4:0,5:0 }});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await getReviewsWithStats(productId);
      setReviews(data.reviews || []);
    setStats(data.stats || { 
      average: 0, 
      total: 0, 
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
    });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  // 🔹 Delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview(reviewId);
      fetchReviews(); // refresh list
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
    }
  };

  const handleEditReview = (review) => {
  setEditingReview(review);
  setShowReviewForm(true);
};

const handleCancelEdit = () => {
  setEditingReview(null);
  setShowReviewForm(false);
};

  return (
    <div className="mt-12">
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

        {loading && <p>Loading reviews...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {/* Review Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stats.total > 0 ? stats.average.toFixed(1) : '0.0'}
                  </div>
                  <StarRating rating={stats.average || 0} readonly size="large" />
                  <p className="text-gray-600 mt-2">
                    Based on {stats.total || 0} reviews
                  </p>
                </div>

                <div className="space-y-2">
                  {[5,4,3,2,1].map(rating => (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-sm font-medium w-8">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: stats.total > 0 
                              ? `${((stats.distribution[rating]||0)/stats.total)*100}%` 
                              : '0%'
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{stats.distribution[rating]||0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Write/Edit Review */}
            <div className="mb-8">
              <button
                onClick={() => {
                  setShowReviewForm(!showReviewForm);
                  setEditingReview(null);
                }}
                className="bg-[#1c9199] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showReviewForm ? 'Cancel Review' : 'Write a Review'}
              </button>
            </div>

          {showReviewForm && (
  <ReviewForm
    productId={productId}
    existingReview={editingReview}
    onReviewSaved={() => {
      fetchReviews();
      setEditingReview(null);
      setShowReviewForm(false);
    }}
    onCancel={handleCancelEdit}
  />
)}


<ReviewsList
  reviews={reviews}
  onEdit={handleEditReview}
  onDelete={handleDeleteReview}
/>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
