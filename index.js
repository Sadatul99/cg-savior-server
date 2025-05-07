const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleWares
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://cgSaviorAdmin:WnczohkZW0kCsuHW@cluster0.agjw6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db("saviorDb").collection("users")
    const courseCollection = client.db("saviorDb").collection("courses")
    const resourceCollection = client.db("saviorDb").collection("resources")
    const bookmarkCollection = client.db("saviorDb").collection("bookmarks")
    const classroomCollection = client.db("saviorDb").collection("classroom")
    const classResourcesCollection = client.db("saviorDb").collection("classResources")


    // jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })

    // middlewares 
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }

    // use verify admin after verifyToken
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }
    const verifyFaculty = async (req, res, next) => {
      const email = req.decoded.email;
      const user = await userCollection.findOne({ email });
      const isFaculty = user?.role === 'faculty' || user?.role === 'admin';
      if (!isFaculty) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    };

    const verifyFacultyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isFacultyAdmin = user?.role === 'faculty' || user?.role === 'admin';
      if (!isFacultyAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }


    // User Collection
    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      // console.log(req.headers)
      const result = await userCollection.find().toArray();
      res.send(result)
    })

    // client side e useAdmin check korar jonno ei code
    app.get('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })

    app.get('/users/faculty/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let faculty = false;
      if (user) {
        faculty = user?.role === 'faculty';
      }
      res.send({ faculty });
    })


    app.post('/users', async (req, res) => {
      const user = req.body;
      // Insert email if user doesnt exists
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result)
    })

    app.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
    })

    // PATCH — Update user role (Admin, Faculty, User, etc.)
    app.patch('/users/role/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const { role } = req.body;

      if (!role) {
        return res.status(400).send({ message: "Role is required." });
      }

      const filter = { _id: new ObjectId(id) };
      const updatedUser = {
        $set: {
          role: role
        }
      };

      const result = await userCollection.updateOne(filter, updatedUser);
      res.send(result);
    });

    // Course Collection
    app.get('/courses', async (req, res) => {
      const result = await courseCollection.find().toArray();
      res.send(result)
    })

    app.get('/courses/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      try {
        const course = await courseCollection.findOne(query);
        if (!course) return res.status(404).send({ message: 'Course not found' });
        res.json(course);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    app.post('/courses', verifyToken, verifyAdmin, async (req, res) => {
      const course = req.body;
      const result = await courseCollection.insertOne(course);
      res.send(result)
    })

    // 
    app.delete('/courses/:code',  async (req, res) => {
      const code = req.params.code;
      const result = await courseCollection.deleteOne({ course_code:  code });
      res.send(result);
    });

    // Resource Collection
    app.get('/resources', async (req, res) => {
      const result = await resourceCollection.find().toArray();
      res.send(result);
    })

    app.post('/resources', async (req, res) => {
      const resource = req.body;
      const result = await resourceCollection.insertOne(resource);
      res.send(result)
    })

    app.delete('/resources/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await resourceCollection.deleteOne(query);
      res.send(result);
    });

    // classroom Collection
    app.get('/classroom', async (req, res) => {
      const result = await classroomCollection.find().toArray();
      res.send(result);
    })
    app.get('/classroom/:code', async (req, res) => {
      // const code = req.params.code.trim().toLowerCase(); // normalize
      const result = await classroomCollection.findOne({ class_code:  req.params.code });
      res.send(result);
    })

    // Check if class_code is unique
    app.get("/classroom/check-class-code/:code", async (req, res) => {
      const code = req.params.code.trim().toLowerCase(); // normalize
      const existing = await classroomCollection.findOne({ class_code: code });
      res.send({ exists: !!existing });
    });


    app.post('/classroom', async (req, res) => {
      const resource = req.body;
      try {
        const result = await classroomCollection.insertOne(resource);
        res.send(result);
      } catch (err) {
        if (err.code === 11000) {
          // Duplicate key error
          res.status(400).send({ message: "Class code already exists" });
        } else {
          res.status(500).send({ message: "Server error" });
        }
      }
    });

    app.delete('/classroom/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classroomCollection.deleteOne(query);
      res.send(result);
    });

    // classResources Collection
    app.get('/classResources', async (req, res) => {
      const result = await classResourcesCollection.find().toArray();
      res.send(result);
    })

    app.post('/classResources', async (req, res) => {
      const resource = req.body;
      const result = await classResourcesCollection.insertOne(resource);
      res.send(result)
    })

    app.delete('/classResources/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classResourcesCollection.deleteOne(query);
      res.send(result);
    });

    // Bookmark Collection
    app.get('/bookmarks', verifyToken, async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const result = await bookmarkCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/bookmarks', verifyToken, async (req, res) => {
      const bookmarkedCourse = req.body;
      const result = await bookmarkCollection.insertOne(bookmarkedCourse);
      res.send(result)
    })

    app.delete('/bookmarks/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookmarkCollection.deleteOne(query);
      res.send(result);
    });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('CG Savior server in running')
})
app.listen(port, () => {
  console.log(`CG Savior server is running on port ${port}`)
})