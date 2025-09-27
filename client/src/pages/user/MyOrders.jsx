import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Eye, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from "axios";
import { getUserOrders } from '../../api/order';
const baseURL = import.meta.env.VITE_SERVER; 
const MyOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
      if (isLoggedIn) {
        loadOrders();
      } else { 
      }
    }, [isLoggedIn]);
  
    const loadOrders = async () => {
      try {
        const { data } = await getUserOrders()
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error loading orders:", error);
      }
    };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <Package className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-[#1c9199] bg-blue-100';
      case 'shipped':
        return 'text-indigo-600 bg-indigo-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <a
              href="/products"
              className="bg-[#1c9199] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#165e66] transition-colors"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.orderStatus)}
                        <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                        >
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Order {order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">${order.totalAmount}</p>
                      <button
                        onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                        className="text-[#1c9199] hover:text-[#165e66] text-sm font-medium flex items-center mt-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {selectedOrder === order._id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {order.trackingNumber && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                      </p>
                    </div>
                  )}

                  {selectedOrder === order._id && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={`${item.id}-${item.size}`} className="flex items-center space-x-4">
                            <img
                              src={`${baseURL}/${item.images[0].replace(/\\/g, "/")}`}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{item.name}</h5>
                              <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <span className="font-medium text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                      Reorder
                    </button>
                    {order.orderStatus === 'delivered' && (
                      <button className="text-[#1c9199] hover:text-[#165e66] text-sm font-medium">
                        Return Items
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;