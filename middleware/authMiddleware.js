const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send({ message: 'Unauthorized access' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ message: 'Unauthorized access' });
    req.decoded = decoded;
    next();
  });
};

const verifyRole = role => async (req, res, next) => {
  try {
    const email = req.decoded.email;
    const user = await getDB().collection('users').findOne({ email });

    const isAuthorized =
      role === 'admin' ? user?.role === 'admin' :
      role === 'faculty' ? ['faculty', 'admin'].includes(user?.role) :
      false;

    if (!isAuthorized) return res.status(403).send({ message: 'Forbidden access' });

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyToken,
  verifyAdmin: verifyRole('admin'),
  verifyFaculty: verifyRole('faculty'),
};
