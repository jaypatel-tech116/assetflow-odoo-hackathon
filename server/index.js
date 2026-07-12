require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const models = require('./models'); // Loads models and associations
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---

// Global Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Parse JSON request bodies
app.use(express.json());

// --- Routes ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AssetFlow API is running', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Organization routes
const organizationRoutes = require('./routes/organizationRoutes');
app.use('/api/organization', organizationRoutes);

// Analytics & Reports routes
const reportsRoutes = require('./routes/reportsRoutes');
app.use('/api/reports', reportsRoutes);

// Activity Logs & Notifications routes
const activityRoutes = require('./routes/activityRoutes');
app.use('/api/activity', activityRoutes);

// Audit Cycle routes
const auditRoutes = require('./routes/auditRoutes');
app.use('/api/audit', auditRoutes);

// --- Error Handling (must be last) ---
app.use(errorHandler);

// --- Start Server ---
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models (creates tables if they don\'t exist)
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
