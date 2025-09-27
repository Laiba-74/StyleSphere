import { useCart } from "../../context/CartContext";
import CheckoutPage from "./Checkout";

function ShippingForm() {
  const { cartItems, total } = useCart();

  return <CheckoutPage cartItems={cartItems} totalAmount={total} />;
}

export default ShippingForm;
