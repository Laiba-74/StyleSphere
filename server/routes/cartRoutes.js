const express = require("express");
const {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
}  = require("../controllers/cartController.js");
const { auth } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/", auth, getCart);
router.post("/add", auth, addItem);
router.put("/update", auth, updateQuantity);
router.delete("/remove", auth, removeItem);
router.delete("/clear", auth, clearCart);

module.exports = router;
