const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

// Files are stored on disk under server/uploads and served at /api/uploads/<file>.
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10);
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, name);
  },
});

// 20 MB per file cap.
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

function publicUrl(filename) {
  return `/api/uploads/${filename}`;
}

module.exports = { upload, UPLOAD_DIR, publicUrl };
