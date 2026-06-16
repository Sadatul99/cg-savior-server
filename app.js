const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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