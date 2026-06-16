const express = require('express');
const router = express.Router();
const classResourcesController = require('../controllers/classResourcesController');

router.get('/', classResourcesController.getAllClassResources);
router.post('/', classResourcesController.createClassResource);
router.delete('/:id', classResourcesController.deleteClassResource);

module.exports = router;