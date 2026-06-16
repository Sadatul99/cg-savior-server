const app = require('./app');
const { connectDB } = require('./config/db');
const port = process.env.PORT || 5000;

// Connect to MongoDB first, then start the server
async function startServer() {
  try {
    await connectDB(); // Wait for connection
    app.listen(port, () => {
      console.log(`CG Savior server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();