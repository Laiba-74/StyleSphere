import api from "./api";

// Create order + payment (checkout)
export const createCheckout = (checkoutData) =>
  api.post("/checkout", checkoutData);
