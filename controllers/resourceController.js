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

const deleteResource = async (req, res) => {
  const db = getDB();
  const id = req.params.id;
  const result = await db.collection('resources').deleteOne({ _id: new ObjectId(id) });
  res.send(result);
};

module.exports = {
  getAllResources,
  createResource,
  deleteResource
};