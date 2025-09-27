import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderById } from '../../api/order';
const baseURL = import.meta.env.VITE_SERVER;
const OrderSuccess = ({ token }) => {
  const { id } = useParams(); 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id)
        console.log(res.data.order);
        setOrder(res.data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <p className="text-lg text-gray-500">
            Order ID: <span className="font-medium text-gray-900">{order.id}</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Details</h2>
          
          <div className="space-y-6">
            {order.items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                <img
                  src={`${baseURL}/${item.images[0].replace(/\\/g, "/")}`}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  <p className="text-gray-600">Size: {item.selectedSize}</p>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                
              <p className="text-gray-600">
                Price: <span className="font-medium">${item.finalPrice.toFixed(2)}</span>
              </p>
                </div>
                <span className="text-lg font-medium text-gray-900">
                  ${(item.finalPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex justify-between text-xl font-semibold text-gray-900">
              <span>Total Paid</span>
              <span>${order.totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">What's Next?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-[#1c9199] font-medium">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Order Processing</h3>
                <p className="text-gray-600">We're preparing your items for shipment.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Shipping Confirmation</h3>
                <p className="text-gray-600">You'll receive tracking information via email.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Delivery</h3>
                {/* <p className="text-gray-600">Your order will be delivered within {order.shipping.estimatedDelivery}.</p> */}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/my-orders"
            className="bg-[#1c9199] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#165e66] transition-colors text-center"
          >
            View Order History
          </Link>
          <Link
            to="/products"
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;