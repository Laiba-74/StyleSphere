import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Eye, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserCount } from '../../api/auth';
import { getProductCount } from '../../api/product';
import { getAllProductSales, getOrderCount, getRecentOrders, getRevenue } from '../../api/order';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate()
  const [totalUsers, setTotalUsers] = useState();
  const [totalProducts, setTotalProducts] = useState();
  const [totalOrders, setTotalOrders] = useState();
  const [totalRevenue, setTotalRevenue] = useState();
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  useEffect(() => {
  const fetchTotalUsers = async () => {
    const userRes = await getUserCount();
    setTotalUsers(userRes.data.totalUsers);
  };
  const fetchTotalProducts = async () => {
    const productRes = await getProductCount();
    setTotalProducts(productRes.data.totalProducts);
  };
  const fetchTotalOrders = async () => {
    const orderRes = await getOrderCount();
    setTotalOrders(orderRes.data.totalOrders);
  };
  const fetchTotalRevenue = async () => {
    const revenueRes = await getRevenue();
    setTotalRevenue(revenueRes.data.totalRevenue);
  };
  const fetchRecentOrders = async () => {
    const recentRes = await getRecentOrders();
    setRecentOrders(recentRes.data.orders);
  };
  
  fetchTotalUsers();
  fetchTotalProducts();
  fetchTotalOrders();
  fetchTotalRevenue();
  fetchRecentOrders();
}, []);

const fetchAllProductSales = async () => {
  try {
    const res = await getAllProductSales();
    console.log("res =", res.data); // debug
    if (res.data && Array.isArray(res.data.sales)) {
      setTopProducts(res.data.sales);
    }
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchAllProductSales();
}, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <button 
              onClick={() => navigate("/admin/orders")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{order.trackingNumber}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.user.name}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-gray-900">${order.totalAmount}</p>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      <Eye className="h-4 w-4 inline mr-1" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{product.productName}</h3>
                      <p className="text-sm text-gray-600">{product.totalQuantity} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${product.totalRevenue.toFixed(2)}</p>
                    <div className="flex items-center text-green-600 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>Revenue</span>
                    </div>
                  </div>
                </div>
               ))
      ) : (
        <div>
          <div colSpan="3" className="py-2 px-3 text-gray-500 text-center">
            No sales data
          </div>
        </div>
      )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
            onClick={() => navigate("/admin/products/add")}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Add New Product
            </button>
            <button
            onClick={() => navigate("/admin/orders")}
            className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
              View All Orders
            </button>
            <button
            onClick={() => navigate("/admin/users")} 
            className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              Manage Users
            </button>
            <button
            onClick={() => navigate("/admin/profile")}  
            className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium">
              Manage Your Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;