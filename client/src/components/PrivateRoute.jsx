// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const ProtectedRoute = ({ children, role }) => {
//   const { isLoggedIn, user, loading } = useAuth();

//   if (loading) {
//     return <div>Loading...</div>; // or spinner
//   }

//   if (!isLoggedIn) {
//     return <Navigate to="/login" replace />;
//   }

//   if (role && user?.role !== role) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { isLoggedIn, user } = useAuth();

  // If not logged in → show message or redirect
  // if (!isLoggedIn || !user) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <p className="text-lg font-semibold text-red-600">
  //         Login required to access this page
  //       </p>
  //     </div>
  //   );
  // }

  if (!isLoggedIn || !user) {
    if (role === "admin") {
      return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If role required but doesn’t match → block
  if (role && user.role !== role) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg font-semibold text-red-600">
          Access denied: {role} only
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
