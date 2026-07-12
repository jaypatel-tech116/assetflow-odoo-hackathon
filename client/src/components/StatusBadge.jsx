import './StatusBadge.css';

const statusColors = {
  'Available': 'green', 'Verified': 'green', 'Resolved': 'green', 'Approved': 'green', 'Active': 'green', 'Completed': 'green', 'Returned': 'green', 'Closed': 'green',
  'Allocated': 'blue', 'Upcoming': 'blue', 'In Progress': 'blue', 'Ongoing': 'blue', 'Scheduled': 'blue', 'Technician Assigned': 'blue',
  'Reserved': 'purple', 'In Review': 'purple',
  'Under Maintenance': 'orange', 'Pending': 'orange', 'Requested': 'orange', 'Medium': 'orange',
  'Lost': 'red', 'Missing': 'red', 'Rejected': 'red', 'Overdue': 'red', 'Damaged': 'red', 'High': 'red', 'Cancelled': 'red',
  'Retired': 'gray', 'Inactive': 'gray', 'Low': 'gray',
  'Disposed': 'dark', 'Re-allocated': 'blue',
};

export default function StatusBadge({ status }) {
  const colorClass = statusColors[status] || 'gray';
  return <span className={`status-badge status-badge--${colorClass}`}>{status}</span>;
}
