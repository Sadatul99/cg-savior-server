async function pingServer() {
  try {
    const res = await fetch('https://cg-savior-server.onrender.com/health');
    console.log("Health:", res.status, await res.text());
  } catch(e) {
    console.log("Health error:", e.message);
  }
}

async function uploadFile() {
  console.log("Uploading 65MB...");
  const dummyBuffer = Buffer.alloc(65 * 1024 * 1024, 'a');
  const blob = new Blob([dummyBuffer], { type: 'text/plain' });
  const formData = new FormData();
  formData.append('file', blob, 'test_upload_75mb.txt');

  try {
    const response = await fetch('https://cg-savior-server.onrender.com/resources/upload-to-drive', {
      method: 'POST',
      body: formData,
    });
    console.log("Upload Status:", response.status);
    console.log("Upload Body:", await response.text());
  } catch(e) {
    console.log("Upload error:", e.message);
  }
}

async function runTest() {
  await pingServer();
  const uploadPromise = uploadFile();
  
  for(let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 2000));
    await pingServer();
  }
  
  await uploadPromise;
  await pingServer();
}

runTest();
