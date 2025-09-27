const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe Webhook Handler
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;

      try {
        // Find payment by Stripe session ID
        const payment = await Payment.findOne({ transactionId: session.id });
        if (!payment) return res.status(404).json({ message: "Payment not found" });

        // Update payment status to paid
        payment.status = "paid";
        await payment.save();

        // Update corresponding order paymentStatus
        const order = await Order.findById(payment.orderId);
        if (order) {
          order.paymentStatus = "paid";
          order.payment = payment._id;
          await order.save();
        }

        console.log(`Payment successful for Order: ${payment.orderId}`);
      } catch (err) {
        console.error("Error updating payment/order:", err.message);
        return res.status(500).send("Internal Server Error");
      }
      break;

    case "checkout.session.expired":
      console.log("Checkout session expired:", event.data.object.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};
