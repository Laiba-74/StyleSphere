import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import UserLogin from './pages/user/UserLogin';
import UserRegister from './pages/user/UserRegister';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import Home from './pages/user/Home';
import Dashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/PrivateRoute';
import AdminLayout from './pages/admin/Layout/AdminLayout';
import AdminProducts from './pages/admin/AdminProducts';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import ProductView from './pages/admin/ProductView';
import UserLayout from './pages/user/Layout/UserLayout';
import Products from './pages/user/Products';
import ProductDetail from './pages/user/ProductDetail';
import Cart from './pages/user/Cart';
import FavoritesPage from './pages/user/Favorite';
import ShippingForm from './pages/user/ShippingForm';
import OrderSuccess from './pages/user/OrderSuccess';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
// import Cancle from './pages/user/Cancle';
import CheckoutPage from './pages/user/Checkout';
import MyOrders from './pages/user/MyOrders';
import Profile from './pages/user/Profile';
import AdminSettings from './pages/admin/AdminSettings';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProfile from './pages/admin/AdminProfile';

const stripePromise = loadStripe("pk_test_51RxAS0AoTZDTS51cAldV9qaSC4y806BoQoOC4Imm7Rups5Pv24n61eTGwXlIVgA0fs4nSxuxdTLPiFhtywwtDtW40083jnKr4B"); // Your STRIPE_PUBLIC_KEY

function App() {

  const cartItems = []; 
  const shippingAddressId = "";
  const token = "";

  const router = createBrowserRouter([
    // User routes
    {
      path: "/",
      children: [
        { path: "login", element: <UserLogin /> },
        { path: "register", element: <UserRegister /> },
        { element: <UserLayout />,
          children:[
          { path: "", element: (
              <Home /> 
          )
          },
          { path: "products", element: (
              <Products /> 
          )
          },
          { path: "/product/:id", element: (
              <ProductDetail />
          )
          },
          { path: "/cart", element: (
            <ProtectedRoute role="user">
              <Cart /> 
            </ProtectedRoute>
          )
          },
          { path: "/favorites", element: (
            <ProtectedRoute role="user">
              <FavoritesPage /> 
            </ProtectedRoute>
          )
          },
          { path: "/checkout", element: (
            <ProtectedRoute role="user">
            <Elements stripe={stripePromise}>
              <CheckoutPage cartItems={cartItems} shippingAddressId={shippingAddressId} token={token} /> 
            </Elements>
            </ProtectedRoute>
          )
          },
          { path: "/payment", element: (
            <ProtectedRoute role="user">
              <ShippingForm /> 
            </ProtectedRoute>
          )
          },
          { path: "/order-success/:id", element: (
            <ProtectedRoute role="user">
              <OrderSuccess /> 
            </ProtectedRoute>
          )
          },
          // { path: "/cancle", element: (
          //   <ProtectedRoute role="user">
          //     <Cancle /> 
          //   </ProtectedRoute>
          // )
          // },
          { path: "/my-orders", element: (
            <ProtectedRoute role="user">
              <MyOrders /> 
            </ProtectedRoute>
          )
          },
          { path: "/profile", element: (
            <ProtectedRoute role="user">
              <Profile /> 
            </ProtectedRoute>
          )
          },
        ]
        },
      ],
    },

    // Admin routes
    {
      path: "/admin",
      children: [
        { path: "login", element: <AdminLogin /> },
        { path: "register", element: <AdminRegister /> },
         { 
          element: <AdminLayout />,
          children: [
            { path: "", element: (
            <ProtectedRoute role="admin">
              <Dashboard /> 
            </ProtectedRoute>
            )
            },
            { path: "products", element: (
            <ProtectedRoute role="admin">
              <AdminProducts /> 
            </ProtectedRoute>
            )
            },
            { path: "products/add", element: (
            <ProtectedRoute role="admin">
              <AddProduct /> 
            </ProtectedRoute>
            )
            },
            { path: "product/edit/:id", element: (
            <ProtectedRoute role="admin">
              <EditProduct /> 
            </ProtectedRoute>
            )
            },
            { path: "product/view/:id", element: (
            <ProtectedRoute role="admin">
              <ProductView /> 
            </ProtectedRoute>
            )
            },
            { path: "orders", element: (
            <ProtectedRoute role="admin">
              <AdminOrders /> 
            </ProtectedRoute>
            )
            },
            { path: "users", element: (
            <ProtectedRoute role="admin">
              <AdminUsers /> 
            </ProtectedRoute>
            )
            },
             { path: "profile", element: (
            <ProtectedRoute role="admin">
              <AdminProfile /> 
            </ProtectedRoute>
            )
            },
            { path: "settings", element: (
            <ProtectedRoute role="admin">
              <AdminSettings /> 
            </ProtectedRoute>
            )
            },
          ]
        }
      ],
    },
  ]);

  return (
    <>
    <Toaster position="bottom-right" reverseOrder={false} />
    <RouterProvider
      router={router}
      future={{ v7_startTransition: true }}
    />
    </>
  );
}

export default App;
