import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css'
import App from './App.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ReviewsProvider } from './context/ReviewsContext.jsx';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
  <FavoritesProvider>
  <CartProvider>
  <ReviewsProvider>
    <App />
    </ReviewsProvider>
  </CartProvider>
  </FavoritesProvider>
  </AuthProvider>,
)
