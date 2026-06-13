const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const expressWs = require('express-ws');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const executionRoutes = require('./api/routes/execution');
const fileRoutes = require('./api/routes/files');
const logsRoutes = require('./api/routes/logs');
const logger = require('./utils/logger');

dotenv.config();
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
}

const app = express();
expressWs(app);

// Create necessary directories
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const logsDir = './logs';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Reduced for free tier
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve frontend build
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

// Routes
app.use('/api/execute', executionRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/logs', logsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), uptime: process.uptime() });
});

// Serve frontend for all other routes (SPA)
app.get('*', (req, res) => {
  if (fs.existsSync(frontendBuildPath)) {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  } else {
    res.json({ message: 'Python Web Runner API - Frontend build not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Frontend path: ${frontendBuildPath}`);
});
