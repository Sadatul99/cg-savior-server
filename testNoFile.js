async function testNoFile() {
  const formData = new FormData();
  // We send an empty form data with NO file field
  
  try {
    const response = await fetch('https://cg-savior-server.onrender.com/resources/upload-to-drive', {
      method: 'POST',
      body: formData,
    });
    console.log("Status:", response.status);
    console.log("Body:", await response.text());
  } catch(e) {
    console.log("Error:", e.message);
  }
}

testNoFile();
