import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(() => authService.getUser());
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());

  const syncAuthState = useCallback(async () => {
    const token = authService.getToken();
    const savedUser = authService.getUser();

    if (token && savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
      try {
        const freshProfile = await authService.getProfile();
        authService.saveUser(freshProfile);
        setUser(freshProfile);
      } catch (err) {
        if (err.response?.status === 401) {
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    syncAuthState();
    window.addEventListener('auth-change', syncAuthState);
    return () => window.removeEventListener('auth-change', syncAuthState);
  }, [syncAuthState]);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    authService.saveToken(data.access_token);
    authService.saveUser(data.user);
    setUser(data.user);
    setIsAuthenticated(true);
    window.dispatchEvent(new Event('auth-change'));
    return data;
  };

  const registerShipper = async (formData) => {
    const data = await authService.registerShipper(formData);
    if (data.token) {
      authService.saveToken(data.token);
      authService.saveUser(data.user);
      setUser(data.user);
      setIsAuthenticated(true);
      window.dispatchEvent(new Event('auth-change'));
    }
    return data;
  };

  const registerDriver = async (formData) => {
    const data = await authService.registerDriver(formData);
    if (data.token) {
      authService.saveToken(data.token);
      authService.saveUser(data.user);
      setUser(data.user);
      setIsAuthenticated(true);
      window.dispatchEvent(new Event('auth-change'));
    }
    return data;
  };

  const refreshProfile = async () => {
    try {
      const freshUser = await authService.getProfile();
      authService.saveUser(freshUser);
      setUser(freshUser);
      return freshUser;
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('auth-change'));
  };

  const getRoleHome = (role) => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'SHIPPER':
        return '/shipper/dashboard';
      case 'DRIVER':
        return '/driver/dashboard';
      default:
        return '/login';
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    registerShipper,
    registerDriver,
    refreshProfile,
    logout,
    getRoleHome,
  };
};