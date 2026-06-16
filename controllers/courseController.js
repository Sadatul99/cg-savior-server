const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const db = getDB();
    const courses = await db.collection('courses').find().toArray();
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get course by code
exports.getCourseByCode = async (req, res) => {
  try {
    const db = getDB();
    const code = req.params.code.toUpperCase();
    const course = await db.collection('courses').findOne({ course_code: code });
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new course
exports.createCourse = async (req, res) => {
  try {
    const db = getDB();
    const course = req.body;
    
    // Check if course already exists
    const existingCourse = await db.collection('courses').findOne({ 
      course_code: course.course_code 
    });
    
    if (existingCourse) {
      return res.status(400).json({ error: 'Course already exists with this code' });
    }

    // Add timestamps
    course.createdAt = new Date();
    course.updatedAt = new Date();
    
    const result = await db.collection('courses').insertOne(course);
    res.status(201).json({ 
      _id: result.insertedId, 
      ...course,
      message: 'Course created successfully' 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const db = getDB();
    const code = req.params.code.toUpperCase();
    const updateData = req.body;

    updateData.updatedAt = new Date();

    const result = await db.collection('courses').updateOne(
      { course_code: code },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const updatedCourse = await db.collection('courses').findOne({
      course_code: code
    });

    res.status(200).json(updatedCourse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const db = getDB();
    const code = req.params.code.toUpperCase();
    
    const result = await db.collection('courses').deleteOne({
      course_code: code
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.status(200).json({ course_code: code, deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};