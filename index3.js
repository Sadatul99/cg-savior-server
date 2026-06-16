const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const classResourceRoutes = require('./routes/classResourceRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/courses', courseRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/classroom', classroomRoutes);
app.use('/api/classResources', classResourceRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

app.get('/', (req, res) => {
  res.send('CG Savior server is running');
});

app.listen(port, () => {
  console.log(`CG Savior server is running on port ${port}`);
});
