import React,{ useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { useReviews } from '../context/ReviewsContext';
import StarRating from './StarRating';
const baseURL = import.meta.env.VITE_SERVER;
import toast from "react-hot-toast";
const ProductCard = ({ product }) => {
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addItem } = useCart();
  const { getReviewStats, fetchReviewStats } = useReviews();
  
  useEffect(() => {
  if (product?._id) {
    fetchReviewStats(product._id);
  }
}, [product?._id]);

// ✅ Safe access
const reviewStats = getReviewStats(product?._id) || {
  average: 0,
  total: 0,
  distribution: { 1:0, 2:0, 3:0, 4:0, 5:0 }
};

const productRating = reviewStats.average;

const handleFavoriteClick = () => {
  const isFavorite = favorites.some((f) => f?.product?._id === product?._id);

  if (isFavorite) {
    removeFromFavorites(product._id);
  } else {
    addToFavorites(product._id);
  }
};


  const handleAddToCart = async () => {
  try {
    await addItem(product._id, "M", 1);
  } catch (err) {
    console.error("Error adding to cart:", err);
  }
};

const discount = product.discount || 0;
const discountedPrice = discount
  ? (product.price - (product.price * discount / 100)).toFixed(2)
  : product.price;

  return (
     
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative">
        <Link to={`/product/${product._id}`}>
        <img
          src={product.images?.[0]
            ? `${baseURL}/${product.images[0].replace(/\\/g, "/")}`
            : "https://via.placeholder.com/200x150?text=No+Image"
           }
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        /></Link>
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
            -{discount}%
          </div>
        )}
        <div className="absolute top-2 right-2 transition-opacity duration-300">
          <button 
            onClick={handleFavoriteClick}
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 cursor-pointer"
          >
            <Heart
              className={`h-4 w-4 ${
              favorites.some((f) => f?.product?._id === product?._id)
              ? 'text-red-500 fill-current'
              : 'text-gray-600'
             }`}
            />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-gray-500 mb-1">{product.category}</p>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-[#1c9199] transition-colors">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>
        
        <div className="flex items-center mb-2">
          <StarRating rating={productRating} readonly size="small" />
          <span className="text-sm text-gray-500 ml-2">({reviewStats.total})</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">${discountedPrice}</span>
            {product.price && (
              <span className="text-sm text-gray-500 line-through">${product.price}</span>
            )}
          </div>
          <button 
            onClick={handleAddToCart}
            className="bg-[#1c9199] text-white p-2 rounded-full hover:bg-[#165e66] transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;