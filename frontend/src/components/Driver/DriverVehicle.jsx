import React, { useState, useEffect } from 'react';
import { vehicleService } from '../../services/vehicleService';
import { useToast } from '../../context/ToastContext';

const DriverVehicle = () => {
  const [vehicle, setVehicle] = useState({
    vehicleType: '',
    licensePlate: '',
    capacity: '',
    documentUrl: '',
    verified: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const data = await vehicleService.getVehicleInfo();
        if (data) {
          setVehicle({
            vehicleType: data.vehicleType || '',
            licensePlate: data.licensePlate || '',
            capacity: data.capacity ? data.capacity.toString() : '',
            documentUrl: data.documentUrl || '',
            verified: data.verified || false,
          });
        }
      } catch (err) {
        // Vehicle might not be created yet if direct profile
        console.warn('Vehicle fetch note:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicle.vehicleType.trim() || !vehicle.licensePlate.trim() || !vehicle.capacity) {
      toast.error('Vehicle type, license plate, and capacity are required');
      return;
    }

    try {
      setSaving(true);
      await vehicleService.updateVehicleInfo({
        vehicleType: vehicle.vehicleType.trim(),
        licensePlate: vehicle.licensePlate.trim(),
        capacity: Number(vehicle.capacity),
        documentUrl: vehicle.documentUrl.trim() || undefined,
      });
      toast.success('Vehicle profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update vehicle details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading vehicle profile...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '750px' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Driver Vehicle Information</h1>
          <p className="page-subtitle">Manage your registered truck or carrier specifications visible to shippers</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">🚛 Registered Carrier Vehicle</div>
          <span
            className="status-badge"
            style={{
              backgroundColor: vehicle.verified ? '#ecfdf5' : '#fffbeb',
              color: vehicle.verified ? '#059669' : '#d97706',
              borderColor: vehicle.verified ? '#a7f3d0' : '#fde68a',
            }}
          >
            ● {vehicle.verified ? 'Verified Vehicle' : 'Under Review'}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label htmlFor="veh-type">Vehicle Model / Type *</label>
              <input
                id="veh-type"
                type="text"
                value={vehicle.vehicleType}
                onChange={(e) => setVehicle((v) => ({ ...v, vehicleType: e.target.value }))}
                placeholder="e.g., Isuzu NPR Box Truck, 22ft Flatbed"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label htmlFor="veh-plate">License Plate Number *</label>
                <input
                  id="veh-plate"
                  type="text"
                  value={vehicle.licensePlate}
                  onChange={(e) => setVehicle((v) => ({ ...v, licensePlate: e.target.value }))}
                  placeholder="e.g., ABC-9876"
                  required
                />
              </div>

              <div>
                <label htmlFor="veh-capacity">Maximum Payload Capacity (kg) *</label>
                <input
                  id="veh-capacity"
                  type="number"
                  min="1"
                  value={vehicle.capacity}
                  onChange={(e) => setVehicle((v) => ({ ...v, capacity: e.target.value }))}
                  placeholder="e.g., 6500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="veh-doc">Registration / Document URL (Optional)</label>
              <input
                id="veh-doc"
                type="url"
                value={vehicle.documentUrl}
                onChange={(e) => setVehicle((v) => ({ ...v, documentUrl: e.target.value }))}
                placeholder="https://example.com/documents/registration.pdf"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary btn-lg"
              >
                {saving ? 'Saving Profile...' : 'Save Vehicle Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverVehicle;
