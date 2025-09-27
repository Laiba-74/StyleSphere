const Payment = require("../models/Payment");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const paypal = require("@paypal/checkout-server-sdk");
const Order = require("../models/Order");
// Create Payment and Redirect to Stripe
const createPayment = async (req, res) => {
  try {
    const { orderId, cartItems = [], currency = "USD" } = req.body;

// Calculate total in cents by rounding each item's unit price to cents first
let totalInCents = 0;
for (const item of cartItems) {
  const price = Number(item.price) || 0;        // price in dollars
  const discount = Number(item.discount) || 0;  // percentage
  const quantity = Number(item.quantity) || 1;

  // unit price after discount in dollars
  const unitPrice = price - (price * discount) / 100;

  // round unit price to cents then multiply by quantity
  const itemCents = Math.round(unitPrice * 100) * quantity;

  totalInCents += itemCents;
}

// total amount in dollars (useful for DB/display)


    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Order ${orderId}`,
            },
            unit_amount: totalInCents, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/order-success/${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`,
    });

    // Save payment in DB as pending
    const payment = new Payment({
      user: req.user.userId,
      orderId,
      provider: "stripe",
      status: "pending",
      amount,
      currency,
      transactionId: session.id,
    });

    await payment.save();

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Payment Status after webhook or redirect
const updatePaymentStatus = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    const payment = await Payment.findOne({ transactionId });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    payment.status = status;
    await payment.save();

    res.status(200).json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// const environment = new paypal.core.SandboxEnvironment(
//   process.env.PAYPAL_CLIENT_ID,
//   process.env.PAYPAL_SECRET
// );
// const client = new paypal.core.PayPalHttpClient(environment);


// Reuse PayPal client
function paypalClient() {
  return new paypal.core.PayPalHttpClient(
    new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_SECRET
    )
  );
}

const capturePayPalPayment = async (req, res) => {
  try {
    const { token } = req.query;
    console.log("👉 Capture route hit, token:", token);

    const client = paypalClient();
    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});

    const capture = await client.execute(request);

    console.log("👉 Capture response:", JSON.stringify(capture.result, null, 2));

    // Extract values
    const captureId = capture.result.purchase_units[0].payments.captures[0].id;
    const paypalStatus = capture.result.status; // e.g. "COMPLETED"

    // ✅ Find by paypalOrderId
    const payment = await Payment.findOne({ paypalOrderId: token });
    if (!payment) {
      console.error("❌ No payment found for PayPal orderId:", token);
      return res.redirect(
        `${process.env.FRONTEND_URL}/checkout?error=payment_not_found`
      );
    }

    // ✅ Normalize status
    let newStatus = paypalStatus.toLowerCase(); // "completed"
    if (newStatus === "completed") {
      newStatus = "paid";
    } else if (newStatus === "failed" || newStatus === "declined") {
      newStatus = "failed";
    }

    // ✅ Update payment
    payment.status = newStatus;
    payment.transactionId = captureId;
    await payment.save();

    // ✅ Mark order as paid
    await Order.findByIdAndUpdate(payment.orderId, { status: "paid" });

    // ✅ Redirect to frontend success page
    return res.redirect(
      `${process.env.FRONTEND_URL}/order-success/${payment.orderId}`
    );
  } catch (err) {
    console.error("❌ PayPal Capture Error:", err.message);
    return res.redirect(
      `${process.env.FRONTEND_URL}/checkout?error=paypal_failed`
    );
  }
};






module.exports = { createPayment, updatePaymentStatus, capturePayPalPayment
  // createPaypalOrder, capturePaypalOrder 
};



// 1. Create PayPal Order
// 1. Create PayPal Order
// const createPaypalOrder = async (req, res) => {
//   const { totalAmount, orderId } = req.body;

//   const request = new paypal.orders.OrdersCreateRequest();
//   request.prefer("return=representation");
//   request.requestBody({
//     intent: "CAPTURE",
//     purchase_units: [
//       {
//         amount: {
//           currency_code: "USD",
//           value: totalAmount.toString(),
//         },
//       },
//     ],
//     application_context: {
//       return_url: `${process.env.FRONTEND_URL}/order-success/${orderId}`, // ✅ like Stripe
//       cancel_url: `${process.env.FRONTEND_URL}/checkout`,
//     },
//   });

//   try {
//     const order = await client.execute(request);

//     // Find approval URL from PayPal response
//     const approvalUrl = order.result.links.find(l => l.rel === "approve").href;

//     res.json({ url: approvalUrl }); // ✅ same as Stripe now
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // 2. Capture after approval
// // 2. Capture after approval
// const capturePaypalOrder = async (req, res) => {
//   const { orderId } = req.body;
//   const request = new paypal.orders.OrdersCaptureRequest(orderId);
//   request.requestBody({});

//   try {
//     const capture = await client.execute(request);

//     // Extract PayPal capture details
//     const result = capture.result;
//     const status = result.status; // COMPLETED or PENDING
//     const transactionId =
//       result.purchase_units[0].payments.captures[0].id;
//     const amount =
//       result.purchase_units[0].payments.captures[0].amount.value;
//     const currency =
//       result.purchase_units[0].payments.captures[0].amount.currency_code;
//     const payerEmail = result.payer.email_address;

//     // Save/update Payment record
//     const payment = new Payment({
//       user: req.user._id,
//       orderId,
//       provider: "paypal",
//       status,
//       amount,
//       currency,
//       transactionId,
//     });
//     await payment.save();

//     res.json({
//       success: true,
//       payment,
//       payer: { email: payerEmail },
//     });
//   } catch (err) {
//     console.error("PayPal capture error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };
