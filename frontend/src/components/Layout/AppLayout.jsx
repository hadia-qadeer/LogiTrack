import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../hooks/useAuth';

const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        {user && !user.approved && user.role !== 'ADMIN' && (
          <div
            style={{
              backgroundColor: '#fffbeb',
              borderBottom: '1px solid #fde68a',
              color: '#92400e',
              padding: '0.75rem 2rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <strong>Account Pending Approval:</strong> Your account is awaiting administrator review. 
              {user.role === 'SHIPPER' && ' You can browse the platform, but cannot create shipments until approved.'}
              {user.role === 'DRIVER' && ' You can browse open shipments, but cannot submit applications until approved.'}
            </div>
            {user.rejectionReason && (
              <span style={{ color: '#dc2626', fontWeight: 600 }}>
                Previous Reason: {user.rejectionReason}
              </span>
            )}
          </div>
        )}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
