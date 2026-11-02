import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './hooks/useAuth';

// Layout & Route Guards
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Public Views
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Tracking from './components/Tracking/Tracking';

// Admin Views
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminApprovals from './components/Admin/AdminApprovals';
import ShipmentDetail from './components/Shipments/ShipmentDetail';
import ShipmentList from './components/Shipments/ShipmentList';

// Shipper Views
import ShipperDashboard from './components/Shipper/ShipperDashboard';
import ShipperShipments from './components/Shipper/ShipperShipments';
import CreateShipment from './components/Shipments/CreateShipment';
import ShipperShipmentDetail from './components/Shipper/ShipperShipmentDetail';

// Driver Views
import DriverDashboard from './components/Driver/DriverDashboard';
import AvailableShipments from './components/Driver/AvailableShipments';
import DriverApplications from './components/Driver/DriverApplications';
import DriverDeliveries from './components/Driver/DriverDeliveries';
import DriverDeliveryDetail from './components/Driver/DriverDeliveryDetail';
import DriverVehicle from './components/Driver/DriverVehicle';

import './App.css';

function AppRoutes() {
  const { user, isAuthenticated, loading, getRoleHome } = useAuth();

  if (loading) {
    return (
      <div className="spinner-container" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p>Initializing LogiTrack...</p>
      </div>
    );
  }

  const roleHome = user ? getRoleHome(user.role) : '/login';

  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={roleHome} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={roleHome} replace /> : <Register />}
      />

      {/* ================= PROTECTED LAYOUT ================= */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Tracking page accessible inside layout */}
        <Route path="/tracking" element={<Tracking />} />

        {/* ---------------- ADMIN ROUTES ---------------- */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shipments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ShipmentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shipments/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ShipmentDetail />
            </ProtectedRoute>
          }
        />

        {/* ---------------- SHIPPER ROUTES ---------------- */}
        <Route
          path="/shipper/dashboard"
          element={
            <ProtectedRoute allowedRoles={['SHIPPER']}>
              <ShipperDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shipper/shipments"
          element={
            <ProtectedRoute allowedRoles={['SHIPPER']}>
              <ShipperShipments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shipper/shipments/create"
          element={
            <ProtectedRoute allowedRoles={['SHIPPER']}>
              <CreateShipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shipper/shipments/:id"
          element={
            <ProtectedRoute allowedRoles={['SHIPPER']}>
              <ShipperShipmentDetail />
            </ProtectedRoute>
          }
        />

        {/* ---------------- DRIVER ROUTES ---------------- */}
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute allowedRoles={['DRIVER']}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/available"
          element={
            <ProtectedRoute allowedRoles={['DRIVER']}>
              <AvailableShipments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/applications"
          element={
            <ProtectedRoute allowedRoles={['DRIVER']}>
              <DriverApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/deliveries"
          element={
            <ProtectedRoute allowedRoles={['DRIVER']}>
              <DriverDeliveries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/deliveries/:id"
          element={
            <ProtectedRoute allowedRoles={['DRIVER']}>
              <DriverDeliveryDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/vehicle"
          element={
            <ProtectedRoute allowedRoles={['DRIVER']}>
              <DriverVehicle />
            </ProtectedRoute>
          }
        />

        {/* Default route inside layout */}
        <Route path="/" element={<Navigate to={roleHome} replace />} />
        <Route path="*" element={<Navigate to={roleHome} replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;