import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand-logo">📦</div>
        <div>
          <div className="sidebar-brand-text">LogiTrack</div>
          <div className="sidebar-brand-sub">SaaS Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* ================= ADMIN NAVIGATION ================= */}
        {role === 'ADMIN' && (
          <>
            <div className="nav-section-title">Administration</div>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/admin/approvals"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">🛡️</span>
              <span>User Approvals</span>
            </NavLink>
            <NavLink
              to="/admin/shipments"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">📦</span>
              <span>All Shipments</span>
            </NavLink>
          </>
        )}

        {/* ================= SHIPPER NAVIGATION ================= */}
        {role === 'SHIPPER' && (
          <>
            <div className="nav-section-title">Shipper Portal</div>
            <NavLink
              to="/shipper/dashboard"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/shipper/shipments"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">📦</span>
              <span>My Shipments</span>
            </NavLink>
            <NavLink
              to="/shipper/shipments/create"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">➕</span>
              <span>Create Shipment</span>
            </NavLink>
          </>
        )}

        {/* ================= DRIVER NAVIGATION ================= */}
        {role === 'DRIVER' && (
          <>
            <div className="nav-section-title">Driver Operations</div>
            <NavLink
              to="/driver/dashboard"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/driver/available"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">🌐</span>
              <span>Available Shipments</span>
            </NavLink>
            <NavLink
              to="/driver/applications"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">📝</span>
              <span>My Applications</span>
            </NavLink>
            <NavLink
              to="/driver/deliveries"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">🚚</span>
              <span>My Deliveries</span>
            </NavLink>
            <NavLink
              to="/driver/vehicle"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">🚛</span>
              <span>Vehicle Profile</span>
            </NavLink>
          </>
        )}

        {/* ================= COMMON NAVIGATION ================= */}
        <div className="nav-section-title">Utilities</div>
        <NavLink
          to="/tracking"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">🔍</span>
          <span>Track Shipment</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge-container">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <div className="user-name" title={user?.name}>{user?.name}</div>
            <div className="user-role-tag">{user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;