const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*'}));
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// Connexion DB
require('./lib/db');

app.use('/api/cvs', require('./routes/cvRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/assist', require('./routes/assistRoutes'));
// Serve static uploads (PDFs, images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// DB health
app.get('/health/db', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = states[mongoose.connection.readyState] || 'unknown';
  res.json({ status: state });
});

// Not found
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});
// Port
const PORT = process.env.PORT || 3000;

// Start server unless required by tests
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
