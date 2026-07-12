const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const { deleteResourceFile } = require('../services/googleDriveService');

const getDriveFileId = (resource) => {
  if (resource.drive_file_id) return resource.drive_file_id;

  // Resources created before drive_file_id was stored can still be cleaned up
  // when they are known app uploads and have the standard Drive view URL.
  if (!resource.uploaded_file_name || typeof resource.link !== 'string') return null;

  try {
    const url = new URL(resource.link);
    if (url.hostname !== 'drive.google.com') return null;

    return url.pathname.match(/\/d\/([^/?]+)/)?.[1] || url.searchParams.get('id');
  } catch {
    return null;
  }
};

const getAllResources = async (req, res) => {
  const db = getDB();
  const result = await db.collection('resources').find().toArray();
  res.send(result);
};

const createResource = async (req, res) => {
  const db = getDB();
  const resource = { ...req.body, votes: [] };
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
  try {
    const db = getDB();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'Invalid resource id.' });
    }

    const resource = await db.collection('resources').findOne({ _id: new ObjectId(id) });
    if (!resource) {
      return res.status(404).send({ message: 'Resource not found.' });
    }

    // Only resources uploaded through this application resolve to a Drive file
    // ID. Normal external links are removed from MongoDB without touching Drive.
    const driveFileId = getDriveFileId(resource);
    if (driveFileId) {
      try {
        await deleteResourceFile(driveFileId);
      } catch (error) {
        // A 404 means the file was already removed from Drive, so the database
        // record can still be cleaned up safely.
        if (error.code !== 404 && error.response?.status !== 404) {
          console.error('Google Drive deletion failed:', error);
          return res.status(502).send({
            message: 'Could not delete the uploaded file from Google Drive. The resource was not removed.',
          });
        }
      }
    }

    await db.collection('resources').deleteOne({ _id: resource._id });
    res.send({ message: 'Resource deleted successfully.' });
  } catch (error) {
    console.error('Resource deletion failed:', error);
    res.status(500).send({ message: 'Failed to delete resource.' });
  }
};

const voteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'Invalid resource id.' });
    }

    if (![1, -1].includes(direction)) {
      return res.status(400).send({ message: 'Vote direction must be 1 or -1.' });
    }

    const db = getDB();
    const resources = db.collection('resources');
    const resourceId = new ObjectId(id);
    const email = req.decoded?.email;

    if (!email) {
      return res.status(401).send({ message: 'Unauthorized access' });
    }

    const resource = await resources.findOne({ _id: resourceId });
    if (!resource) {
      return res.status(404).send({ message: 'Resource not found.' });
    }

    const existingVote = (resource.votes || []).find(vote => vote.email === email);
    if (existingVote?.direction === direction) {
      return res.send({
        vote: resource.vote || 0,
        changed: false,
        message: 'You have already submitted this vote.',
      });
    }

    const scoreChange = existingVote ? direction - existingVote.direction : direction;
    const update = existingVote
      ? {
          $set: { 'votes.$.direction': direction },
          $inc: { vote: scoreChange },
        }
      : {
          $push: { votes: { email, direction } },
          $inc: { vote: scoreChange },
        };
    const filter = existingVote
      ? { _id: resourceId, 'votes.email': email }
      : { _id: resourceId, 'votes.email': { $ne: email } };
    const result = await resources.findOneAndUpdate(filter, update, { returnDocument: 'after' });

    if (!result) {
      return res.status(409).send({ message: 'Your vote was updated elsewhere. Please try again.' });
    }

    res.send({ vote: result.vote, changed: true, direction });
  } catch (error) {
    console.error('Resource vote failed:', error);
    res.status(500).send({ message: 'Failed to submit vote.' });
  }
};

module.exports = {
  getAllResources,
  createResource,
  uploadResourceToDrive,
  deleteResource,
  voteResource
};
