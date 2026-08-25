import api from './api';

export const shipmentService = {
  createShipment: async (shipmentData) => {
    const response = await api.post('/api/shipments', shipmentData);
    return response.data;
  },

  getMyShipments: async (page = 1, limit = 10) => {
    const response = await api.get(`/api/shipments/my-shipments?page=${page}&limit=${limit}`);
    return response.data;
  },

  getShipmentById: async (id) => {
    const response = await api.get(`/api/shipments/${id}`);
    return response.data;
  },

  getDriverAssignedShipments: async () => {
    const response = await api.get('/api/shipments/driver/my-shipments');
    return response.data;
  },

  updateShipmentStatus: async (id, { status, location, latitude, longitude, notes }) => {
    const response = await api.patch(`/api/shipments/${id}/status`, {
      status,
      location,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      notes: notes || undefined,
    });
    return response.data;
  },

  deleteShipment: async (id) => {
    const response = await api.delete(`/api/shipments/${id}`);
    return response.data;
  },
};