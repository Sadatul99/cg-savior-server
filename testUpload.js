require('dotenv').config();
const { uploadResourceFile } = require('./services/googleDriveService');

async function testUpload() {
  try {
    console.log("Creating dummy buffer of 75MB...");
    const dummyBuffer = Buffer.alloc(75 * 1024 * 1024, 'a');
    
    const dummyFile = {
      originalname: 'test_upload.txt',
      mimetype: 'text/plain',
      buffer: dummyBuffer
    };

    console.log("Uploading...");
    const result = await uploadResourceFile(dummyFile);
    console.log("Success:", result);
  } catch (error) {
    console.error("Failed to upload:");
    console.error(error);
  }
}

testUpload();
