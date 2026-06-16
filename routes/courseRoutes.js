const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseByCode,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

// CRUD Routes
router.route('/')
  .get(getAllCourses)
  .post(createCourse);

router.route('/:code')
  .get(getCourseByCode)
  .patch(updateCourse)
  .delete(deleteCourse);

module.exports = router;