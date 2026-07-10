const express = require('express');
const os = require('os');
const multer = require('multer');

const app = express();
const upload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir()
  }),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.send({ success: true, file: req.file });
});

// Custom error handler to capture multer errors
app.use((err, req, res, next) => {
  res.status(500).json({ customError: true, message: err.message, stack: err.stack });
});

app.listen(3001, () => console.log('Test server on 3001'));
