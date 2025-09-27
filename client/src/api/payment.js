import api from "./api";

// Create Stripe payment
export const createPayment = (paymentData) =>
  api.post("/payment", paymentData);

// Update payment status (webhook/manual)
export const updatePaymentStatus = (updateData) =>
  api.post("/payment/update", updateData);

// Capture PayPal payment
export const capturePayPalPayment = (orderId) =>
  api.get(`/payment/paypal/capture?orderId=${orderId}`);
