import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Search, Eye, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";
import { deleteProduct, getProducts } from "../../api/product";
const baseURL = import.meta.env.VITE_SERVER;
const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
      category: "",
      priceRange: "",
      size: "",
      sortBy: "newest",
  });
  const categories = [
    "All",
    "Outerwear",
    "Shirts",
    "Footwear",
    "Top",
    "Accessory",
  ];
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products", error);
        toast.error("Failed to fetch products");
      }
    };
    fetchProducts();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Low stock":
        return "bg-yellow-100 text-yellow-800";
      case "Out of stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Active":
        return "Active";
      case "Low stock":
        return "Low stock";
      case "Out of stock":
        return "Out of stock";
      default:
        return status;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteId);
      setProducts((prev) => prev.filter((p) => p._id !== deleteId));
      setShowModal(false);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      const errMsg =
        error.response?.data?.message || "Failed to delete product";
      toast.error(errMsg);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filters.category === "" ||
      filters.category === "All" ||
      product.category === filters.category;
    const matchesSize = filters.size === "" || true; 

    let matchesPrice = true;
    if (filters.priceRange) {
      const [min, max] = filters.priceRange
        .split("-")
        .map((p) => (p === "+" ? Infinity : parseInt(p)));
      matchesPrice =
        product.price >= min && (max === undefined || product.price <= max);
    }

    return matchesSearch && matchesCategory && matchesSize && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
      default:
        return 0;
    }
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const pageSize = 8;

  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">
              Manage your product inventory and catalog
            </p>
          </div>
          <Link
            to="/admin/products/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
       {paginatedProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <img
                src={
                  product.images?.[0]
                    ? `${baseURL}/${product.images[0].replace(/\\/g, "/")}`
                    : "https://via.placeholder.com/200x150?text=No+Image"
                }
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <button className="bg-white p-1 rounded-full shadow-md hover:bg-gray-50">
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="absolute top-2 left-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    product.status
                  )}`}
                >
                  {getStatusText(product.status)}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {product.name}
                </h3>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>SKU:</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium text-gray-900">
                    ${product.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Stock:</span>
                  <span
                    className={`font-medium ${
                      product.stock === 0
                        ? "text-red-600"
                        : product.stock <= 10
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {product.stock}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sales:</span>
                  <span className="font-medium">{product.sales}</span>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Link
                  to={`/admin/product/view/${product._id}`}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
                <Link
                  to={`/admin/product/edit/${product._id}`}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
                <button
                  onClick={() => {
                    setDeleteId(product._id);
                    setShowModal(true);
                  }}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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

      <div className="flex justify-center mt-8">
        <nav className="flex space-x-2">
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 border rounded-lg ${
                page === currentPage
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className={`px-3 py-2 border rounded-lg ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AdminProducts;
