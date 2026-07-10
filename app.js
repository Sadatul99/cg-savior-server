const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();
let dbReady;

// Middlewares
if (!process.env.VERCEL) {
  app.use(cors());
}
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    dbReady = dbReady || connectDB();
    await dbReady;
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.use('/jwt', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/courses', require('./routes/courseRoutes'));
app.use('/resources', require('./routes/resourceRoutes'));
app.use('/classroom', require('./routes/classroomRoutes'));
app.use('/classResources', require('./routes/classResourcesRoutes'));
app.use('/bookmarks', require('./routes/bookmarkRoutes'));

// Health check endpoint (for keep-alive pings on Render free tier)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test route
app.get('/', (req, res) => {
  res.send('CG Savior server is running');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Caught:", err);
  res.status(500).json({
    message: "An internal server error occurred.",
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

module.exports = app;
