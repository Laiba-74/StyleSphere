const express = require("express");
const router = express.Router();
const { createOrderAndPayment } = require("../controllers/checkoutController");
const { auth } = require("../middleware/authMiddleware");

router.post("/", auth, createOrderAndPayment);

module.exports = router;

