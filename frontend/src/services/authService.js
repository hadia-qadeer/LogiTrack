import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  registerShipper: async ({ email, password, name, phone }) => {
    const response = await api.post('/api/auth/register/shipper', {
      email,
      password,
      name,
      phone: phone || undefined,
    });
    return response.data;
  },

  registerDriver: async ({
    email,
    password,
    name,
    phone,
    vehicleType,
    licensePlate,
    capacity,
  }) => {
    const response = await api.post('/api/auth/register/driver', {
      email,
      password,
      name,
      phone,
      vehicleType,
      licensePlate,
      capacity: Number(capacity),
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  saveToken: (token) => {
    localStorage.setItem('token', token);
  },

  saveUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};