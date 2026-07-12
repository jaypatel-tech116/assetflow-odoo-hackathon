require('dotenv').config();

const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
<<<<<<< HEAD
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const errorHandler = require('./middleware/errorHandler');

// --- Import Models for Associations ---
const User = require('./models/User');
const Asset = require('./models/Asset');
const Booking = require('./models/Booking');
const MaintenanceRequest = require('./models/MaintenanceRequest');
const TransferRequest = require('./models/TransferRequest');
const Notification = require('./models/Notification');
const Resource = require('./models/Resource');

// --- Model Associations ---

// User <-> Asset
User.hasMany(Asset, { foreignKey: 'assigned_to', as: 'assets' });
Asset.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedUser' });

// User <-> Booking
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Resource <-> Booking
Resource.hasMany(Booking, { foreignKey: 'resource_id', as: 'bookings' });
Booking.belongsTo(Resource, { foreignKey: 'resource_id', as: 'resource' });

// User <-> MaintenanceRequest
User.hasMany(MaintenanceRequest, { foreignKey: 'user_id', as: 'maintenanceRequests' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Asset <-> MaintenanceRequest
Asset.hasMany(MaintenanceRequest, { foreignKey: 'asset_id', as: 'maintenanceRequests' });
MaintenanceRequest.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });

// User <-> TransferRequest
User.hasMany(TransferRequest, { foreignKey: 'user_id', as: 'transferRequests' });
TransferRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Asset <-> TransferRequest
Asset.hasMany(TransferRequest, { foreignKey: 'asset_id', as: 'transferRequests' });
TransferRequest.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

=======

// Load all models + associations (must happen before sync)
const { sequelize } = require('./config/associations');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const assetRoutes = require('./routes/assetRoutes');
const requestRoutes = require('./routes/requestRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const errorHandler = require('./middleware/errorHandler');

>>>>>>> origin/prince
=======
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

>>>>>>> origin/jay
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
<<<<<<< HEAD
<<<<<<< HEAD

// CORS — allow requests from the Vite dev server
=======
>>>>>>> origin/prince
=======

// CORS — allow requests from the Vite dev server
>>>>>>> origin/jay
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> origin/jay

// Parse JSON request bodies
app.use(express.json());

<<<<<<< HEAD
// --- Routes ---

// Health check
=======
app.use(express.json());

// --- Routes ---
>>>>>>> origin/prince
=======
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---

// Health check
>>>>>>> origin/jay
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AssetFlow API is running', timestamp: new Date().toISOString() });
});

<<<<<<< HEAD
<<<<<<< HEAD
// Auth routes
app.use('/api/auth', authRoutes);

// Employee routes
app.use('/api/employee', employeeRoutes);

// --- Error Handling (must be last) ---
=======
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api', bookingRoutes);           // /api/resources and /api/bookings
app.use('/api/notifications', notificationRoutes);

// --- Error Handling ---
>>>>>>> origin/prince
=======
// Auth routes
app.use('/api/auth', authRoutes);

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

// --- Error Handling (must be last) ---
>>>>>>> origin/jay
app.use(errorHandler);

// --- Start Server ---
const startServer = async () => {
  try {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> origin/jay
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models (creates tables if they don't exist)
<<<<<<< HEAD
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized.');
=======
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models — alter:true updates tables to match models without dropping data
    await sequelize.sync({ alter: true });
    console.log('✅ All database models synchronized.');
>>>>>>> origin/prince
=======
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized.');
>>>>>>> origin/jay

    app.listen(PORT, () => {
      console.log(`🚀 AssetFlow server running on http://localhost:${PORT}`);
      console.log(`📡 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
<<<<<<< HEAD
<<<<<<< HEAD
=======
      console.log(`📋 API Routes: auth, users, dashboard, assets, requests, bookings, notifications`);
>>>>>>> origin/prince
=======
>>>>>>> origin/jay
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
