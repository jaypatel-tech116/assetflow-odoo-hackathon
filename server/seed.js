/**
 * Seed script — run once to populate sample data.
 * Usage: node seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Department, Asset, Request, Resource, Booking, Notification } = require('./config/associations');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ DB synced');

    // ── Departments ──────────────────────────────────────────────────────────
    const [itDept] = await Department.findOrCreate({ where: { name: 'Computer Engineering' }, defaults: { code: 'CE', location: 'Main Building - 3rd Floor' } });
    const [hrDept] = await Department.findOrCreate({ where: { name: 'HR Department' }, defaults: { code: 'HR', location: 'Main Building - 1st Floor' } });

    // ── Users ────────────────────────────────────────────────────────────────
    const hashPwd = async (p) => bcrypt.hash(p, 12);

    const [head] = await User.findOrCreate({
      where: { email: 'rahul.sharma@company.com' },
      defaults: {
        full_name: 'Rahul Sharma',
        password_hash: await hashPwd('Admin@1234'),
        role: 'Department Head',
        department_id: itDept.id,
        designation: 'Department Head',
        phone: '+91 98765 43210',
        alternate_phone: '+91 91234 56789',
        date_of_birth: '1990-08-15',
        gender: 'Male',
        address: '123, Green Street, Ahmedabad, Gujarat - 380015, India',
        status: 'Active',
      },
    });
    console.log(`👤 Head user: rahul.sharma@company.com / Admin@1234`);

    const empData = [
      { full_name: 'Prince Roy', email: 'prince.roy@company.com', role: 'Employee', designation: 'Software Developer', phone: '+91 90000 00001' },
      { full_name: 'Amit Verma', email: 'amit.verma@company.com', role: 'Employee', designation: 'UI/UX Designer', phone: '+91 90000 00002' },
      { full_name: 'Neha Singh', email: 'neha.singh@company.com', role: 'Employee', designation: 'Frontend Developer', phone: '+91 90000 00003' },
      { full_name: 'Priya Patel', email: 'priya.patel@company.com', role: 'Employee', designation: 'QA Engineer', phone: '+91 90000 00004' },
      { full_name: 'Rahul Yadav', email: 'rahul.yadav@company.com', role: 'Employee', designation: 'Team Lead', phone: '+91 90000 00005' },
    ];

    const employees = [];
    for (const emp of empData) {
      const [e] = await User.findOrCreate({
        where: { email: emp.email },
        defaults: { ...emp, password_hash: await hashPwd('Employee@123'), department_id: itDept.id, status: 'Active' },
      });
      employees.push(e);
    }

    // ── Assets ───────────────────────────────────────────────────────────────
    const assetDefs = [
      { tag: 'AF-0012', name: 'Dell Latitude 7450', category: 'Laptop', serial_number: 'DL7450-8X2KJ3', status: 'Allocated', assigned_to: employees[0]?.id, location: 'IT Dept - 3rd Floor', acquired_on: '2024-04-20' },
      { tag: 'AF-0015', name: 'HP 24" Monitor', category: 'Monitor', serial_number: 'HP24M-9DSK21', status: 'Allocated', assigned_to: employees[1]?.id, location: 'IT Dept - 3rd Floor', acquired_on: '2024-02-12' },
      { tag: 'AF-0021', name: 'Ergonomic Chair', category: 'Furniture', serial_number: 'CH-ERG-1122', status: 'Available', location: 'IT Store Room', acquired_on: '2024-01-05' },
      { tag: 'AF-0025', name: 'HP LaserJet Pro M404', category: 'Printer', serial_number: 'PR-M404-221', status: 'Under Maintenance', location: 'IT Dept - 3rd Floor', acquired_on: '2024-03-18' },
      { tag: 'AF-0033', name: 'Epson Projector EB-X41', category: 'Projector', serial_number: 'EP-EBX41-0091', status: 'Allocated', assigned_to: employees[2]?.id, location: 'IT Dept - Meeting Room', acquired_on: '2024-04-22' },
      { tag: 'AF-0040', name: 'APC UPS 1KVA', category: 'Electrical', serial_number: 'APC1K-7782', status: 'Lost', location: null, acquired_on: '2023-12-10' },
      { tag: 'AF-0045', name: 'Meeting Table (6 Seater)', category: 'Furniture', serial_number: 'TB-6S-5544', status: 'Retired', location: null, acquired_on: '2023-11-14' },
      { tag: 'AF-0050', name: 'MacBook Pro 14"', category: 'Laptop', serial_number: 'MBP14-2024-001', status: 'Available', location: 'IT Store', acquired_on: '2024-05-01' },
      { tag: 'AF-0055', name: 'Logitech Keyboard K120', category: 'Other', serial_number: 'LGK120-991', status: 'Available', location: 'IT Store', acquired_on: '2024-01-15' },
      { tag: 'AF-0060', name: 'Dell Mouse MS116', category: 'Other', serial_number: 'DMS116-221', status: 'Allocated', assigned_to: employees[3]?.id, location: 'IT Dept', acquired_on: '2024-02-10' },
    ];

    for (const a of assetDefs) {
      await Asset.findOrCreate({ where: { tag: a.tag }, defaults: { ...a, department_id: itDept.id } });
    }
    console.log(`📦 ${assetDefs.length} assets seeded`);

    // ── Resources ─────────────────────────────────────────────────────────────
    const resourceDefs = [
      { name: 'Meeting Room A', type: 'Meeting Room', capacity: '8 People', location: 'IT Building - 3rd Floor', status: 'Available' },
      { name: 'Conference Hall', type: 'Conference Hall', capacity: '30 People', location: 'Main Building - 1st Floor', status: 'Available' },
      { name: 'Projector - EPSON X41', type: 'Projector', capacity: null, location: 'IT Store - 2nd Floor', status: 'Available' },
      { name: 'Company Car - KA01AB1234', type: 'Vehicle', capacity: '4 Seater', location: 'Transport Dept.', status: 'Available' },
      { name: 'Seminar Hall', type: 'Conference Hall', capacity: '50 People', location: 'Main Building - Ground Floor', status: 'Available' },
      { name: 'Projector - BenQ MX560', type: 'Projector', capacity: null, location: 'HR Floor - 1st Floor', status: 'Available' },
    ];

    for (const r of resourceDefs) {
      await Resource.findOrCreate({ where: { name: r.name }, defaults: r });
    }
    console.log(`🏢 ${resourceDefs.length} resources seeded`);

    // ── Requests ─────────────────────────────────────────────────────────────
    const reqDefs = [
      { request_id: 'TR-0007', type: 'Transfer', employee_id: employees[0]?.id, reason: 'Department change', notes: 'Moving to AI Team', status: 'Pending' },
      { request_id: 'RR-0005', type: 'Return', employee_id: employees[1]?.id, reason: 'Task completed', notes: 'Return after project end', status: 'Pending' },
      { request_id: 'MR-0003', type: 'Maintenance', employee_id: employees[2]?.id, reason: 'Keys not working', notes: 'Some keys are not responsive', status: 'Pending' },
      { request_id: 'BK-0004', type: 'Booking', employee_id: employees[4]?.id, reason: 'Sprint Planning', notes: 'Team meeting', status: 'Pending' },
      { request_id: 'TR-0006', type: 'Transfer', employee_id: employees[1]?.id, reason: 'Better requirements', notes: 'Needs higher config system', status: 'Pending' },
      { request_id: 'RR-0004', type: 'Return', employee_id: employees[0]?.id, reason: 'Not in use', notes: 'Projector no longer required', status: 'Pending' },
      { request_id: 'MR-0002', type: 'Maintenance', employee_id: employees[3]?.id, reason: 'Scroll issue', notes: 'Scroll wheel not working', status: 'Approved', approved_by: head.id, approved_at: new Date() },
    ];

    for (const r of reqDefs) {
      await Request.findOrCreate({ where: { request_id: r.request_id }, defaults: { ...r, department_id: itDept.id } });
    }
    console.log(`📋 ${reqDefs.length} requests seeded`);

    // ── Bookings ─────────────────────────────────────────────────────────────
    const resources = await Resource.findAll({ limit: 4 });
    const bookingDefs = [
      { booking_id: 'BK-0001', resource_id: resources[0]?.id, user_id: head.id, booking_date: '2024-05-20', start_time: '10:00:00', end_time: '11:30:00', purpose: 'Team Standup Meeting', status: 'Upcoming' },
      { booking_id: 'BK-0002', resource_id: resources[1]?.id, user_id: head.id, booking_date: '2024-05-22', start_time: '14:00:00', end_time: '16:00:00', purpose: 'Project Discussion', status: 'Upcoming' },
      { booking_id: 'BK-0003', resource_id: resources[2]?.id, user_id: head.id, booking_date: '2024-05-23', start_time: '11:00:00', end_time: '12:00:00', purpose: 'Client Presentation', status: 'Upcoming' },
      { booking_id: 'BK-0004', resource_id: resources[3]?.id, user_id: head.id, booking_date: '2024-05-24', start_time: '09:00:00', end_time: '13:00:00', purpose: 'Site Visit', status: 'Upcoming' },
    ];

    for (const b of bookingDefs) {
      if (b.resource_id) await Booking.findOrCreate({ where: { booking_id: b.booking_id }, defaults: b });
    }
    console.log(`📅 ${bookingDefs.length} bookings seeded`);

    // ── Notifications ─────────────────────────────────────────────────────────
    const notifDefs = [
      { user_id: head.id, title: 'Transfer Request Approved', body: 'Your transfer request TR-0005 has been approved.', type: 'success', is_read: false },
      { user_id: head.id, title: 'Booking Confirmed', body: 'Meeting Room A booked for 17 May 2024, 10:00 AM - 11:00 AM.', type: 'success', is_read: false },
      { user_id: head.id, title: 'Maintenance Request Raised', body: 'MR-0006 has been submitted for Laptop AF-0012.', type: 'info', is_read: true },
      { user_id: head.id, title: 'Return Request Rejected', body: 'RR-0003 was rejected. Please contact your department manager.', type: 'error', is_read: true },
      { user_id: head.id, title: 'New Asset Assigned', body: 'Dell Latitude 7450 (AF-0012) has been assigned to you.', type: 'info', is_read: true },
      { user_id: head.id, title: 'Asset Due for Return', body: 'HP 24" Monitor AF-0015 is due for return on 20 May 2024.', type: 'warning', is_read: true },
    ];

    for (const n of notifDefs) {
      await Notification.create(n);
    }
    console.log(`🔔 ${notifDefs.length} notifications seeded`);

    console.log('\n✅ Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Login credentials:');
    console.log('   Department Head: rahul.sharma@company.com / Admin@1234');
    console.log('   Employee:        prince.roy@company.com  / Employee@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    if (err.parent) console.error('MySQL:', err.parent.sqlMessage);
    process.exit(1);
  }
}

seed();
