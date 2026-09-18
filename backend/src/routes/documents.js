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

// GET /api/documents — all documents in tenant, optionally filtered by ?propertyId.
router.get('/', (req, res) => {
  const rows = req.query.propertyId
    ? db.prepare('SELECT * FROM documents WHERE tenant_id = ? AND property_id = ? ORDER BY created_at DESC').all(req.tenantId, req.query.propertyId)
    : db.prepare('SELECT * FROM documents WHERE tenant_id = ? ORDER BY created_at DESC').all(req.tenantId);
  res.json(rows.map(documentToJSON));
});

// POST /api/documents — multipart: a "file" plus metadata fields. Links to a
// property (propertyId) and/or client (clientId).
router.post('/', upload.single('file'), (req, res) => {
  const b = req.body;
  if (!b.title?.trim()) return res.status(400).json({ error: 'Le titre est obligatoire.' });

  const id = `doc-${Date.now()}`;
  db.prepare(`
    INSERT INTO documents (id, tenant_id, type, title, property_id, client_id, status, url, size, created_at, expires_at, signed_at)
    VALUES (@id, @tenant_id, @type, @title, @property_id, @client_id, @status, @url, @size, @created_at, @expires_at, @signed_at)
  `).run({
    id,
    tenant_id: req.tenantId,
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

  res.status(201).json(documentToJSON(db.prepare('SELECT * FROM documents WHERE id = ? AND tenant_id = ?').get(id, req.tenantId)));
});

// DELETE /api/documents/:id — admin only within tenant.
router.delete('/:id', requireRole('admin'), (req, res) => {
  db.prepare('DELETE FROM documents WHERE id = ? AND tenant_id = ?').run(req.params.id, req.tenantId);
  res.json({ ok: true });
});

module.exports = router;
