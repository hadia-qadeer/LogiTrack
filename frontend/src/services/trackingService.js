import api from './api';

export const trackingService = {
  getTrackingHistory: async (shipmentId) => {
    const response = await api.get(`/api/tracking/${shipmentId}/history`);
    return response.data;
  },

  getLatestTracking: async (shipmentId) => {
    const response = await api.get(`/api/tracking/${shipmentId}/latest`);
    return response.data;
  },
};
