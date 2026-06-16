const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');

const generateToken = async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  res.send({ token });
};

module.exports = {
  generateToken
};