const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();
let dbReady;

// Middlewares
app.use(cors());
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

// Test route
app.get('/', (req, res) => {
  res.send('CG Savior server is running');
});

module.exports = app;
