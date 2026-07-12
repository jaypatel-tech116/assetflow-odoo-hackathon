const { Department, AssetCategory } = require('../models');

exports.getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, departmentId, categoryId } = req.query;

    // Fetch real departments and categories for realistic labels if needed
    const departments = await Department.findAll({ attributes: ['id', 'name', 'employee_count'] });
    const categories = await AssetCategory.findAll({ attributes: ['id', 'name'] });

    // Mock Data Generator for Reports Dashboard
    // In a real app, this would query Asset, Booking, and Maintenance tables.

    // 1. Asset Utilization (Used vs Idle)
    const totalAssets = 210;
    const utilized = 136;
    const idle = 74;
    
    // 2. Maintenance Frequency by Category
    const maintenanceFrequency = [
      { category: 'Electronics', count: 25 },
      { category: 'Vehicles', count: 18 },
      { category: 'Machinery', count: 14 },
      { category: 'Furniture', count: 10 },
      { category: 'Others', count: 7 },
      { category: 'Office Equipment', count: 6 },
    ];

    // 3. Assets Nearing Retirement / Due for Maintenance
    const nearingRetirement = [
      { tag: 'AF-0022', name: 'Dell Latitude 7450', category: 'Electronics', dueDate: '30 May 2024', status: 'Retirement' },
      { tag: 'AF-0015', name: 'HP LaserJet P1108', category: 'Electronics', dueDate: '05 Jun 2024', status: 'Maintenance' },
      { tag: 'AF-0044', name: 'Toyota Innova G', category: 'Vehicles', dueDate: '12 Jun 2024', status: 'Retirement' },
      { tag: 'AF-0031', name: 'Conference Table', category: 'Furniture', dueDate: '15 Jun 2024', status: 'Maintenance' },
      { tag: 'AF-0050', name: 'Logitech Projector', category: 'Electronics', dueDate: '18 Jun 2024', status: 'Maintenance' },
    ];

    // 4. Department-wise Allocation Summary
    // We can use the real department names, but mock the asset counts to match the screenshot
    const mockDeptStats = [
      { name: 'Information Technology', total: 45, allocated: 30, employees: 30 },
      { name: 'Human Resources', total: 28, allocated: 18, employees: 18 },
      { name: 'Sales', total: 32, allocated: 20, employees: 20 },
      { name: 'Finance', total: 26, allocated: 16, employees: 16 },
      { name: 'Operations', total: 40, allocated: 28, employees: 28 },
      { name: 'Marketing', total: 20, allocated: 12, employees: 12 },
    ];

    const departmentAllocation = mockDeptStats.map(d => {
      const available = d.total - d.allocated;
      const utilizationPct = ((d.allocated / d.total) * 100).toFixed(1);
      return {
        department: d.name,
        totalAssets: d.total,
        allocatedAssets: d.allocated,
        availableAssets: available,
        utilization: utilizationPct,
        employees: d.employees
      };
    });

    const deptTotals = departmentAllocation.reduce((acc, curr) => {
      acc.total += curr.totalAssets;
      acc.allocated += curr.allocatedAssets;
      return acc;
    }, { total: 0, allocated: 0 });
    
    // Add Total row
    departmentAllocation.push({
      department: 'Total',
      totalAssets: deptTotals.total,
      allocatedAssets: deptTotals.allocated,
      availableAssets: deptTotals.total - deptTotals.allocated,
      utilization: ((deptTotals.allocated / deptTotals.total) * 100).toFixed(1),
      employees: 124, // arbitrary total
      isTotal: true
    });

    // 5. Booking Heatmap Data (Mocked values 0-10)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];
    
    const heatmap = days.map(day => {
      const rowData = {};
      hours.forEach(hour => {
        // Generate pseudo-random intensity based on typical work hours
        let intensity = 1;
        if (['10 AM', '12 PM', '2 PM', '4 PM'].includes(hour) && !['Saturday', 'Sunday'].includes(day)) {
          intensity = Math.floor(Math.random() * 5) + 5; // 5-9
        } else {
          intensity = Math.floor(Math.random() * 4); // 0-3
        }
        rowData[hour] = intensity;
      });
      return { day, data: rowData };
    });

    // 6. Summary Cards
    const summaryCards = {
      totalAssets: { value: 210, change: '+8.2%', isPositive: true },
      assetsAllocated: { value: 136, change: '+5.1%', isPositive: true },
      activeBookings: { value: 110, change: '+11.1%', isPositive: true },
      maintenanceRequests: { value: 24, change: '-12.5%', isPositive: false },
      pendingTransfers: { value: 6, change: '-14.3%', isPositive: false },
      overdueItems: { value: 13, change: '+8.3%', isPositive: false },
    };

    res.json({
      success: true,
      data: {
        utilization: { total: totalAssets, used: utilized, idle },
        maintenanceFrequency,
        nearingRetirement,
        departmentAllocation,
        heatmap,
        summaryCards
      }
    });

  } catch (error) {
    next(error);
  }
};
