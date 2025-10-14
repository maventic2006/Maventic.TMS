import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import store from "./redux/store";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./features/auth/LoginPage";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import Dashboard from "./features/dashboard/Dashboard";
import IndentPage from "./features/indent/IndentPage";
import TMSLandingPage from "./pages/TMSLandingPage";
import CreateTransporterPage from "./features/transporter/CreateTransporterPage";
import { verifyToken, logoutUser } from "./redux/slices/authSlice";
import { USER_ROLES } from "./utils/constants";
import "./index.css";

// Auth Initializer component
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Only run verification once on app start
    if (!hasInitialized) {
      console.log("🔄 Initializing authentication...");
      dispatch(verifyToken()).finally(() => {
        console.log("✅ Authentication initialization complete");
        setHasInitialized(true);
      });
    }
  }, [dispatch, hasInitialized]);

  // Add a helper function to clear session (for testing)
  useEffect(() => {
    // Check if we need to clear session (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("clear") === "true") {
      // For cookie-based auth, we need to call logout endpoint to clear cookies
      dispatch(logoutUser()).then(() => {
        window.location.href = "/";
      });
    }
  }, [dispatch]);

  return children;
};

// Page Wrapper for smooth transitions
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

// Default Route component - handles initial routing based on auth status
const DefaultRoute = () => {
  const { isAuthenticated, isLoading, user } = useSelector(
    (state) => state.auth
  );

  // Check if user came from a fresh browser session (no authentication context)
  // This ensures "/" route always goes to login first for security
  const hasAuthenticationContext = isAuthenticated && user;

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-gradient-to-br from-primary-background via-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-accent mx-auto mb-6"></div>
            <p className="text-text-secondary text-lg">Initializing TMS...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Force login for root route access - security requirement
  // This ensures users must authenticate each session through login page
  console.log("DefaultRoute - Auth State:", {
    isAuthenticated,
    hasAuthenticationContext,
    user,
  });

  // Always redirect to login from root route for security
  // Users should access /tms-portal directly if they have valid sessions
  return <Navigate to="/login" replace />;
};

// Private Route Component - handles protected routes with proper authentication flow
const PrivateRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, isLoading, role, user } = useSelector(
    (state) => state.auth
  );

  // Show loading while verifying authentication
  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-gradient-to-br from-primary-background via-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-accent mx-auto mb-6"></div>
            <p className="text-text-secondary text-lg">Verifying access...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs password reset
  if (user?.password_type === "initial" || !user?.password_type) {
    // This user needs to reset their password first
    return <Navigate to={`/reset-password/${user.user_id}`} replace />;
  }

  // Check role authorization if roles are specified
  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized
  return <PageWrapper>{children}</PageWrapper>;
};

// Content component that renders based on active tab
const MainContent = () => {
  const { activeTab } = useSelector((state) => state.ui);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "indent":
        return <IndentPage />;
      case "rfq":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">RFQ Module Coming Soon</h2>
          </div>
        );
      case "contract":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Contract Module Coming Soon</h2>
          </div>
        );
      case "tracking":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Tracking Module Coming Soon</h2>
          </div>
        );
      case "epod":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">e-POD Module Coming Soon</h2>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return renderContent();
};

function App() {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <Router>
          <div className="App">
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public Routes - Always accessible */}
                <Route
                  path="/login"
                  element={
                    <PageWrapper>
                      <LoginPage />
                    </PageWrapper>
                  }
                />

                {/* Reset Password Route - Semi-protected (requires userId) */}
                <Route
                  path="/reset-password/:userId"
                  element={
                    <PageWrapper>
                      <ResetPasswordPage />
                    </PageWrapper>
                  }
                />

                {/* Protected Routes - Require full authentication and password reset */}
                <Route
                  path="/tms-portal"
                  element={
                    <PrivateRoute
                      roles={[
                        USER_ROLES.ADMIN,
                        USER_ROLES.CONSIGNOR,
                        USER_ROLES.TRANSPORTER,
                        USER_ROLES.DRIVER,
                        USER_ROLES.PRODUCT_OWNER,
                      ]}
                    >
                      <TMSLandingPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute
                      roles={[
                        USER_ROLES.ADMIN,
                        USER_ROLES.CONSIGNOR,
                        USER_ROLES.TRANSPORTER,
                        USER_ROLES.DRIVER,
                        USER_ROLES.PRODUCT_OWNER,
                      ]}
                    >
                      <Layout>
                        <MainContent />
                      </Layout>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/transporter/create"
                  element={
                    <PrivateRoute roles={[USER_ROLES.PRODUCT_OWNER]}>
                      <Layout>
                        <CreateTransporterPage />
                      </Layout>
                    </PrivateRoute>
                  }
                />

                {/* Default route - Always redirect to login */}
                <Route path="/" element={<DefaultRoute />} />

                {/* Error Pages with animations */}
                <Route
                  path="/unauthorized"
                  element={
                    <PageWrapper>
                      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                        <motion.div
                          className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="text-6xl font-bold text-red-500 mb-4">
                            403
                          </div>
                          <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Access Denied
                          </h1>
                          <p className="text-gray-600 mb-6">
                            You don't have permission to access this resource.
                          </p>
                          <button
                            onClick={() => window.history.back()}
                            className="px-6 py-2 bg-primary-accent text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Go Back
                          </button>
                        </motion.div>
                      </div>
                    </PageWrapper>
                  }
                />

                {/* 404 page with animation */}
                <Route
                  path="*"
                  element={
                    <PageWrapper>
                      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <motion.div
                          className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="text-6xl font-bold text-gray-500 mb-4">
                            404
                          </div>
                          <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Page Not Found
                          </h1>
                          <p className="text-gray-600 mb-6">
                            The page you're looking for doesn't exist.
                          </p>
                          <button
                            onClick={() => (window.location.href = "/")}
                            className="px-6 py-2 bg-primary-accent text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Go Home
                          </button>
                        </motion.div>
                      </div>
                    </PageWrapper>
                  }
                />
              </Routes>
            </AnimatePresence>
          </div>
        </Router>
      </AuthInitializer>
    </Provider>
  );
}

export default App;
