import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Import pages
import TMSLandingPage from "../pages/TMSLandingPage";
import TransporterMaintenance from "../pages/TransporterMaintenance";
import LoginPage from "../features/auth/LoginPage";
import Dashboard from "../features/dashboard/Dashboard";
import IndentPage from "../features/indent/IndentPage";
import TransporterDetailsPage from "../features/transporter/TransporterDetailsPage";
import CreateTransporterPage from "../features/transporter/CreateTransporterPage";

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

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Transporter Management Routes */}
      <Route
        path="/transporters"
        element={
          <ProtectedRoute>
            <TransporterMaintenance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transporter/create"
        element={
          <ProtectedRoute>
            <CreateTransporterPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transporter/:id"
        element={
          <ProtectedRoute>
            <TransporterDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Other Features */}
      <Route
        path="/indent"
        element={
          <ProtectedRoute>
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
