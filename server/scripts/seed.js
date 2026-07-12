const bcrypt = require('bcryptjs');
const { sequelize, User, Department, AssetCategory, CustomField, Asset, Allocation, ResourceBooking, MaintenanceRequest, AuditCycle, DiscrepancyReport } = require('../models');

async function seed() {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ force: true });
    
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('password123', salt);
    
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin@assetflow.com',
      password_hash,
      role: 'Admin',
      status: 'Active'
    });
    
    const assetManager = await User.create({
      full_name: 'Asset Manager',
      email: 'manager@assetflow.com',
      password_hash,
      role: 'Asset Manager',
      status: 'Active'
    });
    
    const deptHead = await User.create({
      full_name: 'Department Head',
      email: 'head@assetflow.com',
      password_hash,
      role: 'Department Head',
      status: 'Active'
    });
    
    const employee1 = await User.create({
      full_name: 'Employee One',
      email: 'emp1@assetflow.com',
      password_hash,
      role: 'Employee',
      status: 'Active'
    });
    
    const employee2 = await User.create({
      full_name: 'Employee Two',
      email: 'emp2@assetflow.com',
      password_hash,
      role: 'Employee',
      status: 'Active'
    });

    console.log('Creating departments...');
    const itDept = await Department.create({
      name: 'Information Technology',
      head_id: deptHead.id,
      status: 'Active'
    });
    
    const hrDept = await Department.create({
      name: 'Human Resources',
      status: 'Active'
    });

    // Update users with departments
    await deptHead.update({ department_id: itDept.id });
    await employee1.update({ department_id: itDept.id });
    await employee2.update({ department_id: hrDept.id });

    console.log('Creating asset categories and custom fields...');
    const electronics = await AssetCategory.create({
      name: 'Electronics',
      description: 'Laptops, Monitors, Phones'
    });
    
    await CustomField.create({
      field_name: 'Warranty Period',
      field_type: 'Number',
      category_id: electronics.id
    });
    
    const furniture = await AssetCategory.create({
      name: 'Furniture',
      description: 'Desks, Chairs'
    });

    console.log('Creating assets...');
    const asset1 = await Asset.create({
      asset_tag: 'AF-0001',
      name: 'MacBook Pro 16"',
      category_id: electronics.id,
      department_id: itDept.id,
      serial_number: 'C02XD0',
      acquisition_date: new Date('2023-01-15'),
      acquisition_cost: 2499.99,
      condition: 'Good',
      location: 'Desk A1',
      status: 'Allocated',
      is_shared_bookable: false,
      created_by: assetManager.id
    });
    
    const asset2 = await Asset.create({
      asset_tag: 'AF-0002',
      name: 'Conference Room Projector',
      category_id: electronics.id,
      department_id: itDept.id,
      serial_number: 'PRJ123',
      acquisition_date: new Date('2022-05-10'),
      acquisition_cost: 1500.00,
      condition: 'Excellent',
      location: 'Conference Room 1',
      status: 'Available',
      is_shared_bookable: true,
      created_by: assetManager.id
    });

    console.log('Creating allocations...');
    await Allocation.create({
      asset_id: asset1.id,
      employee_id: employee1.id,
      allocated_on: new Date('2024-01-10'),
      status: 'Active',
      allocated_by: assetManager.id
    });

    console.log('Creating resource bookings...');
    await ResourceBooking.create({
      resource_asset_id: asset2.id,
      booked_by: employee1.id,
      department_id: itDept.id,
      start_time: new Date(new Date().setHours(new Date().getHours() + 1)),
      end_time: new Date(new Date().setHours(new Date().getHours() + 2)),
      purpose: 'Team Meeting',
      status: 'Upcoming'
    });

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
