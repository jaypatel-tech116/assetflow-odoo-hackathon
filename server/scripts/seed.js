require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  Department,
  AssetCategory,
  Asset,
  Allocation,
  ResourceBooking,
  MaintenanceRequest,
  AuditCycle,
  AuditCycleAuditor,
  AuditVerification,
  DiscrepancyReport,
  ActivityLog,
  Notification,
} = require('../models');

const seed = async () => {
  try {
    console.log('🔄 Connecting to database and syncing tables...');
    // Force sync to recreate tables cleanly
    await sequelize.sync({ force: true });
    console.log('✅ Database tables recreated.');

    // 1. Seed Departments
    console.log('🌱 Seeding departments...');
    const depts = await Department.bulkCreate([
      { name: 'Executive', status: 'Active' },
      { name: 'Information Technology', status: 'Active' },
      { name: 'Finance & Accounts', status: 'Active' },
      { name: 'Operations', status: 'Active' },
      { name: 'Human Resources', status: 'Active' },
    ]);
    const execDept = depts[0];
    const itDept = depts[1];
    const finDept = depts[2];
    const opsDept = depts[3];
    const hrDept = depts[4];

    // 2. Seed Users
    console.log('🌱 Seeding users (employees)...');
    const salt = await bcrypt.genSalt(12);

    const usersData = [
      {
        full_name: 'Arthur Pendragon',
        email: 'admin@assetflow.com',
        password_hash: await bcrypt.hash('Admin@12345', salt),
        role: 'Admin',
        status: 'Active',
        department_id: execDept.id,
      },
      {
        full_name: 'Guinevere Manager',
        email: 'manager@assetflow.com',
        password_hash: await bcrypt.hash('Manager@12345', salt),
        role: 'Asset Manager',
        status: 'Active',
        department_id: opsDept.id,
      },
      {
        full_name: 'Merlin Techhead',
        email: 'head@assetflow.com',
        password_hash: await bcrypt.hash('Head@12345', salt),
        role: 'Department Head',
        status: 'Active',
        department_id: itDept.id,
      },
      {
        full_name: 'Lancelot Employee',
        email: 'employee@assetflow.com',
        password_hash: await bcrypt.hash('Employee@12345', salt),
        role: 'Employee',
        status: 'Active',
        department_id: itDept.id,
      },
      {
        full_name: 'Gawain Staff',
        email: 'gawain@assetflow.com',
        password_hash: await bcrypt.hash('Employee@12345', salt),
        role: 'Employee',
        status: 'Active',
        department_id: finDept.id,
      },
    ];

    const users = await User.bulkCreate(usersData);
    const adminUser = users[0];
    const managerUser = users[1];
    const headUser = users[2];
    const empUser = users[3];
    const finUser = users[4];

    // Update department heads
    await itDept.update({ department_head_id: headUser.id });
    await finDept.update({ department_head_id: finUser.id }); // temporarily finUser is head
    await opsDept.update({ department_head_id: managerUser.id });

    // 3. Seed Asset Categories
    console.log('🌱 Seeding asset categories...');
    const categories = await AssetCategory.bulkCreate([
      { name: 'Laptops & Computers', description: 'Employee workstation laptops, desktops, and servers' },
      { name: 'Office Furniture', description: 'Desks, ergonomic chairs, tables, and cabinets' },
      { name: 'Bookable Meeting Rooms', description: 'Conference halls and quiet rooms', custom_fields: { type: 'Room', screen: 'Boolean' } },
      { name: 'AV & Presentation Gear', description: 'Projectors, microphones, and camera equipment' },
    ]);
    const catLaptop = categories[0];
    const catFurniture = categories[1];
    const catRooms = categories[2];
    const catAV = categories[3];

    // 4. Seed Assets
    console.log('🌱 Seeding assets...');
    const assetsData = [
      {
        asset_tag: 'AF-0001',
        name: 'MacBook Pro 16" M3',
        category_id: catLaptop.id,
        serial_number: 'C02F1234Q05D',
        acquisition_date: '2025-01-15',
        acquisition_cost: 2499.00,
        condition: 'New',
        location: 'HQ Floor 3 - IT Desk',
        department_id: itDept.id,
        is_shared_bookable: false,
        status: 'Allocated',
        created_by: adminUser.id,
      },
      {
        asset_tag: 'AF-0002',
        name: 'Dell XPS 15 Workstation',
        category_id: catLaptop.id,
        serial_number: 'CN0XPS159981',
        acquisition_date: '2025-02-10',
        acquisition_cost: 1899.00,
        condition: 'Good',
        location: 'HQ Floor 2 - Finance',
        department_id: finDept.id,
        is_shared_bookable: false,
        status: 'Allocated',
        created_by: adminUser.id,
      },
      {
        asset_tag: 'AF-0003',
        name: 'ThinkPad T14 Gen 4',
        category_id: catLaptop.id,
        serial_number: 'PF3E998811AA',
        acquisition_date: '2025-03-01',
        acquisition_cost: 1200.00,
        condition: 'Good',
        location: 'HQ Floor 3 - IT Desk',
        department_id: itDept.id,
        is_shared_bookable: false,
        status: 'Available',
        created_by: adminUser.id,
      },
      {
        asset_tag: 'AF-0004',
        name: 'Ergonomic Mesh Office Chair',
        category_id: catFurniture.id,
        serial_number: 'FN-CH-2025-01',
        acquisition_date: '2025-01-20',
        acquisition_cost: 350.00,
        condition: 'Good',
        location: 'HQ Floor 3 - Room 302',
        department_id: itDept.id,
        is_shared_bookable: false,
        status: 'Available',
        created_by: adminUser.id,
      },
      // Shared / Bookable Resources
      {
        asset_tag: 'AF-0005',
        name: 'Conference Room Avalon',
        category_id: catRooms.id,
        serial_number: 'RM-AVALON',
        acquisition_date: '2024-06-01',
        acquisition_cost: 15000.00,
        condition: 'Good',
        location: 'HQ Floor 1 - West Wing',
        department_id: execDept.id,
        is_shared_bookable: true,
        capacity: 12,
        building_location: 'Main HQ Building, Floor 1',
        facilities: ['Large TV Screen', 'Whiteboard', 'Polycom Conference Phone', 'Air Conditioning'],
        status: 'Available',
        created_by: adminUser.id,
      },
      {
        asset_tag: 'AF-0006',
        name: 'Epson 4K Projector Pro',
        category_id: catAV.id,
        serial_number: 'EPS-4K-99221',
        acquisition_date: '2024-11-12',
        acquisition_cost: 950.00,
        condition: 'Good',
        location: 'AV Storage Room 104',
        department_id: opsDept.id,
        is_shared_bookable: true,
        capacity: null,
        building_location: 'Main HQ Building, Floor 1 AV Closet',
        facilities: ['HDMI Cable', 'Remote Control', 'Tripod Stand Included'],
        status: 'Under Maintenance',
        created_by: adminUser.id,
      },
      {
        asset_tag: 'AF-0007',
        name: 'Meeting Room Camelot',
        category_id: catRooms.id,
        serial_number: 'RM-CAMELOT',
        acquisition_date: '2024-06-01',
        acquisition_cost: 12000.00,
        condition: 'Good',
        location: 'HQ Floor 2 - East Wing',
        department_id: execDept.id,
        is_shared_bookable: true,
        capacity: 6,
        building_location: 'Main HQ Building, Floor 2',
        facilities: ['Whiteboard', 'Projector Screen', 'Air Conditioning'],
        status: 'Available',
        created_by: adminUser.id,
      },
    ];

    const assets = await Asset.bulkCreate(assetsData);
    const macbook = assets[0];
    const dellXps = assets[1];
    const thinkpad = assets[2];
    const chair = assets[3];
    const roomAvalon = assets[4];
    const projector = assets[5];
    const roomCamelot = assets[6];

    // 5. Seed Allocations (inc active, overdue, returned)
    console.log('🌱 Seeding asset allocations...');
    const today = new Date();
    const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fiveDaysAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fiveDaysAhead = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await Allocation.bulkCreate([
      {
        asset_id: macbook.id,
        employee_id: empUser.id,
        allocated_on: tenDaysAgo,
        expected_return_date: fiveDaysAhead,
        status: 'Active',
        allocated_by: adminUser.id,
      },
      {
        asset_id: dellXps.id,
        employee_id: finUser.id,
        allocated_on: tenDaysAgo,
        expected_return_date: twoDaysAgo, // Overdue!
        status: 'Active',
        allocated_by: adminUser.id,
      },
      {
        asset_id: thinkpad.id,
        employee_id: empUser.id,
        allocated_on: '2024-12-01',
        expected_return_date: '2024-12-15',
        returned_on: '2024-12-14',
        condition_on_return: 'Good',
        condition_check_in_notes: 'Perfect return',
        status: 'Returned',
        allocated_by: adminUser.id,
      },
    ]);

    // 6. Seed Resource Bookings
    console.log('🌱 Seeding resource bookings...');
    const bookingStart1 = new Date();
    bookingStart1.setHours(bookingStart1.getHours() + 2);
    const bookingEnd1 = new Date();
    bookingEnd1.setHours(bookingEnd1.getHours() + 3);

    const bookingStart2 = new Date();
    bookingStart2.setDate(bookingStart2.getDate() + 1);
    bookingStart2.setHours(10, 0, 0, 0);
    const bookingEnd2 = new Date();
    bookingEnd2.setDate(bookingEnd2.getDate() + 1);
    bookingEnd2.setHours(12, 0, 0, 0);

    await ResourceBooking.bulkCreate([
      {
        resource_asset_id: roomAvalon.id,
        booked_by: empUser.id,
        department_id: itDept.id,
        start_time: bookingStart1,
        end_time: bookingEnd1,
        purpose: 'Sprint Planning Meeting',
        status: 'Upcoming',
      },
      {
        resource_asset_id: roomCamelot.id,
        booked_by: finUser.id,
        department_id: finDept.id,
        start_time: bookingStart2,
        end_time: bookingEnd2,
        purpose: 'Monthly Financial Audit Review',
        status: 'Upcoming',
      },
    ]);

    // 7. Seed Maintenance Requests
    console.log('🌱 Seeding maintenance requests...');
    await MaintenanceRequest.bulkCreate([
      {
        request_code: 'MR-0001',
        asset_id: projector.id,
        raised_by: managerUser.id,
        issue_description: 'Lamp color is flickering and fading out during presentation. Might need replacement.',
        priority: 'High',
        status: 'Approved', // Ready for technician
        raised_on: fiveDaysAgo,
      },
      {
        request_code: 'MR-0002',
        asset_id: macbook.id,
        raised_by: empUser.id,
        issue_description: 'Spacebar key gets stuck occasionally.',
        priority: 'Low',
        status: 'Pending',
        raised_on: twoDaysAgo,
      },
    ]);

    // 8. Seed Audit Cycle
    console.log('🌱 Seeding audit cycles...');
    const auditCycle = await AuditCycle.create({
      cycle_code: 'AC-2025-03-01',
      title: 'Q1 2025 IT Hardware Audit',
      scope_department_id: itDept.id,
      scope_location: null,
      start_date: '2025-03-01',
      end_date: '2025-03-15',
      status: 'In Progress',
      lead_auditor_id: managerUser.id,
      total_assets: 3, // AF-0001, AF-0003, AF-0004 belong to IT
      completed_count: 1,
    });

    await AuditCycleAuditor.create({
      audit_cycle_id: auditCycle.id,
      auditor_id: headUser.id,
    });

    await AuditVerification.create({
      audit_cycle_id: auditCycle.id,
      asset_id: thinkpad.id,
      verification_status: 'Verified',
      notes: 'Matches records perfectly',
      verified_by: headUser.id,
      verified_on: new Date(),
    });

    // 9. Seed Activity Logs
    console.log('🌱 Seeding activity logs...');
    await ActivityLog.bulkCreate([
      { user_id: adminUser.id, action: 'Registered New Asset', module: 'Assets', details: 'Registered Macbook Pro AF-0001' },
      { user_id: adminUser.id, action: 'Registered New Asset', module: 'Assets', details: 'Registered Dell XPS AF-0002' },
      { user_id: adminUser.id, action: 'Allocated Asset', module: 'Allocations', details: 'Allocated Dell XPS to Gawain' },
    ]);

    // 10. Seed Notifications
    console.log('🌱 Seeding notifications...');
    await Notification.bulkCreate([
      { user_id: empUser.id, type: 'AssetAssigned', message: 'Asset AF-0001 (MacBook Pro 16" M3) has been assigned to you', is_read: false },
      { user_id: headUser.id, type: 'RoleChanged', message: 'Your role has been updated to Department Head', is_read: false },
    ]);

    console.log('✨ Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
