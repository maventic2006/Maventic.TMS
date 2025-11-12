import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Import pages
import TMSLandingPage from "../pages/TMSLandingPage";
import TransporterMaintenance from "../pages/TransporterMaintenance";
import WarehouseMaintenance from "../pages/WarehouseMaintenance";
import LoginPage from "../features/auth/LoginPage";
import Dashboard from "../features/dashboard/Dashboard";
import IndentPage from "../features/indent/IndentPage";
import TransporterDetailsPage from "../features/transporter/TransporterDetailsPage";
import CreateTransporterPage from "../features/transporter/CreateTransporterPage";
import WarehouseCreatePage from "../features/warehouse/pages/WarehouseCreatePage";
import WarehouseDetails from "../pages/WarehouseDetails";

// Protected Route component
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <LoginPage />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Landing Page */}
      <Route path="/" element={<TMSLandingPage />} />

      {/* Protected Routes - All require product_owner role */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Transporter Management Routes */}
      <Route
        path="/transporters"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <TransporterMaintenance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transporter/create"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <CreateTransporterPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transporter/:id"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <TransporterDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Warehouse Management Routes */}
      <Route
        path="/warehouse"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <WarehouseMaintenance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/warehouse/create"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <WarehouseCreatePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/warehouse/:id"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <WarehouseDetails />
          </ProtectedRoute>
        }
      />

      {/* Other Features */}
      <Route
        path="/indent"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <IndentPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all route - redirect to dashboard if authenticated, otherwise to login */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
