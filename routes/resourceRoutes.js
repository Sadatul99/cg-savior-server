const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

router.get('/', resourceController.getAllResources);
router.post('/', resourceController.createResource);
router.delete('/:id', resourceController.deleteResource);

module.exports = router;