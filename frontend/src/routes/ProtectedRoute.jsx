import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(role)) {
    // User doesn't have the required role
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
