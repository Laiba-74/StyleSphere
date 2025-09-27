const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const ShippingAddress = require("../models/ShippingAddress");

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const paypal = require("@paypal/checkout-server-sdk");

function paypalClient() {
  return new paypal.core.PayPalHttpClient(
    new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_SECRET
    )
  );
}


exports.createOrderAndPayment = async (req, res) => {
  // console.log("PAYMENT METHOD:", payment);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

  try {
    const { items, shippingAddressId, totalAmount, currency = "USD", payment } = req.body;

    if (!items || !items.length || !shippingAddressId || !totalAmount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Validate shipping address
    const shippingAddress = await ShippingAddress.findById(shippingAddressId);
    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address not found" });
    }

    // ✅ Populate product details
    const fullItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        return {
          product: product._id,
          name: product.name,
          price: product.price,
          discount: product.discount || 0,
          finalPrice: product.price - (product.price * (product.discount || 0)) / 100,
          selectedSize: item.selectedSize,
          quantity: item.quantity,
          images: product.images,
          sku: product.sku,
        };
      })
    );

    const calculatedTotal = fullItems.reduce(
  (sum, item) => sum + item.finalPrice * item.quantity,
  0
);

// ✅ Generate human-friendly order number
const today = new Date();
const datePart = today.toISOString().slice(0,10).replace(/-/g, ""); // e.g. 20250829
const randomPart = Math.floor(1000 + Math.random() * 9000); // e.g. 4721
const orderNumber = `ORD-${datePart}-${randomPart}`;

// ✅ Generate tracking number (e.g. TRK9876543210)
const trackingNumber = `TRK${Math.floor(1000000000 + Math.random() * 9000000000)}`;

if (!req.user || !req.user.userId) {
  console.error("❌ Missing user in request!");
  return res.status(400).json({ success: false, error: "User not authenticated properly" });
}
    // ✅ Create order in DB
    const order = new Order({
      user: req.user.userId,
      items: fullItems,
      shippingAddress: shippingAddressId,
      totalAmount: calculatedTotal,
      orderNumber,
      trackingNumber
    });
    await order.save();
console.log("Check Contoller",order)
    let paymentDoc;
    let redirectUrl;

    // ---------- STRIPE FLOW ----------
    if (payment === "stripe") {
      const line_items = fullItems.map((item) => ({
        price_data: {
          currency,
          product_data: { name: item.name },
          unit_amount: Math.round(item.finalPrice * 100),
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/order-success/${order._id}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout`,
      });

      paymentDoc = new Payment({
        user: req.user.userId,
        orderId: order._id,
        provider: "stripe",
        status: "pending",
        amount: calculatedTotal,
        currency,
        transactionId: session.id,
      });
      redirectUrl = session.url;
      console.log(redirectUrl)
    }

    // ---------- PAYPAL FLOW ----------
    else if (payment === "paypal") {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
  request.requestBody({
  intent: "CAPTURE",
  purchase_units: [{
  amount: { 
  currency_code: currency, 
  value: calculatedTotal.toFixed(2)   // ✅ enforce decimal format
},

  shipping: {
    name: { full_name: "Your User Name" },
    address: {
      address_line_1: "123 Street",
      admin_area_2: "City",
      admin_area_1: "State",
      postal_code: "12345",
      country_code: "US"
    }
  }
}],
  application_context: {
    brand_name: "MyShop",
    landing_page: "LOGIN",
    user_action: "PAY_NOW",
    // ✅ send PayPal back to backend, not directly frontend
    return_url: `${process.env.BACKEND_URL}/api/payments/paypal/capture`,
    cancel_url: `${process.env.FRONTEND_URL}/checkout`,
  },
});


      const client = paypalClient();
      const paypalOrder = await client.execute(request);

      paymentDoc = new Payment({
        user: req.user.userId,
        orderId: order._id,
        provider: "paypal",
        status: "pending",
        amount: totalAmount,
        currency,
        paypalOrderId: paypalOrder.result.id,
      });
      // approval link
      redirectUrl = paypalOrder.result.links.find((l) => l.rel === "approve").href;
      console.log(redirectUrl)
    }

    else if (payment === "cod") {
  paymentDoc = new Payment({
    user: req.user.userId,
    orderId: order._id,
    provider: "cod",
    status: "pending", // or "unpaid"
    amount: calculatedTotal,
    currency,
    transactionId: null,
  });

  redirectUrl = `${process.env.FRONTEND_URL}/order-success/${order._id}`;
}

    // Save payment in DB
    await paymentDoc.save();
    order.payment = paymentDoc._id;
    await order.save();
    console.log(redirectUrl)
    res.status(200).json({ url: redirectUrl, orderId: order._id,orderNumber: order.orderNumber, trackingNumber: order.trackingNumber, });

  } catch (err) {
    console.error("❌ Payment Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};