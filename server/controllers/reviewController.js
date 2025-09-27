// controllers/reviewController.js
const Product = require("../models/Product.js"); // Optional: if you want to verify product existence
const Review = require('../models/Review.js');
const User = require('../models/User.js');
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment, verified } = req.body;
    const userId = req.user.userId; // Assuming auth middleware
    const user = await User.findById(userId).select("name");

    // Optional: prevent duplicate review by same user
    const alreadyReviewed = await Review.findOne({ product: productId, user: userId });
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const review = new Review({
      product: productId,
      user: userId,
      userName: user?.name || 'Anonymous',
      rating,
      comment,
      verified
    });

    const savedReview = await review.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductReviewsWithStats = async (req, res) => {
  try {
    const { productId } = req.params;

    // Fetch reviews
    const reviews = await Review.find({ product: productId })
      .populate("user", "name userId avatar")
      .sort({ createdAt: -1 });

    // Calculate stats
    const total = reviews.length;
    const average =
      total > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
        : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    res.json({
      reviews,
      stats: {
        average: Number(average.toFixed(1)),
        total,
        distribution
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this review" });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    const updatedReview = await review.save();
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  console.log("Delete request params:", req.params); // { id: '689f78592672c639f8ad7fb6' }
  console.log("Logged-in user:", req.user.userId);

  try {
    const review = await Review.findOne({
      _id: req.params.id, 
      user: req.user.userId
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = { getProductReviews, addReview, getProductReviewsWithStats, deleteReview, updateReview }