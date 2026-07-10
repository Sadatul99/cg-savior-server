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

// Health check endpoint (for keep-alive pings on Render free tier)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test route
app.get('/', (req, res) => {
  res.send('CG Savior server is running');
});

module.exports = app;
