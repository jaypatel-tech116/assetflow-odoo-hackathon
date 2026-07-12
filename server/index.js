require('dotenv').config();

const express = require('express');
const cors = require('cors');
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

// --- Routes ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AssetFlow API is running', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Employee routes
app.use('/api/employee', employeeRoutes);

// --- Error Handling (must be last) ---
app.use(errorHandler);

// --- Start Server ---
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
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
