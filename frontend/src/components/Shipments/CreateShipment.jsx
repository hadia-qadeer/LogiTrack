import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { useToast } from '../../context/ToastContext';

const CreateShipment = () => {
  const [formData, setFormData] = useState({
    fromCity: '',
    toCity: '',
    weight: '',
    value: '',
    expectedDelivery: '',
    items: [{ name: '', quantity: 1, description: '' }],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, description: '' }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fromCity.trim() || !formData.toCity.trim()) {
      setError('Origin and Destination cities are required');
      return;
    }

    if (formData.fromCity.trim().toLowerCase() === formData.toCity.trim().toLowerCase()) {
      setError('Origin and Destination cities must be different');
      return;
    }

    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      setError('Cargo weight must be greater than 0 kg');
      return;
    }

    if (!formData.value || parseFloat(formData.value) <= 0) {
      setError('Declared shipment value must be greater than 0 PKR');
      return;
    }

    if (formData.items.some((item) => !item.name.trim())) {
      setError('All cargo items must have a valid item name');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        fromCity: formData.fromCity.trim(),
        toCity: formData.toCity.trim(),
        weight: parseFloat(formData.weight),
        value: parseFloat(formData.value),
        items: formData.items.map((it) => ({
          name: it.name.trim(),
          quantity: Number(it.quantity) || 1,
          description: it.description?.trim() || undefined,
        })),
        expectedDelivery: formData.expectedDelivery
          ? new Date(formData.expectedDelivery).toISOString()
          : undefined,
      };

      const created = await shipmentService.createShipment(payload);
      toast.success(`Shipment created successfully! ID: ${created.id}`);
      navigate('/shipper/shipments');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create shipment. Please check your inputs.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '850px' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Create New Shipment</h1>
          <p className="page-subtitle">Post a cargo shipment to receive competitive bids from verified drivers</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/shipper/shipments')}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Route Details */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div className="card-title">📍 Route Information</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label htmlFor="ship-fromCity">Origin (From City) *</label>
              <input
                id="ship-fromCity"
                name="fromCity"
                type="text"
                value={formData.fromCity}
                onChange={handleInputChange}
                placeholder="e.g., Lahore"
                required
              />
            </div>

            <div>
              <label htmlFor="ship-toCity">Destination (To City) *</label>
              <input
                id="ship-toCity"
                name="toCity"
                type="text"
                value={formData.toCity}
                onChange={handleInputChange}
                placeholder="e.g., Karachi"
                required
              />
            </div>

            <div>
              <label htmlFor="ship-expectedDelivery">Expected Delivery Date (Optional)</label>
              <input
                id="ship-expectedDelivery"
                name="expectedDelivery"
                type="date"
                value={formData.expectedDelivery}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Cargo Specifications */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div className="card-title">⚖️ Cargo Specifications</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label htmlFor="ship-weight">Total Weight (kg) *</label>
              <input
                id="ship-weight"
                name="weight"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="e.g., 1250"
                required
              />
            </div>

            <div>
              <label htmlFor="ship-value">Estimated Value (PKR) *</label>
              <input
                id="ship-value"
                name="value"
                type="number"
                step="0.01"
                min="1"
                value={formData.value}
                onChange={handleInputChange}
                placeholder="e.g., 250000"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Package Items */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div className="card-header">
            <div className="card-title">📦 Package Items</div>
            <button
              type="button"
              onClick={addItem}
              className="btn btn-secondary btn-sm"
            >
              + Add Another Item
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {formData.items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 3fr auto',
                  gap: '0.75rem',
                  alignItems: 'center',
                  background: '#f8fafc',
                  padding: '0.85rem',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <label style={{ fontSize: '0.75rem' }}>Item Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Solar Inverters"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem' }}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem' }}>Description / Fragility</label>
                  <input
                    type="text"
                    placeholder="e.g., 5kw Hybrid Inverter, Fragile"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  />
                </div>

                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="btn btn-outline-danger btn-sm"
                    style={{ marginTop: '1.25rem' }}
                    title="Remove item"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/shipper/shipments')}
            className="btn btn-secondary btn-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
          >
            {loading ? 'Submitting Cargo...' : '🚀 Publish Shipment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateShipment;