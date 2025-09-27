import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // adjust path if needed
import { addToCart, getCart, removeFromCart, updateCartQuantity, clearCartApi } from "../api/cart";
import toast from "react-hot-toast";

const CartContext = createContext(null);

const calcTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.payload, total: calcTotal(action.payload) };
    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getCart()
        console.log(res.data)
        dispatch({ type: "SET_CART", payload: res.data.items || [] });
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };
    if (isLoggedIn) fetchCart();
  }, [isLoggedIn]);

  // Actions
  const addItem = async (productId, size, quantity = 1) => {
    try {
      const res = await addToCart(productId, size, quantity);
      dispatch({ type: "SET_CART", payload: res.data.items });
      toast.success("Item added to cart");
    } catch (err) {
      console.error("Error adding item:", err);
      toast.error("Failed to add item");
    }
  };

  const updateQuantity = async (productId, size, quantity) => {
    try {
      const res = await updateCartQuantity(productId, size, quantity);
      dispatch({ type: "SET_CART", payload: res.data.items });
      toast.success("Quantity updated");
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (productId, size) => {
  try {
    const res = await removeFromCart(productId, size);
    dispatch({ type: "SET_CART", payload: res.data.items });
    toast.success("Item removed from cart");
  } catch (err) {
    console.error("Error removing item:", err);
    toast.error("Failed to remove item");
  }
};


  const clearCart = async () => {
    try {
      const res = await clearCartApi();
      dispatch({ type: "SET_CART", payload: res.data.items });
      toast.success("Cart cleared");
    } catch (err) {
      console.error("Error clearing cart:", err);
      toast.error("Failed to clear cart");
    }
  };

  return (
  <CartContext.Provider
  value={{ 
    cartItems: state.items, 
    total: state.total, 
    addItem, 
    updateQuantity, 
    removeItem, 
    clearCart 
    }}
>
  {children}
</CartContext.Provider>

  );
};

// ---------- Hook ----------
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
