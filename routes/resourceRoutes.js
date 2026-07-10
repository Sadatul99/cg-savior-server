const express = require('express');
const multer = require('multer');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

const os = require('os');

const upload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir()
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
});

router.get('/', resourceController.getAllResources);
router.post('/', resourceController.createResource);
router.post('/upload-to-drive', upload.single('file'), resourceController.uploadResourceToDrive);
router.delete('/:id', resourceController.deleteResource);

module.exports = router;
