const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const getAllBookmarks = async (req, res) => {
  const db = getDB();
  const { email } = req.query;
  if (!email) {
    return res.status(400).send({ message: 'Email query parameter is required.' });
  }
  const result = await db.collection('bookmarks').find({ email }).toArray();
  res.send(result);
};

const addBookmark = async (req, res) => {
  const db = getDB();
  const bookmark = req.body;
  const result = await db.collection('bookmarks').insertOne(bookmark);
  res.status(201).send(result);
};

const deleteBookmark = async (req, res) => {
  const db = getDB();
  const id = req.params.id;
  const result = await db.collection('bookmarks').deleteOne({ _id: new ObjectId(id) });
  res.send(result);
};

module.exports = {
  getAllBookmarks,
  addBookmark,
  deleteBookmark,
};
