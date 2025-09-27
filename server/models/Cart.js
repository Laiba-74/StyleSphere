const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // assuming you already have Product model
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String },
  size: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  discount: {type: Number},
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // each user has their own cart
    required: true,
  },
  items: [cartItemSchema],
});

module.exports = mongoose.model('Cart', cartSchema);
