const { getDB } = require('../config/db');

// Get all classrooms
exports.getAllClassrooms = async (req, res) => {
  try {
    const db = getDB();
    const classrooms = await db.collection('classroom').find().toArray();
    res.status(200).json(classrooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get classroom by code
exports.getClassroomByCode = async (req, res) => {
  try {
    const db = getDB();
    const code = req.params.code;
    const classroom = await db.collection('classroom').findOne({ class_code: code });
    
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    res.status(200).json(classroom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check if class code exists
exports.checkClassCode = async (req, res) => {
  try {
    const db = getDB();
    const code = req.params.code.trim().toLowerCase();
    const existing = await db.collection('classroom').findOne({ class_code: code });
    res.status(200).json({ exists: !!existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create classroom
exports.createClassroom = async (req, res) => {
  try {
    const db = getDB();
    const classroom = req.body;

    // Check if class code already exists
    const existingClass = await db.collection('classroom').findOne({ 
      class_code: classroom.class_code 
    });
    
    if (existingClass) {
      return res.status(400).json({ error: 'Class code already exists' });
    }

    // Add timestamps
    classroom.createdAt = new Date();
    classroom.updatedAt = new Date();
    
    const result = await db.collection('classroom').insertOne(classroom);
    res.status(201).json({ 
      insertedId: result.insertedId, 
      ...classroom,
      message: 'Classroom created successfully' 
    });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Class code already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// Delete classroom with resources
exports.deleteClassroomWithResources = async (req, res) => {
  try {
    const db = getDB();
    const classCode = req.params.code;

    const classResult = await db.collection('classroom').deleteOne({ class_code: classCode });
    const resourceResult = await db.collection('classResources').deleteMany({ class_code: classCode });

    res.status(200).json({
      message: 'Class and associated resources deleted successfully',
      classDeleted: classResult.deletedCount,
      resourcesDeleted: resourceResult.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during deletion' });
  }
};