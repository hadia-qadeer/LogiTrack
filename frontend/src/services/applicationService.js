import api from './api';

export const applicationService = {
  getAvailableShipments: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters.fromCity) params.append('fromCity', filters.fromCity);
    if (filters.toCity) params.append('toCity', filters.toCity);

    const response = await api.get(`/api/applications/available?${params.toString()}`);
    return response.data;
  },

  applyForShipment: async (shipmentId, { proposedPrice, message }) => {
    const response = await api.post(`/api/applications/shipments/${shipmentId}/apply`, {
      proposedPrice: proposedPrice ? parseFloat(proposedPrice) : undefined,
      message: message || undefined,
    });
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/api/applications/my-applications');
    return response.data;
  },

  withdrawApplication: async (shipmentId) => {
    const response = await api.delete(`/api/applications/shipments/${shipmentId}/apply`);
    return response.data;
  },

  getShipmentApplications: async (shipmentId) => {
    const response = await api.get(`/api/applications/shipments/${shipmentId}/applications`);
    return response.data;
  },

  acceptApplication: async (shipmentId, applicationId) => {
    const response = await api.patch(
      `/api/applications/shipments/${shipmentId}/applications/${applicationId}/accept`
    );
    return response.data;
  },

  rejectApplication: async (shipmentId, applicationId) => {
    const response = await api.patch(
      `/api/applications/shipments/${shipmentId}/applications/${applicationId}/reject`
    );
    return response.data;
  },
};
