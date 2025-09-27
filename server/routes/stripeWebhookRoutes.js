const express = require("express");
const router = express.Router();
const { stripeWebhook } = require("../controllers/stripeWebhookController");

// Stripe requires raw body, so no bodyParser.json() here
router.post("/", express.raw({ type: "application/json" }), stripeWebhook);

module.exports = router;
