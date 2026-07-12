import { useState, useEffect } from 'react';
import { getBookings, createBooking, cancelBooking } from '../../services/bookingService';
import { getAssets } from '../../services/assetService';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import './ResourceBooking.css';

export default function ResourceBooking() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const fetchBookings = async (page = 1) => {
    const r = await getBookings(`page=${page}&limit=15`);
    if (r.success) { setBookings(r.bookings); setPagination(r.pagination); }
  };

  useEffect(() => {
    const init = async () => {
      const r = await getAssets('is_shared_bookable=true&limit=500');
      if (r.success) setResources(r.assets);
      await fetchBookings();
      setLoading(false);
    };
    init();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault(); setError('');
    const r = await createBooking(form);
    if (r.success) { setShowBook(false); setForm({}); fetchBookings(); }
    else setError(r.message);
  };

  const handleCancel = async (id) => { await cancelBooking(id); fetchBookings(); };

  const columns = [
    { label: 'Resource', render: r => <span className="cell-bold">{r.resource?.name}</span> },
    { label: 'Location', render: r => r.resource?.building_location || r.resource?.location || '—' },
    { label: 'Booked By', render: r => r.bookedByUser?.full_name },
    { label: 'Start', render: r => new Date(r.start_time).toLocaleString() },
    { label: 'End', render: r => new Date(r.end_time).toLocaleString() },
    { label: 'Purpose', render: r => r.purpose?.substring(0, 40) || '—' },
    { label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  if (loading) return <div className="page-loading"><div className="loading-spinner" /></div>;

  return (
    <div className="booking-page">
      <div className="page-header">
        <div><h1 className="page-title">Resource Booking</h1><p className="page-subtitle">Book shared assets like meeting rooms and equipment</p></div>
        <button className="btn-primary" onClick={() => { setShowBook(true); setForm({}); setError(''); }}>+ Book Resource</button>
      </div>

      {/* Resource cards */}
      <div className="resource-grid">
        {resources.map(r => (
          <div key={r.id} className="resource-card">
            <h4>{r.name}</h4>
            <p className="resource-location">{r.building_location || r.location || 'No location'}</p>
            {r.capacity && <span className="resource-capacity">Capacity: {r.capacity}</span>}
            <StatusBadge status={r.status} />
          </div>
        ))}
        {resources.length === 0 && <p className="text-muted">No bookable resources found. Register assets with "Shared / Bookable" enabled.</p>}
      </div>

      <h2 className="section-title">All Bookings</h2>
      <DataTable columns={columns} data={bookings} pagination={pagination} onPageChange={fetchBookings}
        actions={(row) => ['Upcoming', 'Ongoing'].includes(row.status) ? <button className="btn-sm btn-danger" onClick={() => handleCancel(row.id)}>Cancel</button> : null} />

      <Modal isOpen={showBook} onClose={() => setShowBook(false)} title="Book Resource">
        <form onSubmit={handleBook} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-group"><label>Resource *</label><select value={form.resource_asset_id || ''} onChange={e => setForm({ ...form, resource_asset_id: e.target.value })} required>
            <option value="">Select...</option>{resources.map(r => <option key={r.id} value={r.id}>{r.name} ({r.building_location || r.location || 'No location'})</option>)}
          </select></div>
          <div className="form-row">
            <div className="form-group"><label>Start Time *</label><input type="datetime-local" value={form.start_time || ''} onChange={e => setForm({ ...form, start_time: e.target.value })} required /></div>
            <div className="form-group"><label>End Time *</label><input type="datetime-local" value={form.end_time || ''} onChange={e => setForm({ ...form, end_time: e.target.value })} required /></div>
          </div>
          <div className="form-group"><label>Purpose</label><textarea value={form.purpose || ''} onChange={e => setForm({ ...form, purpose: e.target.value })} rows={3} /></div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => setShowBook(false)}>Cancel</button><button type="submit" className="btn-primary">Book</button></div>
        </form>
      </Modal>
    </div>
  );
}
