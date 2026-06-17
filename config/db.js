const { MongoClient } = require('mongodb');
require('dotenv').config();

let client;
let db;

const connectDB = async () => {
  if (db) return db;

  if (!client) {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
  }

  db = client.db();
  console.log('MongoDB Connected');
  return db;
};

const getDB = () => {
  if (!db) throw new Error('Database not connected!');
  return db;
};

module.exports = { connectDB, getDB };