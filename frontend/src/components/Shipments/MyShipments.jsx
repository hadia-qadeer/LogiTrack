import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { shipmentService } from '../../services/shipmentService';
import { STATUS_COLORS } from '../../utils/constants';
import './Shipments.css';

const MyShipments = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyShipments = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await shipmentService.getShipmentsByDriver(user.id);
        setShipments(response);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || 'Failed to load shipments',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyShipments();
  }, [user?.id]);

  if (loading) return <div className="loading">Loading your shipments...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="shipment-list-container">
      <div className="list-header">
        <h2>My Shipments</h2>
      </div>

      {shipments.length === 0 ? (
        <div className="empty-state">No shipments assigned to you</div>
      ) : (
        <table className="shipment-table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Weight</th>
              <th>Value</th>
              <th>Status</th>
              <th>Expected Delivery</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment.id}>
                <td>{shipment.fromCity} to {shipment.toCity}</td>
                <td>{shipment.weight} kg</td>
                <td>PKR {shipment.value}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: STATUS_COLORS[shipment.status] }}
                  >
                    {shipment.status}
                  </span>
                </td>
                <td>
                  {shipment.expectedDelivery
                    ? new Date(shipment.expectedDelivery).toLocaleDateString()
                    : 'Not set'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyShipments;
