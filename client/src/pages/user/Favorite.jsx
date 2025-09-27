import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useFavorites } from "../../context/FavoritesContext";
import ProductCard from "../../components/ProductCard";

const FavoritesPage = () => {
  const { favorites } = useFavorites();

  if (!favorites || favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No favorites yet
          </h2>
          <p className="text-gray-600 mb-6">
            Add some products to your favorites to see them here.
          </p>
          <Link
            to="/products"
            className="bg-[#1c9199] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#165e66] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Favorites ({favorites.length})
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites
            .filter((fav) => fav && fav.product)
            .map((fav) => (
              <ProductCard key={fav.product._id} product={fav.product} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
