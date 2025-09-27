const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    provider: { 
      type: String, 
      enum: ["stripe", "paypal", "cod"], 
      default: "stripe" 
    },
    status: { 
      type: String, 
      enum: ["pending", "paid", "failed"], 
      default: "pending" 
    },

    // 👇 store both IDs
    paypalOrderId: { type: String },   // PayPal's order id (token before capture)
    transactionId: { type: String },   // final capture id or Stripe paymentIntent

    amount: { 
      type: Number, 
      required: true 
    },
    currency: { 
      type: String, 
      default: "USD" 
    },
    metadata: { 
      type: Object 
    },
  },
  { timestamps: true }
);


// 🔥 Indexes for performance
paymentSchema.index({ user: 1 });
paymentSchema.index({ orderId: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
