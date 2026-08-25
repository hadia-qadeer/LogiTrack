import React from 'react';
import { render, screen } from '@testing-library/react';
import { ToastProvider } from './context/ToastContext';
import { STATUS_BADGES, USER_ROLES, VALID_STATUS_TRANSITIONS } from './utils/constants';

describe('LogiTrack Constants & Architecture Validation', () => {
  test('verifies only 3 roles exist in constants', () => {
    expect(USER_ROLES).toEqual({
      ADMIN: 'ADMIN',
      SHIPPER: 'SHIPPER',
      DRIVER: 'DRIVER',
    });
    expect(USER_ROLES.MANAGER).toBeUndefined();
  });

  test('verifies strict shipment state machine transitions', () => {
    expect(VALID_STATUS_TRANSITIONS.AVAILABLE).toEqual([]);
    expect(VALID_STATUS_TRANSITIONS.ASSIGNED).toEqual(['IN_TRANSIT']);
    expect(VALID_STATUS_TRANSITIONS.IN_TRANSIT).toEqual(['DELIVERED', 'FAILED']);
    expect(VALID_STATUS_TRANSITIONS.DELIVERED).toEqual([]);
    expect(VALID_STATUS_TRANSITIONS.FAILED).toEqual([]);
    expect(VALID_STATUS_TRANSITIONS.CANCELLED).toEqual([]);
  });

  test('verifies all status badges are mapped', () => {
    expect(STATUS_BADGES.AVAILABLE.label).toBe('Available');
    expect(STATUS_BADGES.ASSIGNED.label).toBe('Assigned');
    expect(STATUS_BADGES.IN_TRANSIT.label).toBe('In Transit');
    expect(STATUS_BADGES.DELIVERED.label).toBe('Delivered');
    expect(STATUS_BADGES.FAILED.label).toBe('Failed');
  });

  test('renders ToastProvider successfully', () => {
    render(
      <ToastProvider>
        <div>Test Child Component</div>
      </ToastProvider>
    );
    expect(screen.getByText('Test Child Component')).toBeInTheDocument();
  });
});
