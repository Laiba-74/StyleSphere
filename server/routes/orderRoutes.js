const express = require("express");
const router = express.Router();
const { createOrder, getOrderById, getUserOrders, getAllOrders, updateOrderStatus, deleteOrder, getOrderCount, getRevenue, getRecentOrders, getAllProductSales } = require("../controllers/orderController");
const { auth, authorizeRoles} = require("../middleware/authMiddleware");

// Admin only: Get all orders
router.get("/all", auth, authorizeRoles("admin"),  getAllOrders);

router.delete("/:id", auth, authorizeRoles("admin"), deleteOrder);

// Admin only: Update order status
router.put("/:id/status", auth, authorizeRoles("admin"), updateOrderStatus);

// Create new order
router.post("/", auth, createOrder);
router.get("/recent",auth, authorizeRoles("admin"), getRecentOrders);
router.get("/count", getOrderCount)
router.get("/revenue", getRevenue)
router.get("/top-products", getAllProductSales)
router.get("/:id", auth, getOrderById);

// Get all orders of logged-in user
router.get("/", auth, getUserOrders);

module.exports = router;
