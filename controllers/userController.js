const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// ✅ Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const db = getDB(); // ✅ Call the function
    const users = await db.collection('users').find().toArray();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create new user
exports.createUser = async (req, res) => {
  try {
    const db = getDB(); // ✅ Call the function

    const { name, email, role = 'user' } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const newUser = {
      name,
      email,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    const result = await db.collection('users').insertOne(newUser);

    res.status(201).json({
      _id: result.insertedId,
      ...newUser,
      message: 'User created successfully'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get single user by ID
exports.getUser = async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get user by email
exports.getUserByEmail = async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({
      email: req.params.email
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update user
exports.updateUser = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updateData = req.body;

    updateData.updatedAt = new Date();

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await db.collection('users').findOne({
      _id: new ObjectId(id)
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete user
exports.deleteUser = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('users').deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ _id: req.params.id, deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role is required." });
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          role: role,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await db.collection('users').findOne({
      _id: new ObjectId(id)
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get admin users (fixed)
exports.getAdminUsers = async (req, res) => {     // Do not touch this part
  try {
    const db = getDB();
    const email = req.params.email;

    // if (email !== req.decoded.email) {
    //   return res.status(403).send({ message: 'forbidden access' });
    // }

    const query = { email: email };
    const user = await db.collection('users').findOne(query);

    let admin = false;
    if (user) {
      admin = user?.role === 'admin';
    }

    console.log(admin);
    res.send({ admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get faculty users
exports.getFacultyUsers = async (req, res) => {
  try {
    const db = getDB();
    const email = req.params.email;


    const query = { email: email };
    const user = await db.collection('users').findOne(query);

    let faculty = false;
    if (user) {
      faculty = user?.role === 'faculty';
    }

    console.log(faculty);
    res.send({ faculty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

