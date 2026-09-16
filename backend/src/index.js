const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db'); // initialize DB + schema on boot
const { UPLOAD_DIR } = require('./storage');

const app = express();
app.use(cors()); // same-origin in prod (nginx); permissive is fine for the dev proxy
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Serve uploaded files (property photos, documents).
app.use('/api/uploads', express.static(UPLOAD_DIR));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/day-blocks', require('./routes/dayBlocks'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/calls', require('./routes/calls'));
app.use('/api/visits', require('./routes/visits'));
app.use('/api/comptes-rendus', require('./routes/comptesRendus'));

// 404 for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Route introuvable.' }));

// Central error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`ImmoGest API en écoute sur le port ${PORT}`));
