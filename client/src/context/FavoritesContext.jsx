import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { addFavorite, getFavorites, removeFavorite } from "../api/favorite";
import toast from "react-hot-toast";

const FavoritesContext = createContext(null);
export const FavoritesProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [favorites, setFavorites] = useState([]);

  // Load favorites on mount when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadFavorites();
    } else {
      setFavorites([]); // clear when logged out
    }
  }, [isLoggedIn]);

  const loadFavorites = async () => {
    try {
      const { data } = await getFavorites();
      console.log(data)
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const addToFavorites = async (productId) => {
    try {
      await addFavorite(productId)
      await loadFavorites();
      toast.success("Added to favorites");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      toast.error("Failed to add favorite");
    }
  };

  const removeFromFavorites = async (productId) => {
    try {
      await removeFavorite(productId)
      await loadFavorites();
      toast.success("Removed from favorites");
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove favorite");
    }
  };

  const isFavorite = (productId) => {
    return favorites.some((f) => f.product._id === productId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
