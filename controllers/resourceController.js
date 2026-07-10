const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const {
  generateResumableUploadUrl,
  getFilePublicLink,
} = require('../services/googleDriveService');

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

const generateUploadUrl = async (req, res) => {
  try {
    const { originalname, mimetype } = req.body;

    if (!originalname) {
      return res.status(400).send({ message: 'Missing originalname in request body.' });
    }

    const uploadUrl = await generateResumableUploadUrl({ originalname, mimetype });
    res.status(200).send({ uploadUrl });
  } catch (error) {
    console.error('Failed to generate Google Drive upload URL:', error);
    res.status(500).send({
      message: 'Failed to generate Google Drive upload URL',
      error: error.message,
    });
  }
};

const makeFilePublic = async (req, res) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).send({ message: 'Missing fileId in request body.' });
    }

    const publicFile = await getFilePublicLink(fileId);
    res.status(200).send(publicFile);
  } catch (error) {
    console.error('Failed to make Google Drive file public:', error);
    res.status(500).send({
      message: 'Failed to make Google Drive file public',
      error: error.message,
    });
  }
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
  generateUploadUrl,
  makeFilePublic,
  uploadResourceToDrive,
  deleteResource
};
