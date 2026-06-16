const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI from environment variables
const uri = process.env.MONGO_URI;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas!");

    // Database and collections
    const db = client.db("saviorDb");
    const userCollection = db.collection("users");
    const postCollection = db.collection("posts");
    const projectCollection = db.collection("projects");

    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    if (!collectionNames.includes("users")) {
      await db.createCollection("users");
      console.log("✅ Created 'users' collection");
    }
    if (!collectionNames.includes("posts")) {
      await db.createCollection("posts");
      console.log("✅ Created 'posts' collection");
    }
    if (!collectionNames.includes("projects")) {
      await db.createCollection("projects");
      console.log("✅ Created 'projects' collection");
    }

    // ========== TEST ENDPOINTS ==========
    app.get('/test', (req, res) => {
      res.send({ 
        message: 'Server is working!', 
        database: 'Connected to saviorDb',
        timestamp: new Date() 
      });
    });

    app.get('/test-db', async (req, res) => {
      try {
        const usersCount = await userCollection.countDocuments();
        const postsCount = await postCollection.countDocuments();
        const projectsCount = await projectCollection.countDocuments();
        
        res.send({
          database: 'saviorDb',
          collections: {
            users: usersCount,
            posts: postsCount,
            projects: projectsCount
          },
          status: 'Connected'
        });
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // ========== USER ROUTES ==========
    // Get all users
    app.get('/users', async (req, res) => {
      try {
        const result = await userCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send({ error: 'Failed to fetch users' });
      }
    });

    // Get user by email
    app.get('/users/email/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const user = await userCollection.findOne({ email: email });
        if (!user) {
          return res.status(404).send({ message: 'User not found' });
        }
        res.send(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send({ error: 'Failed to fetch user' });
      }
    });

    // Get user by ID
    app.get('/users/:id', async (req, res) => {
      try {
        const id = req.params.id;
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: 'Invalid user ID format' });
        }
        
        const query = { _id: new ObjectId(id) };
        const user = await userCollection.findOne(query);
        
        if (!user) {
          return res.status(404).send({ message: 'User not found' });
        }
        res.send(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send({ error: 'Failed to fetch user' });
      }
    });

    // Create/Register new user
    app.post('/users', async (req, res) => {
      try {
        const user = req.body;
        
        // Validate required fields
        if (!user.name || !user.email) {
          return res.status(400).send({ 
            error: 'Name and email are required',
            received: req.body 
          });
        }
        
        // Check if user already exists
        const existingUser = await userCollection.findOne({ email: user.email });
        
        if (existingUser) {
          return res.send({ 
            message: 'User already exists', 
            insertedId: null,
            userId: existingUser._id 
          });
        }
        
        // Add default values
        if (!user.role) user.role = 'user';
        user.createdAt = new Date();
        user.updatedAt = new Date();
        
        const result = await userCollection.insertOne(user);
        
        res.send({ 
          success: true,
          message: 'User created successfully',
          insertedId: result.insertedId,
          user: { ...user, _id: result.insertedId }
        });
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send({ 
          error: 'Failed to create user',
          details: error.message 
        });
      }
    });

    // Update user profile
    app.patch('/users/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body;
        
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: 'Invalid user ID format' });
        }
        
        updateData.updatedAt = new Date();
        
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: updateData
        };
        
        const result = await userCollection.updateOne(filter, updateDoc);
        
        if (result.matchedCount === 0) {
          return res.status(404).send({ message: 'User not found' });
        }
        
        res.send({
          success: true,
          message: 'User updated successfully',
          ...result
        });
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ error: 'Failed to update user' });
      }
    });

    // Delete user
    app.delete('/users/:id', async (req, res) => {
      try {
        const id = req.params.id;
        
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: 'Invalid user ID format' });
        }
        
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.deleteOne(query);
        
        if (result.deletedCount === 0) {
          return res.status(404).send({ message: 'User not found' });
        }
        
        res.send({
          success: true,
          message: 'User deleted successfully',
          ...result
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send({ error: 'Failed to delete user' });
      }
    });
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB Atlas connection verified!");

  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️  Server will start with limited functionality");
  }
}

run().catch(console.error);

// Root endpoint
app.get('/', (req, res) => {
  res.send({
    message: 'Backend Server is running',
    database: 'saviorDb',
    endpoints: {
      test: 'GET /test',
      database: 'GET /test-db',
      users: {
        getAll: 'GET /users',
        getByEmail: 'GET /users/email/:email',
        getById: 'GET /users/:id',
        create: 'POST /users',
        update: 'PATCH /users/:id',
        delete: 'DELETE /users/:id'
      },
      posts: {
        getAll: 'GET /posts',
        getById: 'GET /posts/:id',
        getUserPosts: 'GET /posts/user/:email',
        create: 'POST /posts',
        update: 'PATCH /posts/:id',
        like: 'PATCH /posts/:id/like',
        comment: 'PATCH /posts/:id/comment',
        delete: 'DELETE /posts/:id'
      },
      projects: {
        getAll: 'GET /projects',
        getFeatured: 'GET /projects/featured',
        getById: 'GET /projects/:id',
        getUserProjects: 'GET /projects/user/:email',
        create: 'POST /projects',
        update: 'PATCH /projects/:id',
        view: 'PATCH /projects/:id/view',
        like: 'PATCH /projects/:id/like',
        delete: 'DELETE /projects/:id'
      }
    },
    timestamp: new Date()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send({
    error: 'Endpoint not found',
    requestedUrl: req.url,
    method: req.method,
    availableEndpoints: ['/test', '/users', '/posts', '/projects']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📡 Visit: http://localhost:${port}`);
});