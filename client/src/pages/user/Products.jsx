import React, { useState, useEffect } from "react";
import { Filter, Grid, List, Search, X } from "lucide-react";
import ProductCard from "../../components/ProductCard";
import { getProducts } from "../../api/product";
const Products = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: "",
    priceRange: "",
    size: "",
    sortBy: "newest",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    "All",
    "Outerwear",
    "Shirts",
    "Footwear",
    "Top",
    "Accessory",
  ];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const priceRanges = [
    { label: "Under $50", value: "0-50" },
    { label: "$50 - $100", value: "50-100" },
    { label: "$100 - $200", value: "100-200" },
    { label: "Over $200", value: "200+" },
  ];

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

  const pageSize = 6;

  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            All Products
          </h1>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            
            <div className="flex items-center gap-4 w-full md:w-auto">
              
              <button
                onClick={() => setIsFilterOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-[#1c9199] text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-[#1c9199] text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38d6e8]"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        
        <div className="w-full">
          <div className="mb-4 text-gray-600">
            Showing {sortedProducts.length} of {products.length} products
          </div>

          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {paginatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          
          <div className="mt-12 flex justify-center">
            <nav className="flex space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 border rounded-lg ${
                      page === currentPage
                        ? "bg-[#1c9199] text-white border-[#1c9199]"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
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

        
        <div
          className={`fixed inset-0 z-50 ${isFilterOpen ? "block" : "hidden"}`}
        >
          
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsFilterOpen(false)}
          />

          
          <div
            className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
              isFilterOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full">
              
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h3>
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={filters.category === category}
                          onChange={(e) =>
                            setFilters({ ...filters, category: e.target.value })
                          }
                          className="mr-3 text-[#1c9199] focus:ring-[#38d6e8]"
                        />
                        <span className="text-sm text-gray-700">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">
                    Price Range
                  </h4>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <label key={range.value} className="flex items-center">
                        <input
                          type="radio"
                          name="priceRange"
                          value={range.value}
                          checked={filters.priceRange === range.value}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              priceRange: e.target.value,
                            })
                          }
                          className="mr-3 text-[#1c9199] focus:ring-[#38d6e8]"
                        />
                        <span className="text-sm text-gray-700">
                          {range.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Size</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setFilters({ ...filters, size: size })}
                        className={`py-2 px-3 text-sm border rounded-lg transition-colors ${
                          filters.size === size
                            ? "bg-[#1c9199] text-white border-[#1c9199]"
                            : "bg-white text-gray-700 border-gray-300 hover:border-[#1c9199]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              
              <div className="p-6 border-t border-gray-200 space-y-3">
                <button
                  onClick={() =>
                    setFilters({
                      category: "",
                      priceRange: "",
                      size: "",
                      sortBy: "newest",
                    })
                  }
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-[#1c9199] text-white px-4 py-2 rounded-lg hover:bg-[#165e66] transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        
        <button
          onClick={() => setIsFilterOpen(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#1c9199] text-white rounded-full shadow-lg hover:bg-[#165e66] transition-colors z-40 flex items-center justify-center"
        >
          <Filter className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Products;
