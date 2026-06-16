const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all class resources
exports.getAllClassResources = async (req, res) => {
  try {
    const db = getDB();
    const resources = await db.collection('classResources').find().toArray();
    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create class resource
exports.createClassResource = async (req, res) => {
  try {
    const db = getDB();
    const resource = req.body;

    // Add timestamps
    resource.createdAt = new Date();
    
    const result = await db.collection('classResources').insertOne(resource);
    res.status(201).json({ 
      insertedId: result.insertedId, 
      ...resource,
      message: 'Resource created successfully' 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete class resource
exports.deleteClassResource = async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    
    const result = await db.collection('classResources').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.status(200).json({ _id: id, deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};