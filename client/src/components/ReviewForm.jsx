import React, {useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { useReviews } from "../context/ReviewsContext";
import StarRating from "./StarRating";
import toast from "react-hot-toast";

const ReviewForm = ({ productId, existingReview, onReviewSaved, onCancel }) => {
  const { user } = useAuth();
  const { addReview, updateReview } = useReviews();
  
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 0);
  const [comment, setComment] = useState(existingReview ? existingReview.comment : "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login first");
    }
    if (rating === 0) {
      toast.error("Please select a rating");
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        // 📝 Update
        await updateReview(existingReview._id, { rating, comment }, productId);
        toast.success("Review updated successfully!");
      } else {
        // ➕ Add
        await addReview(productId, { rating, comment, verified: true });
        toast.success("Review added successfully!");
      }

      setRating(0);
      setComment("");

      if (onReviewSaved) onReviewSaved();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">
        {existingReview ? "Edit Your Review" : "Write a Review"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <StarRating rating={rating} onRatingChange={setRating} size="large" />

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Share your experience..."
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#1c9199] text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {isSubmitting
              ? "Submitting..."
              : existingReview
              ? "Update Review"
              : "Submit Review"}
          </button>

          {existingReview && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;