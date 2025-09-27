import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  BarChart3,
  Eye,
  Star,
} from "lucide-react";
import { deleteProduct, getProductById } from "../../api/product";
const baseURL = import.meta.env.VITE_SERVER;
import toast from "react-hot-toast";

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error(err.response?.data?.message || "Failed to fetch product", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully!", {
        position: "top-right",
      });
      setProduct(null);
      navigate("/admin/products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting product", {
        position: "top-right",
      });
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!product) return <p className="p-6">Product not found</p>;

  return (
    <div className="p-6">
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin-panel/products")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-1">
              Product ID: {product.id} | SKU: {product.sku}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() =>
                navigate(`/admin-panel/products/${product.id}/edit`)
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>

            {showModal && (
              <div
                id="deleteModal"
                className="fixed inset-0 flex items-center justify-center bg-black/50"
              >
                <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                  <h3 className="text-lg font-bold">Confirm Delete</h3>
                  <p className="text-gray-600 mt-2">
                    Are you sure you want to delete this product?
                  </p>
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Product Images
            </h2>
            <div className="space-y-4">
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={
                    product?.images?.[0]
                      ? `${baseURL}/${product.images[0].replace(/\\/g, "/")}`
                      : "/placeholder.jpg"
                  }
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {product?.images?.length > 1 &&
                  product.images
                    .slice(1)
                    .map((image, index) => (
                      <img
                        key={index}
                        src={`${baseURL}/${image.replace(/\\/g, "/")}`}
                        alt={`${product.name} ${index + 2}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Product Name
                </label>
                <p className="text-sm text-gray-900 mt-1">{product.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Category
                </label>
                <p className="text-sm text-gray-900 mt-1">{product.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Price
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Stock
                </label>
                <p
                  className={`text-sm mt-1 font-medium ${
                    product.stock > 10
                      ? "text-green-600"
                      : product.stock > 0
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {product.stock} units
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Status
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(
                    product.status
                  )}`}
                >
                  {product.status.charAt(0).toUpperCase() +
                    product.status.slice(1)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  SKU
                </label>
                <p className="text-sm text-gray-900 mt-1">{product.sku}</p>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-500">
                Description
              </label>
              <p className="text-sm text-gray-900 mt-1 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-50 p-3 rounded-lg mb-2">
                  <Package className="h-6 w-6 text-blue-600 mx-auto" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {product.sales}
                </p>
                <p className="text-sm text-gray-600">Total Sales</p>
              </div>
              <div className="text-center">
                <div className="bg-green-50 p-3 rounded-lg mb-2">
                  <DollarSign className="h-6 w-6 text-green-600 mx-auto" />
                </div>
                {/* <p className="text-2xl font-bold text-gray-900">${product.revenue.toLocaleString()}</p> */}
                <p className="text-sm text-gray-600">Revenue</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-50 p-3 rounded-lg mb-2">
                  <Star className="h-6 w-6 text-yellow-600 mx-auto" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {product.rating}
                </p>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-50 p-3 rounded-lg mb-2">
                  <Eye className="h-6 w-6 text-purple-600 mx-auto" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {product.reviews}
                </p>
                <p className="text-sm text-gray-600">Reviews</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Product Variants
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <span
                      key={size}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Specifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-500 capitalize">
                    {key}
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Product History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Created Date
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
