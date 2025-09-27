const express = require("express");
const router = express.Router();
const { createPayment, updatePaymentStatus, capturePayPalPayment
    // createPaypalOrder, capturePaypalOrder 
} = require("../controllers/paymentController");
const { auth } = require("../middleware/authMiddleware");

// Create payment and redirect to Stripe
router.post("/", auth, createPayment);

// Optional: Webhook / Manual update for payment status
router.post("/update", updatePaymentStatus);
router.get("/paypal/capture", capturePayPalPayment);

module.exports = router;
