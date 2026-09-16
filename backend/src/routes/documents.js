const express = require('express');
const db = require('../db');
const { protect, requireRole } = require('../middleware/auth');
const { documentToJSON } = require('../mappers');
const { upload, publicUrl } = require('../storage');

const router = express.Router();
router.use(protect);

function humanSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

// GET /api/documents — all documents, optionally filtered by ?propertyId.
router.get('/', (req, res) => {
  const rows = req.query.propertyId
    ? db.prepare('SELECT * FROM documents WHERE property_id = ? ORDER BY created_at DESC').all(req.query.propertyId)
    : db.prepare('SELECT * FROM documents ORDER BY created_at DESC').all();
  res.json(rows.map(documentToJSON));
});

// POST /api/documents — multipart: a "file" plus metadata fields. Links to a
// property (propertyId) and/or client (clientId).
router.post('/', upload.single('file'), (req, res) => {
  const b = req.body;
  if (!b.title?.trim()) return res.status(400).json({ error: 'Le titre est obligatoire.' });

  const id = `doc-${Date.now()}`;
  db.prepare(`
    INSERT INTO documents (id, type, title, property_id, client_id, status, url, size, created_at, expires_at, signed_at)
    VALUES (@id, @type, @title, @property_id, @client_id, @status, @url, @size, @created_at, @expires_at, @signed_at)
  `).run({
    id,
    type: b.type || 'autre',
    title: String(b.title).trim(),
    property_id: b.propertyId || null,
    client_id: b.clientId || null,
    status: b.status || 'brouillon',
    url: req.file ? publicUrl(req.file.filename) : null,
    size: req.file ? humanSize(req.file.size) : (b.size || ''),
    created_at: new Date().toISOString().split('T')[0],
    expires_at: b.expiresAt || null,
    signed_at: b.signedAt || null,
  });

  res.status(201).json(documentToJSON(db.prepare('SELECT * FROM documents WHERE id = ?').get(id)));
});

// DELETE /api/documents/:id — admin only.
router.delete('/:id', requireRole('admin'), (req, res) => {
  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
