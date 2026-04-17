'use strict';
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendError } = require('../utils/response.utils');

// On Vercel, /var/task/ is read-only. Only /tmp is writable in serverless.
// Locally and in Docker, use the configured UPLOAD_DIR.
const uploadDir = process.env.VERCEL
  ? '/tmp/uploads'
  : path.resolve(process.env.UPLOAD_DIR || 'uploads');

// Ensure uploads directory exists (may already exist on warm invocations)
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('[upload] Could not create upload dir:', uploadDir, e.message);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    files: parseInt(process.env.MAX_FILES || '3', 10),
  },
});

/**
 * Multer error handler middleware
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 400, 'File too large. Maximum allowed size is 5 MB.');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return sendError(res, 400, 'Too many files. Maximum 3 files allowed per task.');
    }
    return sendError(res, 400, `Upload error: ${err.message}`);
  }
  if (err && err.message === 'Only PDF files are allowed.') {
    return sendError(res, 400, 'Only PDF files are allowed.');
  }
  next(err);
};

module.exports = { upload, handleUploadError };
