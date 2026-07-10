async function testLiveUpload() {
  try {
    console.log("Creating dummy buffer of 75MB...");
    const dummyBuffer = Buffer.alloc(75 * 1024 * 1024, 'a');
    
    // Convert Buffer to Blob for fetch
    const blob = new Blob([dummyBuffer], { type: 'text/plain' });
    
    const formData = new FormData();
    formData.append('file', blob, 'test_upload_75mb.txt');

    console.log("Uploading to local test server...");
    const response = await fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: formData,
      // No Content-Type header needed, fetch sets it automatically with boundary for FormData
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Upload failed.");
      console.error("Status:", response.status);
      console.error("Response data:", responseText);
    } else {
      console.log("Success:", responseText);
    }
  } catch (error) {
    console.error("Upload failed with error message:", error.message);
  }
}

testLiveUpload();
