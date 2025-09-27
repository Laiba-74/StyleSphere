const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");

// Get cart for logged in user
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.json({ items: [] });
    res.json({items: cart.items});
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add item to cart
const addItem = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) cart = new Cart({ user: req.user.userId, items: [] });

    // check if item already exists (same product + size)
    const existingItem = cart.items.find(
      (i) => i.product.toString() === productId && i.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        size,
        price: product.price,
        quantity,
        discount: product.discount,
      });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update item quantity
const updateQuantity = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === productId && i.size === size
    );
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity = quantity <= 0 ? 1 : quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Remove item from cart
const removeItem = async (req, res) => {
  try {
    const { productId, size } = req.body;
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => !(i.product.toString() === productId && i.size === size)
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getCart, addItem, updateQuantity, removeItem, clearCart}