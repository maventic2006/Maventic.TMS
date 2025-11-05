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
import TransporterMaintenance from "./pages/TransporterMaintenance";
import CreateTransporterPage from "./features/transporter/CreateTransporterPage";
import TransporterDetailsPage from "./features/transporter/TransporterDetailsPage";
import DriverMaintenance from "./pages/DriverMaintenance";
import DriverCreatePage from "./features/driver/pages/DriverCreatePage";
import DriverDetailsPage from "./features/driver/pages/DriverDetailsPage";
import VehicleMaintenance from "./pages/VehicleMaintenance";
import VehicleDetailsPage from "./features/vehicle/VehicleDetailsPage";
import CreateVehiclePage from "./features/vehicle/CreateVehiclePage";
import {
  verifyToken,
  logoutUser,
  setAuthInitialized,
} from "./redux/slices/authSlice";
import { USER_ROLES } from "./utils/constants";
import { GlobalDropdownProvider } from "./components/ui/Select";
import "./index.css";

// Auth Initializer component
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Backup timer - ensure initialization completes within 10 seconds no matter what
    const backupTimer = setTimeout(() => {
      if (!hasInitialized) {
        console.log(
          "⏰ Backup timer triggered - forcing initialization complete"
        );
        dispatch(setAuthInitialized());
        setHasInitialized(true);
      }
    }, 10000);

    // Check for force clear parameter and clear cookies if needed
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("clear") === "true") {
      console.log("🧹 Clearing auth cookies due to ?clear=true parameter");
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      // Remove the clear parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Only run verification once on app start
    if (!hasInitialized) {
      console.log("🔄 Initializing authentication...");

      // Check if there's an auth token cookie before attempting verification
      const hasAuthCookie = document.cookie
        .split(";")
        .some((cookie) => cookie.trim().startsWith("authToken="));

      if (hasAuthCookie) {
        console.log("🍪 Auth cookie found, verifying token...");

        // Add timeout protection for when server is down
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Token verification timeout")),
            5000
          );
        });

        Promise.race([dispatch(verifyToken()), timeoutPromise])
          .then(() => {
            console.log("✅ Token verification successful");
            dispatch(setAuthInitialized()); // Set loading to false
            clearTimeout(backupTimer);
            setHasInitialized(true);
          })
          .catch((error) => {
            console.log(
              "⚠️ Token verification failed or timed out:",
              error.message
            );
            // If verification fails or times out, set auth as initialized anyway
            dispatch(setAuthInitialized()); // Set loading to false
            clearTimeout(backupTimer);
            setHasInitialized(true);
          });
      } else {
        console.log("🚫 No auth cookie found, skipping token verification");
        dispatch(setAuthInitialized()); // Set loading to false
        clearTimeout(backupTimer);
        setHasInitialized(true);
      }
    }

    return () => clearTimeout(backupTimer);
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
      <GlobalDropdownProvider>
        <Router>
          <div className="App">
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public Routes - Always accessible */}
                <Route
                  path="/login"
                  element={
                    // <PageWrapper>
                    // </PageWrapper>
                    <LoginPage />
                  }
                />

                {/* Reset Password Route - Semi-protected (requires userId) */}
                <Route
                  path="/reset-password/:userId"
                  element={
                    // <PageWrapper>
                    // </PageWrapper>
                    <ResetPasswordPage />
                  }
                />

                {/* Protected Routes - All require product_owner role */}
                <Route
                  path="/tms-portal"
                  element={
                    <PrivateRoute roles={[USER_ROLES.PRODUCT_OWNER]}>
                      <TMSLandingPage />
                    </PrivateRoute>
                  }
                />

                {/* Alternative landing page route */}
                <Route
                  path="/landing"
                  element={
                    <PrivateRoute roles={[USER_ROLES.PRODUCT_OWNER]}>
                      <TMSLandingPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute roles={[USER_ROLES.PRODUCT_OWNER]}>
                      <Layout>
                        <MainContent />
                      </Layout>
                    </PrivateRoute>
                  }
                />

                {/* Transporter Management Routes */}
                <Route
                  path="/transporters"
                  element={
                    <PrivateRoute roles={[USER_ROLES.PRODUCT_OWNER]}>
                      <Layout>
                        <TransporterMaintenance />
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

                <Route
                  path="/transporter/:id"
                  element={
                    <PrivateRoute roles={[USER_ROLES.PRODUCT_OWNER]}>
                      <Layout>
                        <TransporterDetailsPage />
                      </Layout>
                    </PrivateRoute>
                  }
                />

                {/* Driver Management Routes */}
                <Route
                  path="/drivers"
                  element={
                    <PrivateRoute roles={[USER_ROLES.PRODUCT_OWNER]}>
                      <Layout>
                        <DriverMaintenance />
                      </Layout>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/driver/create"
                  element={
                    <PrivateRoute roles={[USER_ROLES.PRODUCT_OWNER]}>
                      <Layout>
                        <DriverCreatePage />
                      </Layout>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/driver/:id"
                  element={
                    <PrivateRoute roles={[USER_ROLES.PRODUCT_OWNER]}>
                      <Layout>
                        <DriverDetailsPage />
                      </Layout>
                    </PrivateRoute>
                  }
                />

                {/* Vehicle Management Routes */}
                <Route
                  path="/vehicles"
                  element={
                    <PrivateRoute roles={[USER_ROLES.PRODUCT_OWNER]}>
                      <Layout>
                        <VehicleMaintenance />
                      </Layout>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/vehicle/create"
                  element={
                    <PrivateRoute roles={[USER_ROLES.PRODUCT_OWNER]}>
                      <Layout>
                        <CreateVehiclePage />
                      </Layout>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/vehicle/:id"
                  element={
                    <PrivateRoute roles={[USER_ROLES.PRODUCT_OWNER]}>
                      <Layout>
                        <VehicleDetailsPage />
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
      </GlobalDropdownProvider>
      {/* <AuthInitializer>
      </AuthInitializer> */}
    </Provider>
  );
}

export default App;
