import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import './Auth.css';

const Register = () => {
  const [role, setRole] = useState('SHIPPER'); // 'SHIPPER' | 'DRIVER'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    // Driver-specific fields
    vehicleType: '',
    licensePlate: '',
    capacity: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registerShipper, registerDriver, getRoleHome } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (role === 'DRIVER') {
      if (!formData.phone.trim()) {
        setError('Phone number is required for drivers');
        return;
      }
      if (!formData.vehicleType.trim() || !formData.licensePlate.trim() || !formData.capacity) {
        setError('Please provide complete vehicle details (type, license plate, capacity)');
        return;
      }
      if (Number(formData.capacity) <= 0) {
        setError('Vehicle capacity must be greater than 0');
        return;
      }
    }

    try {
      setLoading(true);
      if (role === 'SHIPPER') {
        await registerShipper({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim() || undefined,
        });
        toast.success('Registration successful! Welcome to LogiTrack.');
        navigate(getRoleHome('SHIPPER'));
      } else {
        await registerDriver({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          vehicleType: formData.vehicleType.trim(),
          licensePlate: formData.licensePlate.trim(),
          capacity: Number(formData.capacity),
        });
        toast.success('Registration successful! Your driver account is awaiting approval.');
        navigate(getRoleHome('DRIVER'));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div className="auth-logo">📦</div>
          <h1>Create Account</h1>
          <h2>Join the LogiTrack Logistics Network</h2>
        </div>

        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab-btn ${role === 'SHIPPER' ? 'active' : ''}`}
            onClick={() => { setRole('SHIPPER'); setError(''); }}
          >
            🏢 I am a Shipper
          </button>
          <button
            type="button"
            className={`role-tab-btn ${role === 'DRIVER' ? 'active' : ''}`}
            onClick={() => { setRole('DRIVER'); setError(''); }}
          >
            🚚 I am a Driver
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div>
              <label htmlFor="reg-name">Full Name *</label>
              <input
                id="reg-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={role === 'SHIPPER' ? 'Acme Corp / John Doe' : 'John Smith'}
                required
              />
            </div>

            <div>
              <label htmlFor="reg-phone">Phone Number {role === 'DRIVER' && '*'}</label>
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-0000"
                required={role === 'DRIVER'}
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email">Email Address *</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="reg-password">Password (min 6 characters) *</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {role === 'DRIVER' && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1rem',
              marginTop: '0.5rem',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                🚛 Vehicle Details (Required for Driver Approval)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label htmlFor="reg-vehicleType">Vehicle Type *</label>
                  <input
                    id="reg-vehicleType"
                    name="vehicleType"
                    type="text"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    placeholder="e.g., Box Truck, Flatbed, Van"
                    required
                  />
                </div>

                <div className="form-row">
                  <div>
                    <label htmlFor="reg-licensePlate">License Plate *</label>
                    <input
                      id="reg-licensePlate"
                      name="licensePlate"
                      type="text"
                      value={formData.licensePlate}
                      onChange={handleInputChange}
                      placeholder="e.g., ABC-1234"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-capacity">Max Capacity (kg) *</label>
                    <input
                      id="reg-capacity"
                      name="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      placeholder="e.g., 5000"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'SHIPPER' ? 'Shipper' : 'Driver'}`}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;