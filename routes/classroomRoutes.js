const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');

router.get('/', classroomController.getAllClassrooms);
router.get('/:code', classroomController.getClassroomByCode);
router.get('/check-class-code/:code', classroomController.checkClassCode);
router.post('/', classroomController.createClassroom);
router.delete('/delete-with-resources/:code', classroomController.deleteClassroomWithResources);

module.exports = router;