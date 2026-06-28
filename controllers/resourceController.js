const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const { uploadResourceFile } = require('../services/googleDriveService');

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
    const uploadedFile = await uploadResourceFile(req.file);

    res.status(201).send({
      id: uploadedFile.id,
      name: uploadedFile.name,
      link: uploadedFile.webViewLink,
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
