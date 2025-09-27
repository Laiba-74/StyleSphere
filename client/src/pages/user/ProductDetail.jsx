import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Heart, ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useReviews } from "../../context/ReviewsContext";
import StarRating from "../../components/StarRating";
import { getProductById, getRelatedProducts } from "../../api/product";
const baseURL = import.meta.env.VITE_SERVER;
import ReviewsSection from "../../components/ReviewsSection";
import toast from "react-hot-toast";
const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { getProductReviews, getReviewStats, fetchReviews, fetchReviewStats } =
    useReviews();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const productId = id;
  const reviews = getProductReviews(productId);
  const reviewStats = getReviewStats(productId);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProductById(id);
        setProduct(data);
        fetchReviews(id);
        fetchReviewStats(id);
        const relatedRes = await getRelatedProducts(id);
        setRelatedProducts(relatedRes.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error(err.response?.data?.message || "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!product) return <p className="text-center">No product found</p>;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size", { position: "top-right" });
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity must be at least 1", { position: "top-right" });
      return;
    }

    try {
      await addItem(product._id, selectedSize, quantity);
      toast.success("Added to cart!", { position: "top-right" });
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add to cart", { position: "top-right" });
    }
  };

  const discount = product.discount || 0;
  const discountedPrice = discount
    ? (product.price - (product.price * discount) / 100).toFixed(2)
    : product.price;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-8 text-sm text-gray-600">
          <span>Home</span> / <span>Products</span> /{" "}
          <span>{product.category}</span>
          <span className="text-gray-900 font-medium"> {product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-w-4 aspect-h-5 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={
                  product.images?.[selectedImage]
                    ? `${baseURL}/${product.images[selectedImage].replace(
                        /\\/g,
                        "/"
                      )}`
                    : "https://via.placeholder.com/400x300?text=No+Image"
                }
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>

            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-[#1c9199]"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={`${baseURL}/${image.replace(/\\/g, "/")}`}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center mb-4">
                <StarRating rating={reviewStats?.average || 0} readonly />
                <span className="ml-2 text-sm text-gray-600">
                  ({reviewStats?.total || 0} reviews)
                </span>
              </div>

              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ${discountedPrice}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {" "}
                      ${product.price}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-sm font-medium">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-gray-600 mb-6">{product.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
              <div className="flex space-x-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-4 border rounded-lg text-sm font-medium ${
                      selectedSize === size
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Quantity
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
                >
                  -
                </button>
                <span className="text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              <button className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">2 Year Warranty</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">Easy Returns</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Specifications
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-gray-500 capitalize">
                      {key}
                    </dt>
                    <dd className="text-sm text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <ReviewsSection
          productId={product._id}
          reviews={reviews}
          stats={reviewStats}
        />

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Related Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((rp) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={`${baseURL}/${rp.images?.[0]}`}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {rp.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">{rp.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        ${rp.price}
                      </span>
                      <StarRating rating={rp.rating} readonly size="small" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No related products found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
