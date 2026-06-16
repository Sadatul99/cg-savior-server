const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  updateUserRole,
  getAdminUsers,
  getFacultyUsers
} = require('../controllers/userController');

// ✅ Specific routes first
router.route('/admin/:email').get(getAdminUsers);
router.route('/faculty/:email').get(getFacultyUsers);

// ✅ General user email route (MUST come after)
router.route('/email/:email').get(getUserByEmail);

// ✅ CRUD routes
router.route('/')
  .get(getAllUsers)
  .post(createUser);

router.route('/id/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.route('/role/:id')
  .patch(updateUserRole);

module.exports = router;
