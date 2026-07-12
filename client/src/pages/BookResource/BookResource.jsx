import { useState, useEffect } from 'react';
import { getAvailableResources, createBooking, getMyBookings } from '../../services/employeeService';
import './BookResource.css';

const RESOURCE_TYPES = ['Meeting Room', 'Conference Hall', 'Company Car', 'Equipment'];

export default function BookResource() {
  const [step, setStep] = useState(1);
  const [resources, setResources] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [selectedType]);

  const fetchResources = async () => {
    try {
      const params = {};
      if (selectedType) params.type = selectedType;
      const data = await getAvailableResources(params);
      setResources(data.resources || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings({ limit: 20 });
      setBookings(data.bookings || []);
      setShowBookings(true);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSelectResource = (resource) => {
    setSelectedResource(resource);
    setStep(2);
    setError('');
  };

  const handleNextToConfirm = () => {
    if (!bookingDate || !startTime || !endTime) {
      setError('Please select date and time');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!purpose.trim()) {
      setError('Please enter a purpose');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await createBooking({
        resource_id: selectedResource.id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        purpose: purpose.trim(),
      });
      setSuccess('Booking created successfully!');
      setTimeout(() => {
        setStep(1);
        setSelectedResource(null);
        setBookingDate('');
        setStartTime('');
        setEndTime('');
        setPurpose('');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '–';
    return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Meeting Room':
        return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
      case 'Conference Hall':
        return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
      case 'Company Car':
        return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5"><path d="M7 17m-2 0a2 2 0 104 0 2 2 0 10-4 0" /><path d="M17 17m-2 0a2 2 0 104 0 2 2 0 10-4 0" /><path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 012 2v4h-2" /><line x1="9" y1="17" x2="15" y2="17" /></svg>;
      default:
        return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>;
    }
  };

  return (
    <div className="book-resource-page">
      <div className="page-header">
        <div>
          <h1>Book a Resource</h1>
          <p>Reserve a room, vehicle or equipment.</p>
        </div>
        <button className="btn-outline" onClick={fetchBookings}>
          {showBookings ? 'Hide My Bookings' : 'View My Bookings'}
        </button>
      </div>

      {/* Step Indicator */}
      <div className="steps-indicator">
        <div className={`step ${step >= 1 ? 'step--active' : ''}`}>
          <span className="step-num">1</span>
          <span className="step-label">Select Resource</span>
        </div>
        <div className="step-line" />
        <div className={`step ${step >= 2 ? 'step--active' : ''}`}>
          <span className="step-num">2</span>
          <span className="step-label">Select Date & Time</span>
        </div>
        <div className="step-line" />
        <div className={`step ${step >= 3 ? 'step--active' : ''}`}>
          <span className="step-num">3</span>
          <span className="step-label">Confirm Booking</span>
        </div>
      </div>

      {error && <div className="book-error">{error}</div>}
      {success && <div className="book-success">{success}</div>}

      {/* Step 1: Select Resource */}
      {step === 1 && (
        <div className="book-step">
          <h2>Select Resource</h2>
          <div className="type-filter">
            <button className={!selectedType ? 'active' : ''} onClick={() => setSelectedType('')}>All</button>
            {RESOURCE_TYPES.map((t) => (
              <button key={t} className={selectedType === t ? 'active' : ''} onClick={() => setSelectedType(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="resources-grid">
            {resources.length > 0 ? resources.map((r) => (
              <div key={r.id} className="resource-card" onClick={() => handleSelectResource(r)}>
                <div className="resource-card-icon">{getTypeIcon(r.type)}</div>
                <h3>{r.name}</h3>
                <p className="resource-card-location">{r.location || r.type}{r.floor ? `, ${r.floor}` : ''}</p>
                <span className="resource-avail">Available</span>
              </div>
            )) : (
              <p className="no-resources">No resources available</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && (
        <div className="book-step">
          <h2>Select Date & Time</h2>
          <p className="selected-resource-info">Resource: <strong>{selectedResource?.name}</strong></p>
          <div className="datetime-form">
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="step-actions">
            <button className="btn-outline" onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary" onClick={handleNextToConfirm}>Next: Select Date & Time →</button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="book-step">
          <h2>Confirm Booking</h2>
          <div className="confirm-summary">
            <div className="confirm-row"><span>Resource:</span><strong>{selectedResource?.name}</strong></div>
            <div className="confirm-row"><span>Type:</span><strong>{selectedResource?.type}</strong></div>
            <div className="confirm-row"><span>Date:</span><strong>{formatDate(bookingDate)}</strong></div>
            <div className="confirm-row"><span>Time:</span><strong>{startTime} - {endTime}</strong></div>
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Purpose *</label>
            <input type="text" placeholder="e.g., Team Standup, Project Discussion" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div className="step-actions">
            <button className="btn-outline" onClick={() => setStep(2)}>Back</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}

      {/* My Bookings Table */}
      {showBookings && (
        <div className="book-step" style={{ marginTop: 24 }}>
          <h2>My Bookings</h2>
          <div className="assets-card">
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length > 0 ? bookings.map((b) => (
                    <tr key={b.id}>
                      <td>{b.resource?.name || '–'}</td>
                      <td>{formatDate(b.booking_date)}</td>
                      <td>{b.start_time} - {b.end_time}</td>
                      <td>{b.purpose}</td>
                      <td><span className={`badge-status status-${b.status?.toLowerCase()}`}>{b.status}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="empty-row">No bookings yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

