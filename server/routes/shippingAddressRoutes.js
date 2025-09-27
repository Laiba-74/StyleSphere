const express = require("express");
const router = express.Router();
const { createShippingAddress, getUserShippingAddresses, updateShippingAddress, deleteShippingAddress } = require("../controllers/shippingController");
const { auth } = require("../middleware/authMiddleware");

// Create shipping address
router.post("/", auth, createShippingAddress);

// Get all addresses for user
router.get("/", auth, getUserShippingAddresses);

router.put("/:id", auth, updateShippingAddress);
router.delete("/:id", auth, deleteShippingAddress);

module.exports = router;
