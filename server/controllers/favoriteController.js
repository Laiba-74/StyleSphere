const Favorite = require("../models/Favorite");
const Product = require("../models/Product");

// Add product to favorites
exports.addToFavorites = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId; // from auth middleware (decoded token)

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Add to favorites (if not already)
    const favorite = await Favorite.findOneAndUpdate(
      { user: userId, product: productId },
      { user: userId, product: productId },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Added to favorites", favorite });
  } catch (error) {
    console.error("Add to favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove from favorites
exports.removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    await Favorite.findOneAndDelete({ user: userId, product: productId });

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all favorites of user
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;

    const favorites = await Favorite.find({ user: userId }).populate("product");

    res.json({ favorites });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
