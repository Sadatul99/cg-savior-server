const { MongoClient } = require('mongodb');
require('dotenv').config();

let db;

const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db(); // Automatically picks the db name from URI
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error(err.stack);
    throw err;
  }
};

const getDB = () => {
  if (!db) throw new Error('Database not connected!');
  return db;
};

module.exports = { connectDB, getDB };
