import api from './api';

export const vehicleService = {
  getVehicleInfo: async () => {
    const response = await api.get('/api/drivers/vehicle');
    return response.data;
  },

  updateVehicleInfo: async ({ vehicleType, licensePlate, capacity, documentUrl }) => {
    const response = await api.patch('/api/drivers/vehicle', {
      vehicleType,
      licensePlate,
      capacity: Number(capacity),
      documentUrl,
    });
    return response.data;
  },
};
