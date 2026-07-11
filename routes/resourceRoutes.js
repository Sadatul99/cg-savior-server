const express = require('express');
const multer = require('multer');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const { uploadResourceFile } = require('../services/googleDriveService');

function DriveStorage() {}
DriveStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  uploadResourceFile({ stream: file.stream, originalname: file.originalname, mimetype: file.mimetype })
    .then(uploadedFile => {
      cb(null, {
        id: uploadedFile.id,
        name: uploadedFile.name,
        webViewLink: uploadedFile.webViewLink
      });
    })
    .catch(err => {
      cb(err);
    });
};
DriveStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  cb(null);
};

const upload = multer({
  storage: new DriveStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
});

router.get('/', resourceController.getAllResources);
router.post('/', resourceController.createResource);
router.post('/upload-to-drive', upload.single('file'), resourceController.uploadResourceToDrive);
router.patch('/:id/vote', verifyToken, resourceController.voteResource);
router.delete('/:id', verifyToken, verifyAdmin, resourceController.deleteResource);

module.exports = router;
