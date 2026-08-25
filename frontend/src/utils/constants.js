export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SHIPPER: 'SHIPPER',
  DRIVER: 'DRIVER',
};

export const SHIPMENT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  ASSIGNED: 'ASSIGNED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

export const APPLICATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

export const STATUS_LABELS = {
  AVAILABLE: 'Available',
  ASSIGNED: 'Assigned',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

export const STATUS_COLORS = {
  AVAILABLE: '#2563eb',
  ASSIGNED: '#7c3aed',
  IN_TRANSIT: '#d97706',
  DELIVERED: '#059669',
  FAILED: '#dc2626',
  CANCELLED: '#64748b',
};

export const STATUS_BADGES = {
  AVAILABLE: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'Available' },
  ASSIGNED: { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe', label: 'Assigned' },
  IN_TRANSIT: { bg: '#fffbeb', text: '#b45309', border: '#fde68a', label: 'In Transit' },
  DELIVERED: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', label: 'Delivered' },
  FAILED: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', label: 'Failed' },
  CANCELLED: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', label: 'Cancelled' },
};

export const APPLICATION_STATUS_BADGES = {
  PENDING: { bg: '#fffbeb', text: '#b45309', border: '#fde68a', label: 'Pending Review' },
  ACCEPTED: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', label: 'Accepted' },
  REJECTED: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', label: 'Rejected' },
};

export const VALID_STATUS_TRANSITIONS = {
  AVAILABLE: [],
  ASSIGNED: ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED', 'FAILED'],
  DELIVERED: [],
  FAILED: [],
  CANCELLED: [],
};