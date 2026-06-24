const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');
require('dotenv').config();

const connectDB         = require('./config/db');
const analyticsRoutes   = require('./routes/analyticsRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ─────────────────────────────────────
connectDB();

// ─── Global Middleware ──────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// ─── Serve Tracker Script & Demo HTML ──────────────────────
// In Docker, the /tracker volume is mounted at /tracker
// Locally, it falls back to ../../tracker relative to src/
const trackerDir = process.env.NODE_ENV === 'production'
  ? '/tracker'
  : path.join(__dirname, '../../tracker');

app.use(express.static(trackerDir));

// ─── Health Check ───────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'CausalFunnel Backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ─────────────────────────────────────────────
app.use('/api', analyticsRoutes);

// ─── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ─── Global Error Handler ───────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: 'An unexpected server error occurred.',
    ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
  });
});

// ─── Start Server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 CausalFunnel Backend running on port ${PORT}`);
  console.log(`   Mode:    ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health:  http://localhost:${PORT}/health`);
  console.log(`   API:     http://localhost:${PORT}/api`);
  console.log(`   Tracker: http://localhost:${PORT}/tracker.js`);
  console.log(`   Demo:    http://localhost:${PORT}/demo.html\n`);
});
