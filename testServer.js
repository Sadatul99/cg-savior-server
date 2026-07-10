const express = require('express');
const multer = require('multer');
const { uploadResourceFile } = require('./services/googleDriveService');

const app = express();

function DriveStorage() {}
DriveStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  // file.stream is a Readable stream in multer v2
  // We mock uploadResourceFile behavior since we can't test actual Drive upload easily without credentials here,
  // but wait, we HAVE credentials in the server!
  // I will just pipe to a dummy stream if needed, or better, we can test it directly!
  let bytesRead = 0;
  file.stream.on('data', chunk => bytesRead += chunk.length);
  file.stream.on('end', () => cb(null, { size: bytesRead }));
  file.stream.on('error', cb);
};
DriveStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  cb(null);
};

const upload = multer({
  storage: new DriveStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.send({ success: true, file: req.file });
});

app.use((err, req, res, next) => {
  res.status(500).json({ customError: true, message: err.message });
});

app.listen(3001, () => console.log('Test streaming server on 3001'));

