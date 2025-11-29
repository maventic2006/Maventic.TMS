import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, isLoading, role } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  console.log("🔒 ProtectedRoute - Auth Check:", {
    isAuthenticated,
    isLoading,
    role,
    requiredRoles: roles,
    currentPath: location.pathname,
    timestamp: new Date().toISOString()
  });

  // Show loading while verifying token
  if (isLoading) {
    console.log("⏳ ProtectedRoute - Showing loading state");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("❌ ProtectedRoute - Not authenticated, redirecting to login");
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(role)) {
    console.log("🚫 ProtectedRoute - Role check failed:", {
      userRole: role,
      requiredRoles: roles,
      hasRequiredRole: roles.includes(role)
    });
    // User doesn't have the required role
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("✅ ProtectedRoute - Authentication and authorization passed, rendering children");
  return children;
};

export default ProtectedRoute;
