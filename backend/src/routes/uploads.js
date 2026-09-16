const express = require('express');
const { protect } = require('../middleware/auth');
const { upload, publicUrl } = require('../storage');

const router = express.Router();

// POST /api/uploads — multipart, field name "files" (one or many).
// Returns [{ url, name, size }] for each stored file (e.g. property photos).
router.post('/', protect, upload.array('files', 20), (req, res) => {
  const files = (req.files || []).map((f) => ({
    url: publicUrl(f.filename),
    name: f.originalname,
    size: f.size,
  }));
  res.status(201).json(files);
});

module.exports = router;
