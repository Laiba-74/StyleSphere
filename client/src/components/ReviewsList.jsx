import React from 'react';
import { CheckCircle, User, Pen, Trash2 } from 'lucide-react';
import StarRating from './StarRating';
import { useAuth } from "../context/AuthContext";
const baseURL = import.meta.env.VITE_SERVER;
const ReviewsList = ({ reviews, onEdit, onDelete }) => {
  const { user } = useAuth();

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => {
        const reviewUserId =
          typeof review.user === "object" ? review.user._id : review.user;

        return (
          <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex items-start justify-between">
              <div className="flex space-x-4">
              <div className="flex-shrink-0">
   {review.user?.avatar ? (
    <img
      src={`${baseURL}/${review.user.avatar.replace(/\\/g, "/")}`}
      alt={review.user.name || "User"}
      className="w-10 h-10 rounded-full object-cover"
    />
  ) : (
    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
      <User className="h-5 w-5 text-gray-600" />
    </div>
  )}
</div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">
                      {review.user?.name || "Anonymous"}
                    </h4>
                    {review.verified && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">Verified Purchase</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 mb-2">
                    <StarRating rating={review.rating || 0} readonly size="small" />
                    <span className="text-sm text-gray-500">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    {review.comment || "No comment provided."}
                  </p>
                </div>
              </div>

              {user && String(reviewUserId) === String(user.userId) && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEdit(review)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    title="Edit Review"
                  >
                    <Pen size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(review._id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewsList;
