import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import store from "./redux/store";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./features/auth/LoginPage";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import Dashboard from "./features/dashboard/Dashboard";
import IndentPage from "./features/indent/IndentPage";
import { USER_ROLES } from "./utils/constants";
import "./index.css";

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
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/reset-password/:userId"
              element={<ResetPasswordPage />}
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  roles={[
                    USER_ROLES.ADMIN,
                    USER_ROLES.CONSIGNOR,
                    USER_ROLES.TRANSPORTER,
                    USER_ROLES.DRIVER,
                  ]}
                >
                  <Layout>
                    <MainContent />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Unauthorized page */}
            <Route
              path="/unauthorized"
              element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                      403
                    </h1>
                    <p className="text-xl text-muted-foreground">
                      Access Denied
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You don't have permission to access this resource.
                    </p>
                  </div>
                </div>
              }
            />

            {/* 404 page */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                      404
                    </h1>
                    <p className="text-xl text-muted-foreground">
                      Page Not Found
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      The page you're looking for doesn't exist.
                    </p>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
