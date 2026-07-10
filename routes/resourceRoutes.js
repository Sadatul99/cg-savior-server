const express = require('express');
const multer = require('multer');
router.get('/', resourceController.getAllResources);
router.post('/', resourceController.createResource);
router.post('/generate-upload-url', resourceController.generateUploadUrl);
router.post('/make-public', resourceController.makeFilePublic);
router.delete('/:id', resourceController.deleteResource);

module.exports = router;
