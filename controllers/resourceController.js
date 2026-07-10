const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const getAllResources = async (req, res) => {
  const db = getDB();
  const result = await db.collection('resources').find().toArray();
  res.send(result);
};

const createResource = async (req, res) => {
  const db = getDB();
  const resource = req.body;
  const result = await db.collection('resources').insertOne(resource);
  res.send(result);
};

const uploadResourceToDrive = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file was provided for upload.');
    }
    // req.file already contains the uploaded file info from DriveStorage
    res.status(201).send({
      id: req.file.id,
      name: req.file.name,
      link: req.file.webViewLink,
    });
  } catch (error) {
    console.error('Google Drive upload failed:', error);
    res.status(500).send({
      message: 'Failed to upload file to Google Drive',
      error: error.message,
    });
  }
};

const deleteResource = async (req, res) => {
  const db = getDB();
  const id = req.params.id;
  const result = await db.collection('resources').deleteOne({ _id: new ObjectId(id) });
  res.send(result);
};

module.exports = {
  getAllResources,
  createResource,
  uploadResourceToDrive,
  deleteResource
};
