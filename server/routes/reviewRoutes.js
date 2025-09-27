const express = require("express");
const {
  getProductReviews,
  addReview,
  getProductReviewsWithStats,
  deleteReview, 
  updateReview
}  = require("../controllers/reviewController.js");
const {auth, authorizeRoles } = require("../middleware/authMiddleware"); // Your JWT auth middleware

const router = express.Router();

router.get("/:productId/stats", getProductReviewsWithStats);
router.get("/:productId", getProductReviews);
router.post("/:productId", auth, addReview);
router.put("/:reviewId", auth, updateReview);
router.delete("/:id", auth, deleteReview);

module.exports = router;
