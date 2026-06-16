const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// JWT Token Generation
router.post('/', (req, res) => {
  const user = req.body;

  if (!user || !user.email) {
    return res.status(400).json({ message: 'User email required for JWT' });
  }

  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;
