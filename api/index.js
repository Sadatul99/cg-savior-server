const app = require('../app');
const { connectDB } = require('../config/db');

let dbReady;

app.use(async (req, res, next) => {
  try {
    dbReady = dbReady || connectDB();
    await dbReady;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = app;