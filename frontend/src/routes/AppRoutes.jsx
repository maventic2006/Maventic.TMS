import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Import pages
import TMSLandingPage from "../pages/TMSLandingPage";
import TransporterMaintenance from "../pages/TransporterMaintenance";
import WarehouseMaintenance from "../pages/WarehouseMaintenance";
import VehicleMaintenance from "../pages/VehicleMaintenance";
import DriverMaintenance from "../pages/DriverMaintenance";
import LoginPage from "../features/auth/LoginPage";
import Dashboard from "../features/dashboard/Dashboard";
import IndentPage from "../features/indent/IndentPage";
import TransporterDetailsPage from "../features/transporter/TransporterDetailsPage";
import CreateTransporterPage from "../features/transporter/CreateTransporterPage";
import VehicleDetailsPage from "../features/vehicle/VehicleDetailsPage";
import CreateVehiclePage from "../features/vehicle/CreateVehiclePage";
import DriverDetailsPage from "../features/driver/pages/DriverDetailsPage";
import DriverCreatePage from "../features/driver/pages/DriverCreatePage";
import WarehouseCreatePage from "../features/warehouse/pages/WarehouseCreatePage";
import WarehouseDetails from "../pages/WarehouseDetails";
import ConsignorMaintenance from "../pages/ConsignorMaintenance";
import ConsignorDetailsPage from "../features/consignor/pages/ConsignorDetailsPage";
import ConsignorCreatePage from "../features/consignor/pages/ConsignorCreatePage";
import SuperAdminApprovalList from "../pages/SuperAdminApprovalList";
import ConfigurationPage from "../pages/ConfigurationPage";
import ConfigurationListPage from "../pages/ConfigurationListPage";
import ConsignorConfigurationPage from "../pages/ConsignorConfigurationPage";
import ConsignorConfigurationListPage from "../pages/ConsignorConfigurationListPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import TransporterVehicleConfigPage from "../features/transporterVehicleConfig";

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

      {/* Landing Page - Protected */}
      <Route
        path="/"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <TMSLandingPage />
          </ProtectedRoute>
        }
      />

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

      {/* Vehicle Management Routes */}
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <VehicleMaintenance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vehicle/create"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <CreateVehiclePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vehicle/:id"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <VehicleDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Driver Management Routes */}
      <Route
        path="/drivers"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <DriverMaintenance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/create"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <DriverCreatePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/:id"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <DriverDetailsPage />
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

      {/* Consignor Management Routes */}
      <Route
        path="/consignor"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <ConsignorMaintenance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/consignor/create"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <ConsignorCreatePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/consignor/details/:id"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <ConsignorDetailsPage />
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

      {/* Super Admin Approval List */}
      <Route
        path="/approvals/super-admin"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <SuperAdminApprovalList />
          </ProtectedRoute>
        }
      />

      {/* Master Configuration Management */}
      <Route
        path="/configurations"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <ConfigurationListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/configuration/:configName"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <ConfigurationPage />
          </ProtectedRoute>
        }
      />

      {/* Consignor Configuration Management */}
      <Route
        path="/consignor-configurations"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <ConsignorConfigurationListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/consignor-configuration/:configName"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <ConsignorConfigurationPage />
          </ProtectedRoute>
        }
      />

      {/* Unauthorized Access Page */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Transporter Configuration - Transporter Vehicle Configured Data */}
      <Route
        path="/transporter-configuration/tv-config-data"
        element={
          <ProtectedRoute roles={["product_owner"]}>
            <TransporterVehicleConfigPage />
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
