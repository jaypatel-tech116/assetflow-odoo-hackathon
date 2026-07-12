require('dotenv').config();

const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const path = require('path');
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const transferRoutes = require('./routes/transferRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const auditRoutes = require('./routes/auditRoutes');
const reportRoutes = require('./routes/reportRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
=======
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
>>>>>>> 879dbf2bd635ae5d9b416f4693c99acc2a2408c9

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---

// CORS — allow requests from the Vite dev server
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json());

<<<<<<< HEAD
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

=======
>>>>>>> 879dbf2bd635ae5d9b416f4693c99acc2a2408c9
// --- Routes ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AssetFlow API is running', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', authRoutes);

<<<<<<< HEAD
// Protected module routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/employee', require('./routes/employeeRoutes'));

=======
>>>>>>> 879dbf2bd635ae5d9b416f4693c99acc2a2408c9
// --- Error Handling (must be last) ---
app.use(errorHandler);

// --- Start Server ---
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

<<<<<<< HEAD
    // Sync models (creates tables if they don't exist)
=======
    // Sync models (creates tables if they don\'t exist)
>>>>>>> 879dbf2bd635ae5d9b416f4693c99acc2a2408c9
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized.');

    app.listen(PORT, () => {
      console.log(`🚀 AssetFlow server running on http://localhost:${PORT}`);
      console.log(`📡 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
