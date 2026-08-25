import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { STATUS_COLORS } from '../../utils/constants';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getStats();
      setStats(response);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="error-message">Failed to load dashboard</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-label">Total Shipments</div>
            <div className="stat-value">{stats.totalShipments}</div>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{stats.statistics.pending}</div>
          </div>
        </div>

        <div className="stat-card transit">
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <div className="stat-label">In Transit</div>
            <div className="stat-value">{stats.statistics.inTransit}</div>
          </div>
        </div>

        <div className="stat-card delivered">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Delivered</div>
            <div className="stat-value">{stats.statistics.delivered}</div>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Avg Delivery Time</div>
          <div className="metric-value">
            {stats.metrics.averageDeliveryDays.toFixed(1)} days
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">On-Time Delivery</div>
          <div className="metric-value">
            {stats.metrics.onTimeDelivery}%
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Success Rate</div>
          <div className="metric-value">
            {stats.metrics.deliverySuccess}%
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Shipments by Status</h3>
          <div className="chart">
            {Object.entries(stats.chartData.byStatus).map(([status, count]) => (
              <div key={status} className="chart-row">
                <div className="chart-label">{status}</div>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      width: `${(count / stats.totalShipments) * 100}%`,
                      backgroundColor: STATUS_COLORS[status],
                    }}
                  ></div>
                </div>
                <div className="chart-value">{count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Shipments by Destination</h3>
          <div className="chart">
            {Object.entries(stats.chartData.byCity)
              .slice(0, 5)
              .map(([city, count]) => (
                <div key={city} className="chart-row">
                  <div className="chart-label">{city}</div>
                  <div className="chart-value">{count}</div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="recent-shipments">
        <h3>Recent Shipments</h3>
        {stats.recent.length > 0 ? (
          <table className="recent-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Status</th>
                <th>Value</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((shipment) => (
                <tr key={shipment.id}>
                  <td>{`${shipment.fromCity} → ${shipment.toCity}`}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: STATUS_COLORS[shipment.status],
                      }}
                    >
                      {shipment.status}
                    </span>
                  </td>
                  <td>PKR {shipment.value}</td>
                  <td>{new Date(shipment.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No recent shipments</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;