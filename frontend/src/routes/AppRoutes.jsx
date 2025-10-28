import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Import pages
import TMSLandingPage from '../pages/TMSLandingPage';
import TransporterMaintenance from '../pages/TransporterMaintenance';
import TransporterDetails from '../pages/TransporterDetails';
import LoginPage from '../features/auth/LoginPage';
import Dashboard from '../features/dashboard/Dashboard';
import IndentPage from '../features/indent/IndentPage';

// Protected Route component
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
      />
      
      {/* Landing Page */}
      <Route 
        path="/" 
        element={<TMSLandingPage />} 
      />

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
            <div className="min-h-screen bg-primary-background p-4">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-text-primary mb-6">Create New Transporter</h1>
                <div className="bg-card-background rounded-lg shadow-sm border border-gray-200 p-6">
                  <p className="text-text-secondary">Create transporter form coming soon...</p>
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/transporter/:id" 
        element={
          <ProtectedRoute>
            <TransporterDetails />
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
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
};

export default AppRoutes;
