require('dotenv').config();

const express = require('express');
const cors = require('cors');

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

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// --- Routes ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AssetFlow API is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api', bookingRoutes);           // /api/resources and /api/bookings
app.use('/api/notifications', notificationRoutes);

// --- Error Handling ---
app.use(errorHandler);

// --- Start Server ---
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models — alter:true updates tables to match models without dropping data
    await sequelize.sync({ alter: true });
    console.log('✅ All database models synchronized.');

    app.listen(PORT, () => {
      console.log(`🚀 AssetFlow server running on http://localhost:${PORT}`);
      console.log(`📡 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log(`📋 API Routes: auth, users, dashboard, assets, requests, bookings, notifications`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
