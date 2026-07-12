require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

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
