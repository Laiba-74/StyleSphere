import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  Shield,
  Headphones,
  Star,
  ShoppingBag,
} from "lucide-react";
import ProductCard from "../../components/ProductCard";
import StarRating from "../../components/StarRating";
import {
  getCategoryCounts,
  getFiveStarProduct,
  getProducts,
} from "../../api/product";
const baseURL = import.meta.env.VITE_SERVER;
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fiveStarProduct, setFiveStarProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProducts();
        const seenCategories = new Set();
        const uniqueCategoryProducts = [];

        for (const product of data) {
          if (!seenCategories.has(product.category)) {
            uniqueCategoryProducts.push(product);
            seenCategories.add(product.category);
          }
          if (uniqueCategoryProducts.length === 4) break;
        }
        setFeaturedProducts(uniqueCategoryProducts);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };

    const fetchFiveStarProduct = async () => {
      try {
        const { data } = await getFiveStarProduct();
        setFiveStarProduct(data);
      } catch (error) {
        console.error("Error fetching 5-star product", error);
      }
    };

    const fetchCategoryCounts = async () => {
      try {
        const { data } = await getCategoryCounts();
        const formatted = data.map((item) => ({
          name: item._id,
          count: `${item.count} Items`,
          image: item.image,
        }));
        setCategories(formatted);
      } catch (error) {
        console.error("Error fetching category counts", error);
      }
    };

    fetchProducts();
    fetchCategoryCounts();
    fetchFiveStarProduct();
  }, []);

  let discountedPrice = null;
  if (fiveStarProduct) {
    const discount = fiveStarProduct.discount || 0;
    discountedPrice = discount
      ? (
          fiveStarProduct.price -
          (fiveStarProduct.price * discount) / 100
        ).toFixed(2)
      : fiveStarProduct.price;
  }

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-blue-100 text-[#165e66] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <ShoppingBag className="h-4 w-4 mr-2" />
                New Collection 2024
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Discover Your
                <span className="text-[#1c9199] block">Perfect Style</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
                Explore our curated collection of premium fashion pieces
                designed to elevate your wardrobe and express your unique
                personality.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="bg-[#1c9199] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#165e66] transition-colors inline-flex items-center justify-center"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/products"
                  className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
                >
                  View Collection
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-8 mt-12">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold text-gray-900 ml-1">
                      4.9
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Fashion Model"
                  className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
                />

                {fiveStarProduct && (
                  <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border">
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          fiveStarProduct.images
                            ? `${baseURL}/${fiveStarProduct.images[0].replace(
                                /\\/g,
                                "/"
                              )}`
                            : "https://via.placeholder.com/200"
                        }
                        alt={fiveStarProduct.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {fiveStarProduct.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-[#1c9199]">
                            ${discountedPrice}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ${fiveStarProduct.price}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <StarRating
                            rating={fiveStarProduct.avgRating || 0}
                            readonly
                            size="small"
                          />
                          <span className="text-sm text-gray-500 ml-2">
                            ({fiveStarProduct.totalReviews})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute top-4 right-4 w-72 h-72 bg-blue-100 rounded-full opacity-20 -z-10"></div>
              <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-indigo-100 rounded-full opacity-30 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-[#1c9199]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $50</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-[#1c9199]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">100% secure payment processing</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8 text-[#1c9199]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Customer support available anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <Link
                key={index}
                to="/products"
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <img
                    src={
                      Array.isArray(category.image) && category.image.length > 0
                        ? `${baseURL}/${category.image[0].replace(/\\/g, "/")}`
                        : "https://via.placeholder.com/400x300?text=No+Image"
                    }
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-opacity-30 transition-colors duration-300"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <p className="text-sm">{category.count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of the season's most
              sought-after pieces
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center bg-[#1c9199] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#165e66] transition-colors"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
