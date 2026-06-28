const { Readable } = require('stream');
const { google } = require('googleapis');

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

const getDriveClient = () => {
  const {
    GOOGLE_DRIVE_CLIENT_ID,
    GOOGLE_DRIVE_CLIENT_SECRET,
    GOOGLE_DRIVE_REDIRECT_URI,
    GOOGLE_DRIVE_REFRESH_TOKEN,
  } = process.env;

  if (!GOOGLE_DRIVE_CLIENT_ID || !GOOGLE_DRIVE_CLIENT_SECRET || !GOOGLE_DRIVE_REFRESH_TOKEN) {
    throw new Error('Google Drive OAuth credentials are missing on the server.');
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_DRIVE_CLIENT_ID,
    GOOGLE_DRIVE_CLIENT_SECRET,
    GOOGLE_DRIVE_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: GOOGLE_DRIVE_REFRESH_TOKEN,
  });

  return google.drive({
    version: 'v3',
    auth: oauth2Client,
  });
};

const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

const uploadResourceFile = async (file) => {
  if (!file) {
    throw new Error('No file was provided for upload.');
  }

  const drive = getDriveClient();
  const fileMetadata = {
    name: file.originalname,
  };

  if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
    fileMetadata.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
  }

  const uploaded = await drive.files.create({
    requestBody: fileMetadata,
    media: {
      mimeType: file.mimetype || 'application/octet-stream',
      body: bufferToStream(file.buffer),
    },
    fields: 'id, name, webViewLink',
  });

  await drive.permissions.create({
    fileId: uploaded.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  const publicFile = await drive.files.get({
    fileId: uploaded.data.id,
    fields: 'id, name, webViewLink',
  });

  return publicFile.data;
};

module.exports = {
  DRIVE_SCOPE,
  uploadResourceFile,
};
