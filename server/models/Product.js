const mongoose = require("mongoose");
// Product Schema
const productSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["Outerwear", "Top", "Bottom", "Footwear", "Accessory"],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number, // Percentage discount
      default: 0,
    },
    sizes: {
      type: [String],
      default: [],
    },
    description: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    status: {
      type: String,
      enum: ["Active", "Low stock", "Out of stock"],
      default: "Active",
    },
    sku: { type: String, unique: true },
    tags: { type: [String], default: [] },
    stock: { type: Number, default: 0 },
    specifications: {
      material: { type: String, default: "" },
      care: { type: String, default: "" },
      origin: { type: String, default: "" },
      fit: { type: String, default: "" },
    },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
); // Virtual field for final price after discount
productSchema.virtual("finalPrice").get(function () {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount) / 100;
  }
  return this.price;
}); // Pre-save hook to generate SKU if not exists 
productSchema.pre("save", async function (next) {
  try {
    if (!this.sku && this.name) {
      // Create initials from product name
      const initials = this.name
        .split(" ")
        .map((word) => word[0]?.toUpperCase() || "")
        .join("");

      // Count existing products with same initials
      const count = await this.constructor.countDocuments({
        sku: new RegExp(`^${initials}`)
      });

      // Generate SKU
      const number = String(count + 1).padStart(3, "0");
      this.sku = `${initials}-${number}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Product", productSchema);
