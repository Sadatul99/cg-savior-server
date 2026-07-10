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

const fs = require('fs');

// Kept for clients already deployed with the browser-to-Google-Drive upload flow.
const generateResumableUploadUrl = async ({ originalname, mimetype }) => {
  const drive = getDriveClient();
  const metadata = { name: originalname };

  if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
    metadata.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
  }

  const token = await drive.context._options.auth.getAccessToken();
  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': mimetype || 'application/octet-stream',
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create Google Drive upload session (${response.status}).`);
  }

  const uploadUrl = response.headers.get('location');
  if (!uploadUrl) {
    throw new Error('Google Drive did not return an upload URL.');
  }

  return uploadUrl;
};

const getFilePublicLink = async (fileId) => {
  const drive = getDriveClient();

  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  const publicFile = await drive.files.get({
    fileId,
    fields: 'id, name, webViewLink',
  });

  return publicFile.data;
};

const uploadResourceFile = async ({ stream, originalname, mimetype }) => {
  const drive = getDriveClient();
  const fileMetadata = {
    name: originalname,
  };

  if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
    fileMetadata.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
  }

  // Use resumable upload for all files — required for files over 5MB.
  // The googleapis library handles chunking automatically when uploadType is 'resumable'.
  const uploaded = await drive.files.create(
    {
      requestBody: fileMetadata,
      uploadType: 'resumable',
      media: {
        mimeType: mimetype || 'application/octet-stream',
        body: stream,
      },
      fields: 'id, name, webViewLink',
    }
  );

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
  generateResumableUploadUrl,
  getFilePublicLink,
  uploadResourceFile,
};
