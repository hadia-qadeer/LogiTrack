import api from './api';

export const adminService = {
  getPlatformStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },

  getRecentShipments: async () => {
    const response = await api.get('/api/admin/shipments/recent');
    return response.data;
  },

  getPendingDrivers: async () => {
    const response = await api.get('/api/admin/drivers/pending');
    return response.data;
  },

  approveDriver: async (driverId) => {
    const response = await api.patch(`/api/admin/drivers/${driverId}/approve`);
    return response.data;
  },

  rejectDriver: async (driverId, reason) => {
    const response = await api.patch(`/api/admin/drivers/${driverId}/reject`, {
      reason: reason || 'Requirements not met',
    });
    return response.data;
  },

  getPendingShippers: async () => {
    const response = await api.get('/api/admin/shippers/pending');
    return response.data;
  },

  approveShipper: async (shipperId) => {
    const response = await api.patch(`/api/admin/shippers/${shipperId}/approve`);
    return response.data;
  },

  rejectShipper: async (shipperId, reason) => {
    const response = await api.patch(`/api/admin/shippers/${shipperId}/reject`, {
      reason: reason || 'Requirements not met',
    });
    return response.data;
  },
};
