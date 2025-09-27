import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, Edit3 } from "lucide-react";
import { useCart } from "../../context/CartContext";

const baseURL = import.meta.env.VITE_SERVER;

const Cart = () => {
  const { cartItems, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();
  const handleQuantityChange = (id, size, quantity) => {
    if (quantity > 0) updateQuantity(id, size, quantity);
  };

  const handleEdit = (id) => {
    navigate(`/product/${id}`);
  };
  console.log(cartItems);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some items to your cart to get started.
          </p>
          <Link
            to="/products"
            className="bg-[#1c9199] text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    const discount = item.discount || 0;
    const eachAfterDiscount = discount
      ? item.price - (item.price * discount) / 100
      : item.price;
    return sum + eachAfterDiscount * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart Items ({cartItems.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => {
                  const discount = item.discount || 0;
                  const eachPrice = item.price;
                  const eachAfterDiscount = discount
                    ? item.price - (item.price * discount) / 100
                    : item.price;
                  const lineTotal = eachAfterDiscount * item.quantity;

                  return (
                    <div
                      key={`${item.product}-${item.size}`}
                      className="p-6 flex items-center space-x-4"
                    >
                      <img
                        src={
                          item.image
                            ? `${baseURL}/${item.image.replace(/\\/g, "/")}`
                            : "https://via.placeholder.com/200x150?text=No+Image"
                        }
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-gray-600">Size: {item.size}</p>

                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500">
                            Each: ${eachPrice.toFixed(2)}
                          </p>

                          {discount > 0 && (
                            <>
                              <p className="text-sm text-green-600 font-medium">
                                After Discount: ${eachAfterDiscount.toFixed(2)}
                              </p>
                              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-xs font-medium">
                                {discount}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.product,
                              item.size,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>

                        <span className="text-lg font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.product,
                              item.size,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${lineTotal.toFixed(2)}
                        </p>

                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => handleEdit(item.product)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit Product"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product, item.size)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  to="/payment"
                  className="w-full bg-[#1c9199] text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-700 transition-colors text-center block"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  to="/products"
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
