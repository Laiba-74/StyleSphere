import React, { useState, useEffect } from "react";
import { MapPin, Truck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
const baseURL = import.meta.env.VITE_SERVER;
import toast from "react-hot-toast";
import {
  createShippingAddress,
  getUserShippingAddresses,
} from "../../api/shipping";
import { createCheckout } from "../../api/checkout";

const CheckoutPage = ({ cartItems }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [newAddress, setNewAddress] = useState({
    address: "",
    city: "",
    state: "",
    zipcode: "",
    phone: "",
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await getUserShippingAddresses();
        setAddresses(res.data.addresses);
      } catch (err) {
        toast.error(
          "Error fetching addresses:",
          err.response?.data || err.message
        );
      }
    };
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const total = cartItems.reduce((sum, item) => {
        const discount = item.discount || 0;
        const discountedPrice = item.price - (item.price * discount) / 100;
        return sum + discountedPrice * item.quantity;
      }, 0);
      setTotalAmount(total);
    } else {
      setTotalAmount(0);
    }
  }, [cartItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = async () => {
    try {
      const res = await createShippingAddress(newAddress);
      setAddresses((prev) => [...prev, res.data.address]);
      setSelectedAddressId(res.data.address._id);
      setNewAddress({
        address: "",
        city: "",
        state: "",
        zipcode: "",
        phone: "",
      });
      toast.success("Address added successfully!");
    } catch (err) {
      console.error("Error adding address:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to add address");
    }
  };

  const handleCheckout = async () => {
    if (!cartItems.length) {
      toast.error("Cart is empty");
      return;
    }
    if (!selectedAddressId) {
      toast.error("Select a shipping address");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.product?._id || item.product,
          selectedSize: item.selectedSize || item.size,
          quantity: item.quantity,
        })),
        shippingAddressId: selectedAddressId,
        totalAmount,
        payment: paymentMethod,
      };

      const res = await createCheckout(payload);
      console.log("Data", res.data);

      if (paymentMethod === "stripe" || paymentMethod === "paypal") {
        if (!res.data.url) {
          toast.error("Something went wrong: payment URL missing");
          return;
        }

        window.location.href = res.data.url;
      } else if (paymentMethod === "cod") {
        if (!res.data.url) {
          toast.error("Something went wrong: payment URL missing");
          return;
        }
        window.location.href = res.data.url;
      } else {
        toast.success("Order placed successfully with Cash on Delivery!");
      }
    } catch (err) {
      console.error("Checkout error 👉", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      const discount = item.discount || 0;
      const discountedPrice = item.price - (item.price * discount) / 100;
      return sum + discountedPrice * item.quantity;
    }, 0);
    setTotalAmount(total);
  }, [cartItems]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <MapPin className="h-5 w-5 text-[#1c9199] mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Shipping Information
                </h2>
              </div>

              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className="flex cursor-pointer hover:bg-gray-50 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                  >
                    <input
                      type="radio"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="text-[#1c9199] focus:ring-[#38d6e8]"
                    />
                    <span className="ml-2 text-gray-700">
                      {addr.address}, {addr.city}, {addr.state} {addr.zipcode} (
                      {addr.phone})
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-6">
                <div className="flex items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Add New Address
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={newAddress.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={newAddress.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zipcode
                    </label>
                    <input
                      type="text"
                      name="zipcode"
                      required
                      value={newAddress.zipcode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={newAddress.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={newAddress.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
                  />
                </div>

                <div className="lg:col-span-2 space-y-8 mt-5">
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="w-full bg-[#1c9199] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#165e66] transition-colors disabled:opacity-50"
                  >
                    Add Address
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <Truck className="h-5 w-5 text-[#1c9199] mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Shipping Method
                </h2>
              </div>
              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("stripe")}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg border transition 
                  ${
                    paymentMethod === "stripe"
                      ? "text-gray-700 border-2 border-[#1c9199]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <i className="fab fa-stripe-s mr-2"></i>
                  Stripe
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg border transition 
                  ${
                    paymentMethod === "paypal"
                      ? "text-gray-700 border-2 border-[#1c9199]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <i className="fab fa-paypal mr-2"></i>
                  PayPal
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg border transition 
                   ${
                     paymentMethod === "cod"
                       ? "text-gray-700 border-2 border-[#1c9199]"
                       : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                   }`}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Cash on Delivery
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full bg-[#1c9199] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#165e66] transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : `Complete Order`}
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="flex items-center space-x-4"
                  >
                    <img
                      src={
                        item.image
                          ? `${baseURL}/${item.image.replace(/\\/g, "/")}`
                          : "/placeholder.png"
                      }
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      $
                      {(
                        (item.price - (item.price * item.discount) / 100) *
                        item.quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
